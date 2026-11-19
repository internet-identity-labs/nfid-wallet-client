# Plan: Honor maxTimeToLive for anonymous canister-signed delegations

> Status: IMPLEMENTED — tasks 1–3 done; task 4 (dev e2e) waits for deploy
> Branch: `fix/anonymous-delegation-max-ttl`
> Spec: .claude/specs/anonymous-delegation-max-ttl.spec.md
> Created: 2026-11-19

## Summary

One-line fix in `getAnonymousDelegation()`: forward `maxTimeToLive` to
`getDelegationChainSignedByCanister()` in the delegation-factory branch. Plus a new
mocked unit test for `getAnonymousDelegation()`. No UI, no XState, no atoms.

## New Files

| File                                                                   | Type      | Purpose                                                                                                                          |
| ---------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `packages/integration/src/lib/delegation-factory/delegation-i.spec.ts` | Unit test | `getAnonymousDelegation` branch + TTL forwarding; `./delegation-factory`, `../lambda/lambda-delegation`, `authState` are mocked. |

## Modified Files

| File                                                              | Change                                                                                                         |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `packages/integration/src/lib/delegation-factory/delegation-i.ts` | In `getAnonymousDelegation`, pass `maxTimeToLive` as the 6th argument of `getDelegationChainSignedByCanister`. |

## Types

- None.

## XState / State Changes

- None.

## Atoms / Context

- None.

## Tasks

- [x] 1. Write `delegation-i.spec.ts` (fails on current code for the TTL case):
  - anchor `200_000_293n`, ttl `1_800_000` → `getDelegationChainSignedByCanister` called with
    `(identity, targets, sessionKey, 200_000_293n, domain, 1_800_000)`.
  - anchor `200_000_293n`, no ttl → last argument `ONE_HOUR_IN_MS * 2`.
  - anchor `10_974n` → `getAnonymousDelegationThroughLambda(domain, sessionKey, identity, ttl, targets)`,
    `getDelegationChainSignedByCanister` not called.
- [x] 2. Apply the fix in `delegation-i.ts`; spec passes.
- [x] 3. Verify: `yarn nx test integration --testFile=delegation-i.spec.ts`,
      `yarn nx lint integration`, typecheck (`tsc --noEmit -p apps/nfid-frontend/tsconfig.json`),
      `yarn format:check` on changed files.
- [ ] 4. After deploy to dev (outside this plan's CI): run identitykit react-demo
      "Delegation login method with legacy_0 profile" e2e tests.

  Verified locally on 2026-11-19 against an `nx build` of this branch served on
  `localhost:9090` (dev canisters): the 3 tests pass; on dev.nfid.one without the fix they
  fail. Still to re-run on dev after deploy.
