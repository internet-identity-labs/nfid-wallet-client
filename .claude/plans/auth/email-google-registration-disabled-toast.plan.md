# Plan: Registration-Disabled Info Toast (Email & Google flows)

> Status: APPROVED
> Spec: .claude/specs/auth/email-google-registration-disabled-toast.spec.md
> Created: 2026-09-16

## Codebase Analysis (reference, not for editing)

- Toast atom: `packages/ui/src/atoms/toast/index.tsx` — `toaster.info`
  hardcodes title `"Info notification"`; no existing spec file for this atom.
- Typed error already exported: `RegistrationDisabledError` from
  `@nfid/integration` (`packages/integration/src/lib/authentication/registration-guard.service.ts`).
- Email flow:
  - `apps/nfid-frontend/src/features/authentication/auth-selection/email-flow/machine.ts`
    — `toastError` action (line ~157), invoked from two `onError` branches on
    the `SendVerificationEmail` state.
  - `apps/nfid-frontend/src/features/authentication/auth-selection/email-flow/services.ts`
    — already rethrows caught errors untouched; **no change needed**.
- Google flow:
  - `apps/nfid-frontend/src/features/authentication/auth-selection/google-flow/services.ts`
    — `signWithGoogleService`, flattens all errors via `catch (e: any) { throw
new Error(e.message) }`.
  - `apps/nfid-frontend/src/features/authentication/auth-selection/google-flow/auth-with-google.ts`
    — `AuthWithGoogleMachine`, no `onError` branch on `FetchKeys` state today.
  - `apps/nfid-frontend/src/features/authentication/root/root-machine.ts` —
    `AuthWithGoogle` / `SignUpWithGoogle` states invoke `AuthWithGoogleMachine`
    with `onDone` only; no `onError`.

## New Files

None.

**Note on copy location:** searched the codebase for a shared toast-copy
constants convention — none exists (`DEFAULT_STAKE_ERROR` in
`transfer-modal/components/stake.tsx`, `NEURON_ERROR_TEXT` in
`staking-service-impl.ts`, `LOADING_MESSAGES` in `identitykit/coordinator.tsx`
are all declared locally in the file that uses them, not centralized). Per
engineer direction, the title/description are duplicated as inline string
literals at both `toaster.info(...)` call sites (`email-flow/machine.ts` and
`root-machine.ts`) rather than shared via an export/constants file — no
import, no cross-file dependency.

## Modified Files

| File                                                                                                    | Change                                                                      |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `packages/ui/src/atoms/toast/index.tsx`                                                                 | Add optional 3rd `title` param to `toaster.info` (default unchanged)        |
| `apps/nfid-frontend/src/features/authentication/auth-selection/email-flow/machine.ts`                   | Branch `toastError` on `instanceof RegistrationDisabledError` (inline copy) |
| `apps/nfid-frontend/src/features/authentication/auth-selection/google-flow/services.ts`                 | Stop flattening `RegistrationDisabledError` in the catch block              |
| `apps/nfid-frontend/src/features/authentication/auth-selection/google-flow/auth-with-google.ts`         | Escalate `FetchKeys` invoke errors to the parent machine                    |
| `apps/nfid-frontend/src/features/authentication/auth-selection/google-flow/auth-with-google.typegen.ts` | Register `escalateError` action                                             |
| `apps/nfid-frontend/src/features/authentication/root/root-machine.ts`                                   | Add `onError` to `AuthWithGoogle` / `SignUpWithGoogle`, new action          |

## Types

- None new — `RegistrationDisabledError` already typed/exported by `@nfid/integration`.

## XState / State Changes

- [x] `root-machine.ts` — `AuthWithGoogle` state: add
      `onError: { target: "End", actions: "toastRegistrationDisabled" }`
- [x] `root-machine.ts` — `SignUpWithGoogle` state: same `onError` addition
- [x] `root-machine.ts` — new action `toastRegistrationDisabled` in the
      machine's `actions` options object
