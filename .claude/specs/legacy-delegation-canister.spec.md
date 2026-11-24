# Spec: Legacy delegations from the ecdsa_storage canister instead of the AWS lambda

> Status: APPROVED — revision 2026-11-23: lambda first, canister as fallback (sticky)
> Story: sc-19796
> Created: 2026-09-17

## Overview

Accounts with anchor < 200_000_000 get their global and anonymous delegations from the AWS lambda
(`sms-sender-serverless`: `/ecdsa_register` + `/ecdsa_sign` / `/ecdsa_get_anonymous`). The same signing
logic now runs in the `ecdsa_storage` canister (identity-manager repo), verified bit-for-bit against the
lambda. This change makes the frontend call the canister for those delegations. Principals do not change.

**Revision 2026-11-24 — the canister is `signer_ic`.** Requested by the engineer: the signing code and the
lambda salts moved into `signer_ic` (`ecdsa_signer` in identity-manager), which already stores the legacy
global keys; `ecdsa_storage` is no longer used. Everywhere below, "the canister" / `ecdsa_storage` means
`signer_ic` and `ECDSA_STORAGE_CANISTER_ID` means the existing `IC_SIGNER_CANISTER_ID` (dev/test/local
`nux62-yqaaa-aaaak-ae2pq-cai`, stage `gzqxf-…`, prod `us7ed-…`). `ECDSA_STORAGE_CANISTER_ID` is removed
from env files, webpack and jest globals. The fallback is therefore configured in every environment; on an
environment whose `signer_ic` is not upgraded yet (prod, upgraded through the SNS) the canister call fails
and its error is thrown, as when both paths fail. The delegation methods of `signer_ic` have the same
Candid types as the generated `_ic_api/ecdsa_storage` IDL, which is reused (the guard blocks `_ic_api/`).
Sticky key: `nfid.legacySigner.canisterOnly.<IC_SIGNER_CANISTER_ID>`.

**Revision 2026-11-23 — lambda first, canister as fallback.** The lambda stays the primary path. The
frontend calls the canister only when the lambda call fails (any error: network/CORS failure when the
endpoint is removed, any non-2xx status). This lets the lambda endpoints be switched off without a
frontend release. Where `ECDSA_STORAGE_CANISTER_ID` is empty there is no fallback: the lambda error is
thrown as before.

**Sticky canister.** Once the canister answered after a failed lambda call, the browser remembers it in
`localStorage` (key `nfid.legacySigner.canisterOnly.<ECDSA_STORAGE_CANISTER_ID>` = `"1"`) and from then
on calls only the canister, skipping the lambda. The key contains the canister id, so a different canister
starts over from the lambda. `localStorage` access is wrapped in `try/catch`: if it is unavailable the
flag is simply not kept (lambda first on every call).

Authorization moves from "lambda calls `get_root_certified` with a delegation to a temp key stored in
DynamoDB" to "the frontend calls `im.get_root_certified()` as the user and passes the certified response
to the canister". The canister verifies the IC certificate, that the witness maps the caller to the root,
and that the anchor is legacy. The Identity Manager's 2FA check on `get_root_certified` is preserved.

## Scope

- Package: `packages/integration` (delegation layer) + env/config plumbing. No UI changes.
- Entry points (unchanged callers): `getGlobalDelegationChain`, `getGlobalDelegation`,
  `getAnonymousDelegation`, `getPublicKey` in `delegation-factory/delegation-i.ts`, for legacy anchors.
- Environments: fallback enabled where `ECDSA_STORAGE_CANISTER_ID` is set (dev, test, local →
  `zhr63-daaaa-aaaap-qbh4q-cai`; prod: already set by CI at build time, `.env.ic` is not changed).
  Stage: lambda only while the variable is empty.
- Signing functions with fallback (`lambda-delegation.ts`): `getAnonymousDelegationThroughLambda`,
  `oldFlowGlobalKeysFromLambda`, `oldFlowDelegationChainLambda`. The whole lambda flow
  (`/ecdsa_register` temp key + `/ecdsa_sign` or `/ecdsa_get_anonymous`) is one attempt.
- `ecdsaRegisterNewKeyPair` always calls `/ecdsa_register_address` (no longer throws when the canister is
  configured). The canister cannot create keys, so it has no fallback: its error is thrown.
- Out of scope: `execute-canister-call.ts` (`/execute_candid`) stays on the lambda.

