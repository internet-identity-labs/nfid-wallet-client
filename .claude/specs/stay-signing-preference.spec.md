# Spec: Stay Signing UI Preference & Local Storage Handling

> Status: APPROVED
> Created: 2026-11-25 · Revised: 2026-11-27

## Overview

After every successful authentication the machine passes through two new states
before `End`. `CheckSignedIn` is a guard that auto-skips to `End` when the user
was already remembered at page load (`wasRemembered` captured at machine init,
before auth writes `anchor` to localStorage); otherwise it transitions to
`StaySignedIn`, which shows a UI screen where the user chooses whether to persist
their session. Choosing "yes" goes to `End` (DISK mode — the default); choosing
"no" awaits `rememberMeService.doNotRememberMe()` in a `DoNotRememberMe` state
then goes to `End` (MEMORY mode — session cleared on logout/tab close).

## Scope

- **App/area:** auth flow (`apps/nfid-frontend`)
- **Entry point:** every auth path that previously targeted `End` in the root machine
- **Exit state:** auth flow completes normally; storage mode is set before `End`

### Files touched

| File                                                                       | Change                                                                                                                                                                                                    |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/nfid-frontend/src/features/authentication/root/root-machine.ts`      | Add `wasRemembered` context field; `isRemembered` guard; `doNotRememberMeService` actor; `CheckSignedIn`, `StaySignedIn`, `DoNotRememberMe` states; redirect all auth-completion paths to `CheckSignedIn` |
| `apps/nfid-frontend/src/features/authentication/root/coordinator.tsx`      | Add `StaySignedIn` case                                                                                                                                                                                   |
| `packages/ui/src/organisms/authentication/stay-signed-in/index.tsx`        | `StaySignedIn` UI component (layout provided by engineer)                                                                                                                                                 |
| `packages/ui/src/organisms/authentication/stay-signed-in/stay-sign-in.png` | Illustration asset                                                                                                                                                                                        |

## State Machine Design

```
… any auth path … → CheckSignedIn → (wasRemembered guard) → End
                                  ↘ StaySignedIn → STAY_SIGNED_IN          → End
                                                 → DO_NOT_STAY_SIGNED_IN   → DoNotRememberMe → End
```

### `CheckSignedIn`

- `always`: if `context.wasRemembered` → `End` (auto-skip)
- else → `StaySignedIn`

### `StaySignedIn`

- `STAY_SIGNED_IN` → `End`
- `DO_NOT_STAY_SIGNED_IN` → `DoNotRememberMe`

### `DoNotRememberMe`

- Invokes `rememberMeService.doNotRememberMe()` as a promise actor
- `onDone` / `onError` → `End` (error is logged; auth always completes)

### Events added to machine

| Event                   | From state     |
| ----------------------- | -------------- |
| `STAY_SIGNED_IN`        | `StaySignedIn` |
| `DO_NOT_STAY_SIGNED_IN` | `StaySignedIn` |

## Component States

| State             | Trigger                       | UI Behavior                    |
| ----------------- | ----------------------------- | ------------------------------ |
| `CheckSignedIn`   | every auth completion         | no UI — instant guard check    |
| `StaySignedIn`    | `wasRemembered` = false       | show "Stay signed in?" screen  |
| `DoNotRememberMe` | `DO_NOT_STAY_SIGNED_IN` event | no UI — awaits async migration |

## Data & State Design

- **Fetch:** none
- **New context field:** `wasRemembered: boolean` — set once at machine creation via `rememberMeService.isRemembered()`, before any auth writes `anchor` to localStorage
- **Mutations:** `rememberMeService.doNotRememberMe()` awaited in `DoNotRememberMe` state
- **Storage:** leverages existing `rememberMeService` from `packages/integration`

## Edge Cases

- **Returning user** (`wasRemembered` = true): `CheckSignedIn` skips directly to `End` — no UI shown
- **New / opted-out user** (`wasRemembered` = false): `StaySignedIn` screen shown
- **`doNotRememberMe()` fails**: error caught; machine still proceeds to `End` — session stays DISK (safer default)
- **`anchor` written during auth**: irrelevant — `wasRemembered` was captured before auth ran

## Out of Scope

- Checkbox on `ChooseWallet` / `AuthSelection` screens
- i18n, animations, embed surface
