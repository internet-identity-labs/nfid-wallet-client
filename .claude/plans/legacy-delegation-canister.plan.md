# Plan: Legacy delegations from the ecdsa_storage canister

> Status: COMPLETE
> Story: sc-19796
> Spec: .claude/specs/legacy-delegation-canister.spec.md
> Created: 2026-09-17

## New Files

| File                                                        | Purpose                                                    |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| `packages/integration/src/lib/_ic_api/ecdsa_storage.ts`     | IDL factory generated from `ecdsa_storage.did`             |
| `packages/integration/src/lib/_ic_api/ecdsa_storage.d.ts`   | `_SERVICE` types for the canister                          |
| `packages/integration/src/lib/lambda/legacy-signer.ts`      | certified root + canister calls + candid → DelegationChain |
| `packages/integration/src/lib/lambda/legacy-signer.spec.ts` | unit tests for mapping, `Err` handling, routing            |

## Modified Files

| File                                                              | Change                                                                         |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `packages/integration/src/lib/_ic_api/identity_manager.{ts,d.ts}` | add `get_root_certified : () -> (CertifiedResponse) query`                     |
| `packages/integration/src/lib/lambda/lambda-delegation.ts`        | use `legacy-signer` in the 3 signing functions when the canister is configured |
| `config/webpack-env.ts`, `config/webpack-env.js`                  | expose `ECDSA_STORAGE_CANISTER_ID`                                             |
| `config/jest-globals.cjs`, `config/jest-globals.js`               | `ECDSA_STORAGE_CANISTER_ID: "zhr63-daaaa-aaaap-qbh4q-cai"`                     |
| `types/env/index.d.ts`                                            | `declare const ECDSA_STORAGE_CANISTER_ID: string`                              |
| `.env.dev`, `.env.test`, `.env.local.template`                    | `ECDSA_STORAGE_CANISTER_ID=zhr63-daaaa-aaaap-qbh4q-cai`                        |
| `.env.stage`, `.env.ic`                                           | `ECDSA_STORAGE_CANISTER_ID=` (empty → lambda)                                  |

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
