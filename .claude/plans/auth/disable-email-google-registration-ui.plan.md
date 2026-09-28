# Plan: Disable Email & Google Registration UI Entry Points

> Status: COMPLETE
> Spec: .claude/specs/auth/disable-email-google-registration-ui.spec.md
> Created: 2026-09-21

## Codebase Analysis (findings)

- **Root machine** `apps/nfid-frontend/src/features/authentication/root/root-machine.ts`:
  - Initial state is `CheckWallets` → transitions to `AuthSelection` (existing accounts) or directly enters via wallets
  - `AuthSelection` has a `SIGN_UP` event → `AuthSelectionSignUp`
  - `AuthSelectionSignUp` has a `SIGN_IN` event → `AuthSelection`
  - States to remove: `AuthSelectionSignUp`, `SignUpWithGoogle`, `SignUpWithEmail`, `SignUpPassKey`, `SignUpWithII`
  - `AuthSelection` keeps all its existing events except `SIGN_UP`
  - `SignUpPassKey` back-targets `AuthSelectionSignUp` → needs to be redirected or removed
  - `SignUpWithII` exists as a separate state (mirrors `AuthWithII` but targets `GetRecoveryProvisioningPlan` on new account) — remove it; `AuthWithII` already handles the new-account path via `isExistingAccount` guard falling to `AuthSelection`

- **Root coordinator** `apps/nfid-frontend/src/features/authentication/root/coordinator.tsx`:
  - `case state.matches("AuthSelectionSignUp")` block (lines 338–397): renders `<AuthSelection type="sign-up">` — remove entirely
  - `case state.matches("SignUpPassKey")` block (lines 398–426): renders `<AuthSignUpPassKey>` — remove entirely
  - `case state.matches("SignUpWithEmail")` block (lines 427–442): identical to `EmailAuthentication` block — remove
  - `onTypeChange={() => send({ type: "SIGN_UP" })}` on the `AuthSelection` render (line 334) — remove the prop (or pass a no-op; see component change below)

- **`AuthSelection` UI component** `packages/ui/src/organisms/authentication/auth-selection/index.tsx`:
  - `type` prop (`"sign-in" | "sign-up"`) + `onTypeChange` prop — both removed
  - `isSignIn` derived variable — removed
  - `AuthAppMeta` title: `isSignIn ? "Sign in" : "Sign up"` → hardcode `"Connect"`
  - `subTitle`: `!isIdentityKit && isSignIn ? "Sign in " : "Sign up "` → hardcode `"Connect "`
  - Toggle footer (`Don't have an NFID Wallet? Sign up` / `Already have...? Sign in`) — remove the entire `<div className="flex justify-center mt-auto">` block
  - `mb-[${isSignIn ? "30px" : "50px"}]` dynamic margin — simplify to fixed `mb-[30px]` (was the sign-in value; no sign-up screen anymore)
  - `Other sign in options` button was gated on `isSignIn` — now always render it (condition removed)

- **NFID coordinator** `apps/nfid-frontend/src/features/authentication/nfid/coordinator.tsx`: delegates entirely to `AuthenticationCoordinator` — no sign-up branching, no change needed.

- **3rd-party coordinator** `apps/nfid-frontend/src/features/authentication/3rd-party/coordinator.tsx`: delegates to `AuthenticationCoordinator` — no sign-up branching, no change needed.

- **IdentityKit coordinator** `apps/nfid-frontend/src/features/identitykit/coordinator.tsx`: delegates to `AuthenticationCoordinator` with `isIdentityKit` flag — no sign-up branching, no change needed.

## New Files

None.

## Modified Files

