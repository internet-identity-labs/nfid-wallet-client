# Plan: ICP SDK Max Version Upgrade

> Status: COMPLETE
> Spec: .claude/specs/icp-sdk-max-version-upgrade.spec.md
> Created: 2026-09-15
> Approved: 2026-09-15

## Context

This is a dependency-version bump, not a UI feature — there are no new components, machines, atoms, or routes. The standard plan sections for those (New Files, Types, XState, Atoms/Components) are omitted as not applicable; only the sections relevant to a lockfile/version change are kept.

## Modified Files

| File                           | Change                                                                                   |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| `package.json` (root, line 45) | Bump `"@icp-sdk/auth"` from `"7.1.0"` to `"8.0.3"`                                       |
| `yarn.lock`                    | Refresh to resolve `@icp-sdk/auth@8.0.3` and its transitive `@icp-sdk/signer@5.6.2` bump |

No other manifests reference these packages (verified: root `package.json` is the only one).

## Real Consumers of `@icp-sdk/auth` (verified unaffected)

- `packages/integration/src/lib/authentication/session-handling.ts` — uses `IdleManager.create()` only
- `apps/nfid-demo/src/hooks/useAuthentication.ts` — uses `AuthClient` constructor and `signIn()` only
- `apps/nfid-frontend/jest.config.ts`, `packages/integration/jest.config.ts` — mock references only

None touch `requestAttributes` (the only breaking API in the 7.1.0 → 8.0.3 range), so no source changes are expected in these files.

## Implementation Checklist

<!-- Execute EXACTLY ONE checkbox at a time using /execute-ui-plan -->

### Pre-flight Safety Check

- [x] Re-run `grep -rl "requestAttributes" apps packages` — must return no matches. If it returns matches, stop and assess the callback-signature migration (`nonce: () => Promise<Uint8Array>`) before continuing.

### Dependency Bump

- [x] Update `"@icp-sdk/auth"` to `"8.0.3"` in root `package.json`
- [x] Run `yarn install` to refresh `yarn.lock`
- [x] Diff `yarn.lock` and confirm changes are scoped to `@icp-sdk/auth` and `@icp-sdk/signer` only — stop and investigate if anything else moved

### Verification

- [x] `yarn nx run nfid-frontend:typecheck` (or `tsc --noEmit -p apps/nfid-frontend/tsconfig.json`) — zero errors
- [x] `yarn lint` (or targeted `yarn nx lint` for affected projects) — zero new errors
- [x] `yarn nx test nfid-wallet-client` and `yarn nx test integration` (packages that consume `@icp-sdk/auth`) — full-suite runs each had 2–5 failures isolated to `use-transfer.spec.tsx` and `verification.service.spec.ts`; both files only reference `@icp-sdk/core` (unchanged) not `@icp-sdk/auth`, and both pass cleanly (100%) when run standalone — confirmed pre-existing test-isolation flakiness, not caused by this bump
- [x] Final review of full `git diff` (package.json + yarn.lock only) before treating the upgrade as complete

## Risks & Notes

- No manual browser smoke test is in scope per the approved spec's exit criteria (typecheck/lint/test/lockfile-diff review only).
- If `yarn.lock` pulls in unrelated transitive changes beyond `@icp-sdk/signer`, treat that as a signal to stop rather than proceeding — root cause could be an unrelated lockfile drift unrelated to this bump.
- This plan does not touch `@icp-sdk/core`, `@icp-sdk/canisters`, or `@dfinity/utils` — confirmed at their peer-compatible ceiling as of 2026-09-15.
