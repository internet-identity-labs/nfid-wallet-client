# Spec: Stay Signing UI Preference & Local Storage Handling

> Status: APPROVED
> Created: 2026-11-25

## Overview

Add a "Stay signed in" checkbox to the `ChooseWallet` and `AuthSelection` auth
screens. When the user completes authentication with the checkbox **unchecked**
(the default), `rememberMeService.doNotRememberMe()` is called after the auth
machine reaches `End`, switching storage to `MEMORY` mode so that the session
clears on manual logout, timeout, or tab close. When the checkbox is **checked**,
the existing `DISK` behavior is preserved — nothing extra is called.

The checkbox preference is transient in-session state (plain `useState`); it is
**not** written to `localStorage` or any store.

## Scope

- **App/area:** auth flow (`apps/nfid-frontend`)
- **Entry point:** `ChooseWallet` and `AuthSelection` screens, rendered by
  `AuthenticationCoordinator`
- **Exit state:** auth flow completes normally; `doNotRememberMe()` is called
  as a fire-and-forget side-effect after the machine enters `End` if the
  checkbox was unchecked

### Files touched

| File                                                                  | Change                                                                                             |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `packages/ui/src/organisms/authentication/choose-wallet/index.tsx`    | Add `staySignedIn` + `onStaySignedInChange` props; render checkbox                                 |
| `packages/ui/src/organisms/authentication/auth-selection/index.tsx`   | Same as above                                                                                      |
| `apps/nfid-frontend/src/features/authentication/root/coordinator.tsx` | Hold `useState(false)` for `staySignedIn`; pass to both screens; call `doNotRememberMe()` on `End` |

## User Flow

1. User lands on `ChooseWallet` or `AuthSelection`.
2. A "Stay signed in" checkbox is visible, **unchecked by default**.
3. User optionally checks the box.
4. User completes authentication via any path (passkey, email, Google, II, recovery phrase…).
5. The XState machine transitions to `End`.
6. If the checkbox was **unchecked**: coordinator calls
   `rememberMeService.doNotRememberMe()` (fire-and-forget, errors logged but
   not surfaced). Storage switches to `MEMORY` mode — session keys are cleared
   on logout or tab close.
7. If the checkbox was **checked**: no extra call; storage stays `DISK`.

## Component States

| State   | Trigger                        | UI Behavior                                               |
| ------- | ------------------------------ | --------------------------------------------------------- |
| default | screen mount                   | checkbox unchecked                                        |
| checked | user clicks checkbox           | checkbox checked                                          |
| success | auth completes (machine → End) | no visual change; `doNotRememberMe()` called if unchecked |

No loading, empty, or error state on the checkbox itself.

## Data & State Design

- **Fetch:** none
- **New state:** `const [staySignedIn, setStaySignedIn] = useState(() => rememberMeService.isRemembered())` in
  `AuthenticationCoordinator` — initialised from `isRemembered()` so returning users
  (anchor in localStorage) see the box pre-checked; shared across both screens
- **Mutations / side effects:**
  - A `useEffect` subscribes directly to the `actor` (not React state). When the
    machine transitions to `End` and `!staySignedIn`, calls
    `rememberMeService.doNotRememberMe().catch(console.error)`.
    Actor subscriptions fire synchronously during the machine transition — before
    React re-renders and before the outer coordinator unmounts this component —
    so the call is guaranteed to execute for all auth paths (passkey, Google, II, email…).
  - Leverages the already-implemented `rememberMeService` from
    `packages/integration/src/lib/remember-me/remember-me.service.ts`

## Checkbox Prop Interface (new props on both UI components)

```ts
staySignedIn: boolean
onStaySignedInChange: (value: boolean) => void
```

The checkbox renders at the bottom of each screen, above any footer buttons,
using the existing `Checkbox` atom from `@nfid-frontend/ui`. Label: **"Stay
signed in"**.

## Accessibility

- Checkbox uses the existing accessible `Checkbox` component (Radix-based) —
  keyboard navigation and `aria-label` are handled by the primitive.
- No additional a11y requirements.

## Responsive Behavior

- Mobile and desktop: identical placement (no breakpoint differences).

## Edge Cases

- **`doNotRememberMe()` already in `MEMORY` mode** — `rememberMeService` treats
  this as a no-op; safe to call.
- **Auth fails partway** — machine never reaches `End`; `doNotRememberMe()` is
  never called; preference has no effect.
- **User navigates between `ChooseWallet` ↔ `AuthSelection`** — `staySignedIn`
  state lives in the coordinator, so the checkbox value persists across the
  transition.
- **`doNotRememberMe()` throws** — error is caught and `console.error`-logged;
  the app continues normally (session stays DISK — safer than failing auth).

## Out of Scope

- Persisting the preference across sessions (the checkbox always resets to
  unchecked on next login).
- Showing a modal (the checkbox is inline, replacing any modal-based flow).
- Embed / iframe surface changes.
- i18n / localization.
- Animations or transitions on the checkbox.
- Changes to the XState root machine itself.