- [x] `email-flow/machine.ts` — `toastError` action gains an `instanceof`
      branch (no new states/events, existing `onError` transitions unchanged)

## Implementation Checklist

<!-- Execute EXACTLY ONE checkbox at a time using /execute-ui-plan -->

### Atoms / Context

- [x] `packages/ui/src/atoms/toast/index.tsx` — add optional `title` 3rd
      param to `toaster.info` per spec §1; verify all 4 existing call sites
      (`add-passkey.tsx`, `coordinator.tsx` ×2, `app-acc-balance-sheet/index.tsx`)
      compile unchanged
- [x] `packages/ui/src/atoms/toast/index.tsx` — fix icon/content vertical
      alignment bug found in manual review: `react-toastify`'s own
      `ReactToastify.css` sets `align-items: center` on `.Toastify__toast`,
      which has the same specificity as our Tailwind `items-start`/
      `items-center` classes on that same element, so load order (not intent)
      decides which wins. Force our intent with Tailwind's `!important`
      modifier (`!items-start`) on all 4 `toaster.*` methods so long-text
      toasts always align the icon with the title instead of centering it
      across the whole card

### State Machine

- [x] `google-flow/auth-with-google.ts` — bug found via manual testing: no
      toast fired and the flow hung on Google sign-up with registration
      disabled. Root cause: `AuthWithGoogleMachine`'s `FetchKeys` state had
      no `onError` on its `signWithGoogleService` invoke, so a rejected
      promise there was silently dropped by XState (logged as "Missing
      onError handler for invocation...") and never reached `root-machine.ts`'s
      `onError` on `AuthWithGoogle`/`SignUpWithGoogle` (which only fires if
      the child machine itself errors, not from an unhandled internal
      invoke). Fixed by adding `onError` on `FetchKeys` that runs a new
      `escalateError` action (`actions.escalate` from `xstate`) to propagate
      the raw error up to the parent as `error.platform.AuthWithGoogleMachine`,
      then transitions to `End`; updated `auth-with-google.typegen.ts` to
      register `escalateError`. Note: this also fixes the same hang for any
      other (non-`RegistrationDisabledError`) error from
      `signWithGoogleService` — those now reach `root-machine.ts`'s `End`
      without a toast (previously they hung silently too), rather than
      changing behavior for a previously-working path.
- [x] `google-flow/services.ts` — update `signWithGoogleService`'s catch
      block to rethrow `RegistrationDisabledError` untouched (spec §4);
      import `RegistrationDisabledError` from `@nfid/integration`
- [x] `email-flow/machine.ts` — update `toastError` action with the
      `instanceof RegistrationDisabledError` branch (spec §3, inline copy);
      import `RegistrationDisabledError` from `@nfid/integration`
- [x] `root-machine.ts` — add `toastRegistrationDisabled` action (spec §5,
      inline copy); import `RegistrationDisabledError` from `@nfid/integration`
- [x] `root-machine.ts` — wire `onError` on `AuthWithGoogle` and
      `SignUpWithGoogle` states to `{ target: "End", actions:
"toastRegistrationDisabled" }`

### Verification

- [x] `yarn nx lint nfid-wallet-client --fix` — zero new errors (only
      pre-existing warnings across the app, none on the 4 modified lines)
- [x] `yarn nx lint ui --fix` — zero new errors (toast atom package)
- [x] `npx tsc --noEmit -p apps/nfid-frontend/tsconfig.json` — zero errors
- [x] `npx prettier --check` on the 4 modified files — all pass (the
      repo-wide `yarn format:check` failure on 49 files is a pre-existing
      Prettier plugin-config warning issue, unrelated to this change)

## Risks & Notes

- Google-flow's `onError` addition changes behavior that was previously
  _unhandled_ (per spec Edge Cases) — worth a careful look in code review
  since there's no prior test coverage to diff against for that path.
- `toaster.info`'s new 3rd param is positional; double-check no other PR
  in flight adds a conflicting signature to the same function.
- Per user's global instruction: test runs are slow — check for an existing
  test report before rerunning full suites just to filter by name.
