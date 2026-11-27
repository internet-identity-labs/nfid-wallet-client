# Plan: Stay Signing UI Preference & Local Storage Handling

> Status: IN PROGRESS
> Spec: .claude/specs/stay-signing-preference.spec.md
> Created: 2026-11-25 · Revised: 2026-11-27
> Branch: `feature/sc-19807-implement-stay-signing-ui-preference-local`

## New Files

| File                                                                       | Change                      |
| -------------------------------------------------------------------------- | --------------------------- |
| `packages/ui/src/organisms/authentication/stay-signed-in/index.tsx`        | `StaySignedIn` UI component |
| `packages/ui/src/organisms/authentication/stay-signed-in/stay-sign-in.png` | Illustration asset          |

## Modified Files

| File                                                                  | Change                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/nfid-frontend/src/features/authentication/root/root-machine.ts` | Import `rememberMeService`; add `wasRemembered` to context (captured at machine init); add `isRemembered` guard reading `context.wasRemembered`; add `doNotRememberMeService` actor; add `CheckSignedIn`, `StaySignedIn`, `DoNotRememberMe` states; redirect all auth-completion paths to `CheckSignedIn` |
| `apps/nfid-frontend/src/features/authentication/root/coordinator.tsx` | Add `StaySignedIn` case; import `StaySignedIn` component; add debug `console.log`                                                                                                                                                                                                                         |

## Implementation Checklist

### State machine

- [x] `root-machine.ts` — import `rememberMeService` from `@nfid/integration`
- [x] `root-machine.ts` — add `wasRemembered: rememberMeService.isRemembered()` to machine context initializer (captured before auth writes `anchor`)
- [x] `root-machine.ts` — add `isRemembered` guard: `({ context }) => !!context.wasRemembered`
- [x] `root-machine.ts` — add `doNotRememberMeService` actor: `fromPromise(() => rememberMeService.doNotRememberMe())`
- [x] `root-machine.ts` — add `CheckSignedIn` state with `always` guard
- [x] `root-machine.ts` — add `StaySignedIn` state: `STAY_SIGNED_IN → End`, `DO_NOT_STAY_SIGNED_IN → DoNotRememberMe`
- [x] `root-machine.ts` — add `DoNotRememberMe` state: awaits `doNotRememberMeService`, then `End`
- [x] `root-machine.ts` — redirect all auth-completion `target: "End"` paths to `target: "CheckSignedIn"`

### Coordinator

- [x] `coordinator.tsx` — import `StaySignedIn` from `packages/ui/src/organisms/authentication/stay-signed-in`
- [x] `coordinator.tsx` — add `state.matches("StaySignedIn")` case wired to `STAY_SIGNED_IN` / `DO_NOT_STAY_SIGNED_IN`

### Verification

- [ ] `yarn nx lint nfid-wallet-client` — zero new errors
- [ ] `npx tsc --noEmit -p apps/nfid-frontend/tsconfig.app.json` — zero errors

## Risks & Notes

- `wasRemembered` is captured at machine creation time — before any auth writes `anchor` to localStorage. This is the key fix: checking `isRemembered()` after auth always returns `true` because auth itself writes `anchor`.
- `DoNotRememberMe` is an async invoke state so the machine awaits `doNotRememberMe()` before proceeding to `End`.
- `CheckSignedIn` has no UI; the `always` transition fires synchronously before React re-renders.
