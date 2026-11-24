# Plan: Legacy delegations from the ecdsa_storage canister

> Status: IMPLEMENTED — revision 2026-11-24: canister = signer_ic (IC_SIGNER_CANISTER_ID)
> Branch: feature/sc-19796-migrate-user-delegation-key-secret-management-2
> Story: sc-19796
> Spec: .claude/specs/legacy-delegation-canister.spec.md
> Created: 2026-09-17

## New Files

| File                                                        | Purpose                                                                            |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `packages/integration/src/lib/_ic_api/ecdsa_storage.ts`     | IDL factory generated from `ecdsa_storage.did`                                     |
| `packages/integration/src/lib/_ic_api/ecdsa_storage.d.ts`   | `_SERVICE` types for the canister                                                  |
| `packages/integration/src/lib/lambda/legacy-signer.ts`      | certified root + canister calls + candid → DelegationChain; `withCanisterFallback` |
| `packages/integration/src/lib/lambda/legacy-signer.spec.ts` | unit tests for mapping, `Err` handling, fallback                                   |

## Modified Files

| File                                                              | Change                                                                                                               |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `packages/integration/src/lib/_ic_api/identity_manager.{ts,d.ts}` | add `get_root_certified : () -> (CertifiedResponse) query`                                                           |
| `packages/integration/src/lib/lambda/lambda-delegation.ts`        | lambda first, `legacy-signer` as fallback in the 3 signing functions; `ecdsaRegisterNewKeyPair` always on the lambda |
| `config/webpack-env.ts`, `config/webpack-env.js`                  | expose `ECDSA_STORAGE_CANISTER_ID`                                                                                   |
| `config/jest-globals.cjs`, `config/jest-globals.js`               | `ECDSA_STORAGE_CANISTER_ID: "zhr63-daaaa-aaaap-qbh4q-cai"`                                                           |
| `types/env/index.d.ts`                                            | `declare const ECDSA_STORAGE_CANISTER_ID: string`                                                                    |
| `.env.dev`, `.env.test`, `.env.local.template`                    | `ECDSA_STORAGE_CANISTER_ID=zhr63-daaaa-aaaap-qbh4q-cai`                                                              |
| `.env.stage`, `.env.ic`                                           | `ECDSA_STORAGE_CANISTER_ID=` (empty; prod value is set by CI)                                                        |

## Implementation Checklist

<!-- Execute EXACTLY ONE checkbox at a time using /execute-ui-plan -->

### Plumbing

- [x] Add `ECDSA_STORAGE_CANISTER_ID` to webpack env, jest globals, `types/env/index.d.ts`, `.env.*`.
- [x] Add `ecdsa_storage` IDL (`.ts` + `.d.ts`) and `get_root_certified` to the Identity Manager IDL.

### Integration

- [x] `legacy-signer.ts`: `isLegacySignerEnabled()`, certified root, `getGlobalDelegationFromCanister`,
      `getAnonymousDelegationFromCanister`, `toDelegationChain`, `unwrap`; per-call agents with the user's identity.
- [x] `lambda-delegation.ts`: when enabled, `getAnonymousDelegationThroughLambda`,
      `oldFlowGlobalKeysFromLambda`, `oldFlowDelegationChainLambda` call `legacy-signer`
      (keeping `deleteFromStorage(domain)`); `ecdsaRegisterNewKeyPair` throws; otherwise the lambda code runs.

### Tests

- [x] `legacy-signer.spec.ts`: mapping keeps pubkey/expiration/targets/signature/publicKey; `Err` throws.
- [x] Run `packages/integration/src/lib/lambda/ecdsa.spec.ts` against dev (lambda and canister): same principals.
- [ ] Repo jest setup for ESM-only `@icp-sdk/canisters` — pre-existing, out of scope (see spec).

### Verification

- [x] Typecheck: no new errors (`tsc -p packages/integration/tsconfig.spec.json`; only the pre-existing TS7016).
- [x] `prettier --write` on touched files.
- [ ] `yarn nx lint integration` — blocked: ESLint 10 crashes inside `@nx/eslint-plugin` on main.
- [ ] `yarn nx serve nfid-frontend` with dev env starts; bundle compiles with the new env var.

## Revision 2026-11-23 — lambda first, canister as fallback

See the spec's Revision note, Flow and States. Same files as above; nothing new.

- [x] `legacy-signer.ts`: `withCanisterFallback(lambda, canister)`: no canister configured → `lambda()`;
      sticky flag set → `canister()`; otherwise `lambda()`, and on any error `console.warn` it, call
      `canister()`, set the flag on success. Flag in `localStorage`
      `nfid.legacySigner.canisterOnly.<ECDSA_STORAGE_CANISTER_ID>`, every access in `try/catch`.
- [x] `lambda-delegation.ts`: `getAnonymousDelegationThroughLambda`, `oldFlowGlobalKeysFromLambda`,
      `oldFlowDelegationChainLambda` wrap their existing lambda code with `withCanisterFallback`;
      `deleteFromStorage(domain)` runs after the wrapped call; drop the `ecdsaRegisterNewKeyPair` guard.
- [x] `legacy-signer.spec.ts`: fallback cases (lambda ok / lambda fails → canister + flag set / both fail,
      no flag / no canister configured / flag set → lambda skipped / flag of another canister id ignored).
- [x] Typecheck `packages/integration/tsconfig.spec.json` (same 22 pre-existing TS6307/TS7016 as before), `legacy-signer.spec.ts` 9/9 passed, prettier on touched files.
      Note: `yarn nx test integration` fails locally with `Cannot find executor 'jest'` (node_modules older than the
      branch's Nx); the spec was run with `npx jest -c packages/integration/jest.config.ts`.

## Revision 2026-11-24 — canister = signer_ic

Requested by the engineer; see the spec revision. Files are already in the tables above (`.env.*`, `types/env/index.d.ts` are root files).

- [x] `legacy-signer.ts`: actor and sticky key use `IC_SIGNER_CANISTER_ID`; reuse the `_ic_api/ecdsa_storage` IDL (same Candid types as the `signer_ic` delegation methods)
- [x] `legacy-signer.spec.ts`: tests use `IC_SIGNER_CANISTER_ID`
- [x] `lambda-delegation.ts`: comment on `ecdsaRegisterNewKeyPair`
- [x] remove `ECDSA_STORAGE_CANISTER_ID` from `config/webpack-env.{ts,js}`, `config/jest-globals.{cjs,js}`, `types/env/index.d.ts`, `.env.dev`, `.env.test`, `.env.stage`, `.env.local.template`, `.env.ic`
