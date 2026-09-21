# Spec: Disable Email & Google Registration UI Entry Points

> Status: APPROVED
> Created: 2026-09-21

## Overview

Update all client authentication flows across nfid-wallet, 3rd-party, IdentityKit, and embed contexts to remove new account creation via Email and Google. Existing users can still log in with those methods. The broader UI framing shifts from "sign in / sign up" to a single "connect" flow — removing the sign-in vs. sign-up toggle and updating all copy to reflect this. Email and Google buttons are hidden when the context implies new registration; they remain visible (and functional) for existing-account login.

## Scope

- **App/area:** `nfid-wallet` primary; also `3rd-party`, `IdentityKit (/rpc)`, and `embed` auth flows
- **Entry point:** Authentication modal / page triggered by any app's auth flow
- **Exit state:** User is authenticated (no change to success path); blocked new registrations surface the existing toast

## Affected Files

### UI Components

- `packages/ui/src/organisms/authentication/auth-selection/index.tsx` — remove sign-up toggle; update heading copy to "Connect"
- `packages/ui/src/molecules/button/signin-with-google/index.tsx` — no change (button itself is fine; visibility controlled by parent)

### State Machines

- `apps/nfid-frontend/src/features/authentication/root/root-machine.ts` — replace `SIGN_IN` and `SIGN_UP` / `AuthSelection` + `AuthSelectionSignUp` entry states with a single **`CONNECT`** state; remove `SignUpWithGoogle` and `SignUpWithEmail` states entirely
- `apps/nfid-frontend/src/features/authentication/auth-selection/email-flow/machine.ts` — retain for existing-account login; ensure `RegistrationDisabledError` path and toast remain intact
- `apps/nfid-frontend/src/features/authentication/auth-selection/google-flow/auth-with-google.ts` — retain for existing-account login; no structural change needed

### Coordinators

- `apps/nfid-frontend/src/features/authentication/root/coordinator.tsx` — remove `AuthSelectionSignUp` branch; render only the single `CONNECT` state
- `apps/nfid-frontend/src/features/authentication/nfid/coordinator.tsx` — remove sign-up branch references
- `apps/nfid-frontend/src/features/authentication/3rd-party/coordinator.tsx` — remove sign-up branch references
- `apps/nfid-frontend/src/features/identitykit/coordinator.tsx` — remove sign-up branch references

## User Flow

1. User arrives at any auth entry point (NFID Wallet, 3rd-party dApp via IdentityKit, embed, /rpc).
2. Auth screen displays a **single "Connect" view** — no sign-in / sign-up toggle.
3. Available options:
   - Continue with a Passkey
   - Continue with Internet Identity
   - Continue with Google _(existing accounts only — new registration silently blocked by backend with existing toast)_
   - Continue with Email _(existing accounts only — new registration silently blocked by backend with existing toast)_
   - Other sign-in options
4. User selects a method and completes authentication as before.
5. On success, session is established (no change).

> **Note:** Email and Google buttons remain visible for all users. Registration attempts are already blocked at the service layer (`RegistrationDisabledError`) and surface the existing toast: _"Creating new accounts via email or Google is no longer supported…"_. No additional UI gate is required.

## Copy Changes

| Location                             | Current copy                      | New copy                                        |
| ------------------------------------ | --------------------------------- | ----------------------------------------------- |
| Auth screen heading (auth-selection) | "Sign in" / "Sign up"             | "Connect"                                       |
| Sign-in/Sign-up toggle link          | "Sign up" / "Sign in"             | **Remove toggle entirely**                      |
| IdentityKit metadata title           | "Sign in" / "Sign up"             | "Connect"                                       |
| Email button                         | "Continue with email"             | "Continue with email" _(unchanged)_             |
| Google button                        | "Continue with Google"            | "Continue with Google" _(unchanged)_            |
| Passkey button                       | "Continue with a Passkey"         | "Continue with a Passkey" _(unchanged)_         |
| II button                            | "Continue with Internet Identity" | "Continue with Internet Identity" _(unchanged)_ |

## Component States

| State   | Trigger                                                | UI Behavior                     |
| ------- | ------------------------------------------------------ | ------------------------------- |
| loading | Auth flow initialising                                 | Existing loaders — no change    |
| error   | `RegistrationDisabledError` (Email/Google new account) | Existing toast — no change      |
| success | Auth complete                                          | Session established — no change |

## Data & State Design

- **Fetch:** No new fetching. Existing SWR hooks and XState services unchanged.
- **Mutations:** No new mutations. Existing auth services handle all side effects.
- **New state:** None. In `root-machine.ts`, replace the `SIGN_IN` / `SIGN_UP` dual-entry pattern with a single **`CONNECT`** state. Remove `AuthSelectionSignUp`, `SignUpWithGoogle`, and `SignUpWithEmail` states entirely. All coordinators that branch on sign-in vs. sign-up collapse to handle only `CONNECT`.

## Accessibility

- [x] Focus trap — no change (Radix handles modals)
- [x] aria-labels — update any aria-label that says "sign in" or "sign up" to "connect"
- [x] Keyboard navigation — no change
- [x] WCAG AA contrast — no change

## Responsive Behavior

- Mobile: no change
- Desktop: no change

## Edge Cases

- **Existing Email/Google users** must still be able to log in — buttons stay; only new registration is blocked by the existing backend error.
- **Magic link flow** (`/verify/email/:token`) — retain as-is; it is a login flow for existing users.
- **3rd-party / embed / /rpc** — all share the same `AuthSelection` component; removing the toggle there covers all contexts simultaneously.
- **IdentityKit metadata title** — currently conditionally renders "Sign in" / "Sign up" based on flow state; replace both with "Connect".

## Out of Scope

- Removing Email/Google from the service/backend layer (already handled in sc-19799).
- Passkey or Internet Identity flow changes.
- Any new onboarding or "no account" empty state screen.
- Recovery phrase flow.
