# Spec: Legacy delegations from the ecdsa_storage canister instead of the AWS lambda

> Status: APPROVED
> Story: sc-19796
> Created: 2026-09-17

## Overview

Accounts with anchor < 200_000_000 get their global and anonymous delegations from the AWS lambda
(`sms-sender-serverless`: `/ecdsa_register` + `/ecdsa_sign` / `/ecdsa_get_anonymous`). The same signing
logic now runs in the `ecdsa_storage` canister (identity-manager repo), verified bit-for-bit against the
lambda. This change makes the frontend call the canister for those delegations. Principals do not change.

Authorization moves from "lambda calls `get_root_certified` with a delegation to a temp key stored in
DynamoDB" to "the frontend calls `im.get_root_certified()` as the user and passes the certified response
to the canister". The canister verifies the IC certificate, that the witness maps the caller to the root,
and that the anchor is legacy. The Identity Manager's 2FA check on `get_root_certified` is preserved.

## Scope

- Package: `packages/integration` (delegation layer) + env/config plumbing. No UI changes.
- Entry points (unchanged callers): `getGlobalDelegationChain`, `getGlobalDelegation`,
  `getAnonymousDelegation`, `getPublicKey` in `delegation-factory/delegation-i.ts`, for legacy anchors.
- Environments: enabled where `ECDSA_STORAGE_CANISTER_ID` is set (dev, test, local →
  `zhr63-daaaa-aaaap-qbh4q-cai`). Stage/prod keep the lambda until the canister is deployed there.
- No new global keys: with the canister enabled `ecdsaRegisterNewKeyPair` throws instead of calling
  `/ecdsa_register_address` (all legacy keys already exist and were copied from `signer_ic`).
- Out of scope: `execute-canister-call.ts` (`/execute_candid`) stays on the lambda.

## Flow (legacy account, env with the canister)

1. Caller asks for a delegation (e.g. ICRC-34 global/anonymous, wallet global identity).
2. `im.get_root_certified()` with the user's delegation identity → `{ response: root, certificate, witness }`.
   IM traps for Email/Unknown access points of 2FA-enabled accounts → error propagates as today.
3. Update call with the same identity:
   - global: `ecdsa_storage.get_global_delegation({ certified_root, session_key, targets, delegation_ttl_ms })`
   - anonymous: `ecdsa_storage.get_anonymous_delegation({ certified_root, domain, session_key, targets, delegation_ttl_ms })`
4. `Ok` → `DelegationChain.fromDelegations([{ delegation: new Delegation(pubkey, expiration, targets), signature }], public_key)`;
   `Err(text)` → `throw new Error(text)`.

## States

| State    | Trigger                                   | Behavior                                         |
| -------- | ----------------------------------------- | ------------------------------------------------ |
| success  | canister returns `Ok`                     | same `DelegationChain` shape as the lambda flow  |
| im error | `get_root_certified` traps (2FA, unknown) | error thrown to the caller (as lambda 401 today) |
| rejected | canister returns `Err`                    | `Error(message)` thrown                          |
| fallback | `ECDSA_STORAGE_CANISTER_ID` empty         | existing lambda code path, untouched             |

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
- Pre-existing blocker (not fixed here): jest 30 refuses to `require` the ESM-only `@icp-sdk/canisters` 3.6.0
  (`"type": "module"`) since `ba418d7cc`, so the `integration` suite does not start. The specs were run
  with a local jest ESM harness (`--experimental-vm-modules`) instead; fixing the repo jest setup is separate.

## Risks

- Stage/prod unaffected until the env var is set there.
- Dev canister must have the salts provisioned and global keys imported, otherwise it returns
  `Salts are not provisioned` / `No global key for this account`.