## Flow (legacy account, env with the canister)

1. Caller asks for a delegation (e.g. ICRC-34 global/anonymous, wallet global identity).
   If the sticky flag is set, go straight to step 2. Otherwise the existing lambda flow runs first; on success its `DelegationChain` is returned and steps 2–4 are skipped.
   On any error, it is logged with `console.warn` and the canister flow below runs.
2. `im.get_root_certified()` with the user's delegation identity → `{ response: root, certificate, witness }`.
   IM traps for Email/Unknown access points of 2FA-enabled accounts → error propagates as today.
3. Update call with the same identity:
   - global: `ecdsa_storage.get_global_delegation({ certified_root, session_key, targets, delegation_ttl_ms })`
   - anonymous: `ecdsa_storage.get_anonymous_delegation({ certified_root, domain, session_key, targets, delegation_ttl_ms })`
4. `Ok` → `DelegationChain.fromDelegations([{ delegation: new Delegation(pubkey, expiration, targets), signature }], public_key)`;
   `Err(text)` → `throw new Error(text)`.
   A canister `Ok` reached after a lambda failure sets the sticky flag.
5. Anonymous: `deleteFromStorage(domain)` runs after either path succeeds, outside the fallback, so its own
   failure does not trigger the canister call.

## States

| State       | Trigger                                                 | Behavior                                                                |
| ----------- | ------------------------------------------------------- | ----------------------------------------------------------------------- |
| lambda ok   | lambda flow succeeds                                    | lambda `DelegationChain` returned, canister not called                  |
| canister ok | lambda fails, canister returns `Ok`                     | canister `DelegationChain` (same shape and principals); sticky flag set |
| sticky      | flag set for this canister id                           | canister only; its errors are thrown, no lambda retry                   |
| im error    | lambda fails, `get_root_certified` traps (2FA, unknown) | canister-path error thrown (lambda error only in `console.warn`)        |
| rejected    | lambda fails, canister returns `Err`                    | `Error(message)` thrown                                                 |
| no canister | lambda fails, `ECDSA_STORAGE_CANISTER_ID` empty         | lambda error thrown, as before                                          |

## Data & State Design

- New env var `ECDSA_STORAGE_CANISTER_ID` (webpack-env, jest globals, `types/env`, `.env.*`).
- New IDL `packages/integration/src/lib/_ic_api/ecdsa_storage.{ts,d.ts}` from `ecdsa_storage.did`.
- `get_root_certified` added to the frontend Identity Manager IDL (exists in IM candid).
- Actors are created per call with the user's identity (no shared mutable identity).
- No XState/Jotai changes.

## Testing

- Existing `packages/integration/src/lib/lambda/ecdsa.spec.ts` (real dev network, legacy test account) must
  pass unchanged: same global principal `5vmgr-…` and anonymous principal `hnjwm-…` as with the lambda.
- New unit test for the candid → `DelegationChain` mapping and `Err` handling.
- Unit tests for the fallback helper: lambda ok → canister not called; lambda fails → canister result;
  both fail → canister error, flag not set; no canister configured → lambda error, canister not called;
  canister ok after lambda failure → flag set and the next call skips the lambda; flag for another
  canister id → lambda first.
- Pre-existing blocker (not fixed here): jest 30 refuses to `require` the ESM-only `@icp-sdk/canisters` 3.6.0
  (`"type": "module"`) since `ba418d7cc`, so the `integration` suite does not start. The specs were run
  with a local jest ESM harness (`--experimental-vm-modules`) instead; fixing the repo jest setup is separate.

## Risks

- The sticky flag is per browser, not per account, and is never cleared by the app: after one lambda failure
  (even a transient 5xx) followed by a canister success, that browser stays on the canister. Intended,
  since the canister gives the same principals.
- Prod gets the fallback as soon as this ships (canister id comes from CI). While the lambda works nothing changes; when it fails, the
  canister must already hold the salts and keys, otherwise the user sees the canister error
  (`Salts are not provisioned` / `No global key for this account`) instead of the lambda one.
- Any lambda failure (including a 401 from the 2FA check or a transient 5xx) also goes to the canister. That
  is intended: the canister repeats the same IM 2FA check, so it rejects the same callers.
- An extra request (the failing lambda call) on every legacy delegation once the lambda is off.
- Dev canister must have the salts provisioned and global keys imported, otherwise it returns
  `Salts are not provisioned` / `No global key for this account`.
