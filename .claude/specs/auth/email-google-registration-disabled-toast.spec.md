# Spec: Registration-Disabled Info Toast (Email & Google flows)

> Status: APPROVED
> Created: 2026-09-16
> Depends on: `.claude/specs/auth/disable-email-google-registration.spec.md` (integration
> layer — already implemented; exports `RegistrationDisabledError` from
> `@nfid/integration`)

## Overview

When a user attempts to **register** a new account via email or Google, and the
backend has registration blocked, the integration layer already rejects with a
typed `RegistrationDisabledError` (see the dependency spec above). No UI
currently reacts to that type: the email flow catches it generically and shows
a red **error** toast; the Google flow doesn't catch it at all — it's
unhandled. This spec wires both flows to detect `RegistrationDisabledError`
specifically and show a dedicated **info** toast instead, with fixed copy:

- **Title:** `Email Signup Deprecated`
- **Description:** `Creating new accounts via email or Google is no longer
supported as NFID transitions to full decentralization. Please use a passkey
or web3 sign-in method instead.`

Every existing `toaster.info(...)` call site in the codebase (`add-passkey.tsx`,
`coordinator.tsx` ×2, `app-acc-balance-sheet/index.tsx`) relies on the toast
atom's hardcoded `"Info notification"` header — none currently override it.
This is the first call site that needs a distinct title, so the toast atom's
`toaster.info` gains an optional title override (see Changes §1) — same
shape/idiom as its existing optional `toastProps` param, not a one-off hack.

All other error types in both flows keep their current (error toast) behavior
unchanged.

## Scope

- App/area: `nfid-frontend` — `apps/nfid-frontend/src/features/authentication`
- Entry point: a `RegistrationDisabledError` rejection from either
  - Email flow: `sendVerificationEmail` service (invoked by
    `email-flow/machine.ts`)
  - Google flow: `signWithGoogleService` (invoked by `google-flow/auth-with-google.ts`,
    itself invoked by `root-machine.ts`'s `AuthWithGoogle` / `SignUpWithGoogle`
    states)