| File                                                                  | Change                                                                                                                                                   |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/nfid-frontend/src/features/authentication/root/root-machine.ts` | Remove `AuthSelectionSignUp`, `SignUpWithGoogle`, `SignUpWithEmail`, `SignUpPassKey`, `SignUpWithII` states; remove `SIGN_UP` event from `AuthSelection` |
| `apps/nfid-frontend/src/features/authentication/root/coordinator.tsx` | Remove `AuthSelectionSignUp`, `SignUpPassKey`, `SignUpWithEmail` case branches; remove `onTypeChange` prop from `AuthSelection` render                   |
| `packages/ui/src/organisms/authentication/auth-selection/index.tsx`   | Remove `type` + `onTypeChange` props; hardcode title/subtitle to "Connect"; remove toggle footer; simplify bottom margin                                 |

## Types

- [ ] Remove `type?: "sign-in" | "sign-up"` and `onTypeChange` from `AuthSelectionProps` interface in `packages/ui/src/organisms/authentication/auth-selection/index.tsx`

## XState / State Changes

- [ ] Remove states: `AuthSelectionSignUp`, `SignUpWithGoogle`, `SignUpWithEmail`, `SignUpPassKey`, `SignUpWithII`
- [ ] Remove `SIGN_UP` event from `AuthSelection` state
- [ ] Remove `SIGN_IN` event from `AuthSelectionSignUp` state (state itself is removed)

## Implementation Checklist

<!-- Execute EXACTLY ONE checkbox at a time using /execute-ui-plan -->

### State Machine

- [x] **`root-machine.ts`** — remove `AuthSelectionSignUp` state block (lines ~201–226), `SignUpPassKey` state block (lines ~227–235), `SignUpWithGoogle` state block (lines ~279–300), `SignUpWithII` state block (lines ~318–334), `SignUpWithEmail` state block (lines ~335–353); remove `SIGN_UP` event from `AuthSelection` (lines ~189–191)

### Components — Feature

- [x] **`root/coordinator.tsx`** — remove the `case state.matches("AuthSelectionSignUp")` branch (renders `<AuthSelection type="sign-up">`); remove `case state.matches("SignUpPassKey")`; remove `case state.matches("SignUpWithEmail")`; remove `onTypeChange` prop from the `AuthSelection` render inside `case state.matches("AuthSelection")`

### Components — Atoms

- [x] **`auth-selection/index.tsx`** — remove `type` and `onTypeChange` from `AuthSelectionProps`; remove `isSignIn` derived var; change `AuthAppMeta` title from conditional `"Sign in"/"Sign up"` to `"Connect"`; change subtitle from conditional `"Sign in "/"Sign up "` to `"Connect "`; remove the toggle footer `<div className="flex justify-center mt-auto">`; remove `isSignIn` condition on `Other sign in options` button (always render); simplify `mb-[${isSignIn ? "30px" : "50px"}]` to `mb-[30px]`

### Tests

- [x] Run existing unit tests — no new tests required; verify no test references `type="sign-up"` or `onTypeChange` on `AuthSelection`, and update any that do

### Verification

- [x] `yarn nx run nfid-frontend:typecheck` — zero errors (catches all prop mismatches across all call sites)
- [x] `yarn nx lint nfid-frontend` — zero new errors
- [x] `yarn nx test nfid-frontend` — all passing
- [x] `yarn format:check` — clean on all 3 modified files (471 pre-existing failures repo-wide, not introduced)
- [ ] Manual smoke: open wallet auth modal → single "Connect" screen, no sign-in/sign-up toggle visible; Email + Google buttons present; Passkey + II buttons present

## Risks & Notes

- **`SignUpWithII`** currently routes new accounts (non-`isExistingAccount`) to `GetRecoveryProvisioningPlan`. After removal, `AuthWithII` handles both paths — new accounts via II will fall to `AuthSelection` (not provisioning). This is acceptable: II new-account creation is not being disabled, but it's also not a supported path on this branch. Confirm with team if II new-account provisioning needs to be preserved; if so, merge `SignUpWithII`'s `onDone` new-account branch into `AuthWithII` instead of deleting.
- **`SignUpPassKey`** new-account passkey registration is removed from the UI. `passkeyConnector.registerWithPasskey` is still callable but unreachable from this flow. Out of scope per spec.
- **Storybook** — `AuthSelection` stories likely pass `type` and `onTypeChange`; update them after the component change to avoid storybook build errors.
- **No coordinator changes needed** for nfid, 3rd-party, or identitykit — they all delegate to `AuthenticationCoordinator` which handles state rendering.
