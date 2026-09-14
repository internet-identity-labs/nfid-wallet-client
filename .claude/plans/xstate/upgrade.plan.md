# Plan: XState Package Upgrade (v4 → v5)

> Status: DRAFT — awaiting engineer approval
> Spec: .claude/specs/xstate/ (all specs)
> Created: 2026-09-14

## Prerequisites

This plan must be completed **before** any machine migration plan begins. All machine plans depend on the new package versions being installed and the stale typegen files being gone.

## Modified Files

| File                                                                                                    | Change                                               |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `package.json` (root)                                                                                   | Bump `xstate`, `@xstate/react`; remove `@xstate/cli` |
| `apps/nfid-frontend/src/features/authentication/auth-selection/google-flow/auth-with-google.typegen.ts` | Delete                                               |
| `apps/nfid-frontend/src/features/authentication/auth-selection/email-flow/machine.typegen.ts`           | Delete                                               |
| `apps/nfid-frontend/src/features/authentication/root/root-machine.typegen.ts`                           | Delete                                               |
| `apps/nfid-frontend/src/features/authentication/nfid/nfid-machine.typegen.ts`                           | Delete                                               |
| `apps/nfid-frontend/src/features/authentication/3rd-party/third-party-machine.typegen.ts`               | Delete                                               |
| `apps/nfid-frontend/src/features/embed/machine.typegen.ts`                                              | Delete                                               |
| `apps/nfid-frontend/src/features/identitykit/machine.typegen.ts`                                        | Delete                                               |
| `apps/nfid-frontend/src/features/transfer-modal/machine.typegen.ts`                                     | Delete                                               |

## Implementation Checklist

### Package changes

- [ ] In root `package.json`, update `"xstate": "4.38.3"` → `"xstate": "^5.0.0"`, `"@xstate/react": "3.2.2"` → `"@xstate/react": "^4.0.0"`, and remove `"@xstate/cli"` from devDependencies
- [ ] Run `yarn install` and confirm lockfile updates

### Typegen cleanup

- [ ] Delete `auth-with-google.typegen.ts`
- [ ] Delete `email-flow/machine.typegen.ts`
- [ ] Delete `root/root-machine.typegen.ts`
- [ ] Delete `nfid/nfid-machine.typegen.ts`
- [ ] Delete `3rd-party/third-party-machine.typegen.ts`
- [ ] Delete `embed/machine.typegen.ts`
- [ ] Delete `identitykit/machine.typegen.ts`
- [ ] Delete `transfer-modal/machine.typegen.ts`

### Verification

- [ ] `yarn nx typecheck nfid-frontend` — expected to fail (machines still use v4 API); confirm errors are only v4 API references, not unrelated regressions
- [ ] `yarn nx lint nfid-frontend` — confirm no new unrelated errors

## Risks & Notes

- After deleting typegen files, TypeScript will error on every `tsTypes: {} as import("...").Typegen0` reference — this is expected and resolved by the machine migration plans.
- Do not run tests after this step; the machine code will be broken until migration plans are applied.
