# Spec: ICP SDK Max Version Upgrade

> Status: APPROVED
> Created: 2026-09-15
> Approved: 2026-09-15

## Overview

Bump the ICP SDK dependency family (`@icp-sdk/core`, `@icp-sdk/auth`, `@icp-sdk/canisters`, `@dfinity/utils`) in root `package.json` to the maximum versions that remain mutually peer-compatible. Verified directly against the npm registry: `@icp-sdk/core` (5.4.0) and `@icp-sdk/canisters` (3.6.0) are already at their ceiling, since every published `@icp-sdk/auth` release up to 8.0.3 and the latest `@icp-sdk/canisters` still peer-depend on `@icp-sdk/core@^5` — no combination exists yet where `@icp-sdk/core@6.x` is usable alongside them. `@dfinity/utils` is already at its latest published version (4.2.1). The only package that actually moves is `@icp-sdk/auth`, from `7.1.0` to `8.0.3` (a major bump).

This is a dependency-version task, not a new UI feature: there is no new screen, flow, or component state to design. The "spec" here defines the upgrade scope and the verification gate instead of a UX flow.

## Scope

- App/area: repo-wide (root `package.json` is the only manifest referencing these packages)
- Entry point: manual dependency bump, not a user-triggered flow
- Exit state: `yarn.lock` refreshed, typecheck/lint/unit tests pass, diff reviewed

## Package Version Changes

| Package              | Current | Target | Change                     |
| -------------------- | ------- | ------ | -------------------------- |
| `@icp-sdk/core`      | 5.4.0   | 5.4.0  | No change (at ceiling)     |
| `@icp-sdk/auth`      | 7.1.0   | 8.0.3  | Major bump                 |
| `@icp-sdk/canisters` | 3.6.0   | 3.6.0  | No change (at ceiling)     |
| `@dfinity/utils`     | 4.2.1   | 4.2.1  | No change (already latest) |

## Breaking Change Assessment

`@icp-sdk/auth` 8.0.0 changed `AuthClient.requestAttributes`'s `nonce` parameter from `Uint8Array | Promise<Uint8Array>` to a callback `() => Promise<Uint8Array>`. Everything else between 7.1.0 and 8.0.3 is bug fixes plus a transitive `@icp-sdk/signer` bump to 5.6.2.

## Task Sequence (in place of a UI "user flow")

1. Re-run `grep -rl "requestAttributes" apps packages` at execution time as a defensive check (confirmed clean as of this spec's writing — re-verify since new usage could have been added since).
2. Update `@icp-sdk/auth` to `8.0.3` in root `package.json`.
3. Refresh `yarn.lock`.
4. Run typecheck, lint, and unit tests for affected projects.
5. Review the `yarn.lock` diff — expect changes scoped to `@icp-sdk/auth` and its transitive `@icp-sdk/signer` bump only. Any unrelated diff noise is a signal to stop and investigate before proceeding.

## Component States

Not applicable — no UI states are introduced by this change.

## Data & State Design

Not applicable — no new data fetching, mutations, or global state. Existing consumers (`session-handling.ts` using `IdleManager.create()`, `useAuthentication.ts` using the `AuthClient` constructor and `signIn()`) use only APIs stable well before 7.1.0 and are expected to be unaffected.

## Accessibility

Not applicable — no UI surface changes.

## Responsive Behavior

Not applicable.

## Edge Cases

- If `requestAttributes` usage is found during the re-grep step (step 1), stop and assess the callback-signature migration before proceeding with the bump.
- If `yarn.lock` shows changes beyond `@icp-sdk/auth`/`@icp-sdk/signer`, stop and investigate before treating the upgrade as complete.

## Out of Scope

- Bumping `@icp-sdk/core`, `@icp-sdk/canisters`, or `@dfinity/utils` — none can move further without a peer-dependency conflict as of this spec's writing.
- Manual browser smoke test of sign-in/session flows (explicitly excluded per engineer's exit-criteria choice — typecheck/lint/test/lockfile-diff review only).