- Exit state:
  - Email flow: info toast shown, machine transitions the same as today's
    non-"request not expired" error branch (`target: "End"`).
  - Google flow: info toast shown, machine transitions to `End` (same target
    as the email flow's registration-disabled branch) — this is **new**
    behavior; today this path is unhandled (see Edge Cases).
- Touches: `packages/ui/src/atoms/toast` (toast atom), `email-flow/machine.ts`,
  `google-flow/services.ts`, `root-machine.ts`.

## User Flow

1. User picks "Continue with email" or "Continue with Google" intending to
   create a **new** account.
2. Backend rejects with `403 REGISTRATION_DISABLED`; integration layer throws
   `RegistrationDisabledError`.
3. UI catches the typed error and shows an **info** toast (blue/info styling,
   not red/error) with the title and description above.
4. Flow ends (same as the email flow's existing registration-disabled exit),
   returning the user to wherever the auth flow's `End` state routes them so
   they can pick passkey or another web3 sign-in method.

## Component States

| State                          | Trigger                                         | UI Behavior                                                                                                         |
| ------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| registration disabled (email)  | `RegistrationDisabledError` from email service  | `toaster.info` with fixed title/description; machine → `End` (unchanged target, new toast)                          |
| registration disabled (google) | `RegistrationDisabledError` from google service | `toaster.info` with fixed title/description; machine → `End` (new onError branch, identical to email flow's target) |
| other error (email)            | any other `Error`                               | unchanged — existing `toastError` action, red error toast                                                           |
| other error (google)           | any other `Error`                               | unchanged behavior preserved (still unhandled/no toast) — **out of scope**, pre-existing gap                        |
| success                        | n/a                                             | unchanged                                                                                                           |

## Data & State Design

- Fetch/mutation: none new — consumes the existing `RegistrationDisabledError`
  export from `@nfid/integration`.
- New state: none (no new XState states beyond one new `onError` branch per
  Google machine invocation; no new atoms).

## Changes

### 1. Toast atom — allow a custom title on `toaster.info`

**File:** `packages/ui/src/atoms/toast/index.tsx`

`toaster.info` currently hardcodes the title to `"Info notification"`. Add an
optional `title` parameter (default `"Info notification"` to preserve every
existing call site's behavior):

```ts
toaster.info = (
  text?: string,
  toastProps?: ToastOptions,
  title: string = "Info notification",
): Id =>
  toast.info(<Toast title={title} text={text} />, {
    icon: <InfoIcon />,
    className: text?.length ? "items-start" : "items-center",
    closeOnClick: true,
    closeButton: <CloseIcon className="h-4 mt-1 ml-auto min-w-4 max-w-4" />,
    ...toastProps,
  })
```

All existing `toaster.info(text)` / `toaster.info(text, toastProps)` call
sites (`add-passkey.tsx`, `coordinator.tsx` ×2, `app-acc-balance-sheet/index.tsx`)
are unaffected — third param is new and optional.

### 2. Shared copy constants

**File (new):** `apps/nfid-frontend/src/features/authentication/auth-selection/registration-disabled-toast.ts`

```ts
export const REGISTRATION_DISABLED_TOAST_TITLE = "Email Signup Deprecated"
export const REGISTRATION_DISABLED_TOAST_DESCRIPTION =
  "Creating new accounts via email or Google is no longer supported as NFID transitions to full decentralization. Please use a passkey or web3 sign-in method instead."
```

Shared by both flows so the copy lives in exactly one place.

### 3. Email flow — `email-flow/machine.ts`

Update the `toastError` action to branch on `instanceof RegistrationDisabledError`
before the existing JSON-parse fallback:

```ts
toastError: (_context: AuthWithEmailMachineContext, event: any) => {
  if (event.data instanceof RegistrationDisabledError) {
    toaster.info(
      REGISTRATION_DISABLED_TOAST_DESCRIPTION,
      undefined,
      REGISTRATION_DISABLED_TOAST_TITLE,
    )
    return
  }
  try {
    const message = JSON.parse(event.data.message)
    toaster.error(message.error)
  } catch (_) {
    toaster.error(event.data.message)
  }
},
```

No change needed to `email-flow/services.ts` — it already rethrows caught
errors untouched (`catch (e) { throw e }`), so `RegistrationDisabledError`
reaches the machine's `onError` `event.data` intact.

### 4. Google flow — stop flattening the typed error

**File:** `google-flow/services.ts`

Current code loses the type:

```ts
} catch (e: any) {
  console.error(e)
  throw new Error(e.message)
}
```

Change to preserve `RegistrationDisabledError` (and any other typed error)
while keeping the existing `console.error` + generic-wrap fallback for
anything else:

```ts
} catch (e: any) {
  console.error(e)
  if (e instanceof RegistrationDisabledError) throw e
  throw new Error(e.message)
}
```

(`RegistrationDisabledError` imported from `@nfid/integration`.)

### 5. Google flow — add `onError` handling (new)

**File:** `root-machine.ts`

Both `AuthWithGoogle` and `SignUpWithGoogle` states invoke `AuthWithGoogleMachine`
with only an `onDone` branch today — no `onError`, so a rejection is currently
unhandled. Add, to both states:

```ts
onError: {
  target: "End",
  actions: "toastRegistrationDisabled",
},
```

New shared action:

```ts
toastRegistrationDisabled: (_context: AuthenticationContext, event: any) => {
  if (event.data instanceof RegistrationDisabledError) {
    toaster.info(
      REGISTRATION_DISABLED_TOAST_DESCRIPTION,
      undefined,
      REGISTRATION_DISABLED_TOAST_TITLE,
    )
  }
},
```

Only `RegistrationDisabledError` is handled here — any other error type
falls through with no toast, preserving today's (admittedly gap-y) behavior
for non-registration-disabled Google errors. Widening `onError` to handle all
Google errors generically is explicitly out of scope (see below).

## Accessibility

- No new interactive elements — reuses the existing toast component, which
  already satisfies baseline a11y (react-toastify manages focus/ARIA live
  region; existing `CloseIcon` button is keyboard-reachable).
- Toast copy is plain text, no truncation risk flagged (description is ~185
  chars, in line with existing longer toast copy in the codebase).

## Responsive Behavior

- N/A — toast positioning/sizing is unchanged, governed by the existing
  `ToastContainer` config elsewhere in the app.

## Edge Cases

- Google flow currently has **no** `onError` handling for _any_ error
  (registration-disabled or otherwise) — this spec adds handling only for
  `RegistrationDisabledError`; other Google errors remain unhandled/silent as
  they are today. Flagged as pre-existing, out of scope.
- Email flow's `isRequestNotExpired` guard runs before `toastError`; per the
  dependency spec, backend returns `403` (not `429`) when registration is
  blocked, so that guard cannot misfire and re-enter `PendingEmailVerification`
  for this error — it always falls to the second `onError` branch (`target:
"End"`, `actions: "toastError"`).
- `toaster.info`'s new third `title` param is additive/optional — no existing
  call site needs updating.

## Test Plan

- `packages/ui/src/atoms/toast` — spec: `toaster.info(text, toastProps, title)`
  renders the passed title (via `toast.info` mock) instead of the default;
  omitting the third arg still renders `"Info notification"` (regression
  guard for existing call sites).
- `email-flow/machine.spec.ts` (or wherever the machine's actions are
  unit-tested) — `toastError` action: `event.data instanceof
RegistrationDisabledError` → `toaster.info` called with the fixed
  title/description; any other error → existing `toaster.error` path
  unchanged.
- `google-flow/services.spec.ts` — `signWithGoogleService`: underlying
  `RegistrationDisabledError` rejection propagates as-is (not flattened to
  generic `Error`); other thrown errors still wrapped in `new Error(e.message)`.
- `root-machine` — new `onError` branch on `AuthWithGoogle` /
  `SignUpWithGoogle`: `RegistrationDisabledError` → `toaster.info` called,
  machine transitions to `End` (identical target to the email flow's
  registration-disabled branch).
- Verification commands: `yarn nx test nfid-frontend`, `yarn nx test ui`
  (or package-equivalent for the toast atom), `yarn nx lint nfid-frontend`,
  `yarn format:check`.

## Out of Scope

- Adding generic `onError` handling for non-`RegistrationDisabledError`
  failures in the Google flow — pre-existing gap, not introduced or fixed
  here.
- Any change to the integration-layer `RegistrationDisabledError` class,
  error code, or backend contract (covered by the dependency spec).
- i18n — copy is hardcoded English, matching the rest of the app's current
  (non-i18n'd) toast copy.
- Changing toast position, duration, or container config.

## Open Questions for Planning

1. Confirm exact unit-test file/location conventions for `email-flow/machine.ts`
   and `root-machine.ts` actions (none currently exist for machine `actions`
   in isolation — may need `machine.spec.ts` created, or coverage added via
   an existing higher-level flow test).
