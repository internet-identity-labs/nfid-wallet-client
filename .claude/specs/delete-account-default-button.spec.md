# Spec: Delete Account — DEFAULT step button always disabled

> Status: APPROVED
> Created: 2026-09-03

## Overview

In the "Remove account" modal, the `DEFAULT` deletion step renders only the warning text and
the Cancel / "Remove account" buttons — no input field. The "Remove account" button is
disabled with `disabled={!value || !isValueValid}`, and on the `DEFAULT` step `value` is
always the empty string, so the button can never be enabled and the user cannot delete their
account. The `EMAIL` and `RECOVERY_PHRASE` steps are unaffected because they render an input
that populates `value`. Fix: only apply the value/validity gate on steps that actually
collect input.

## Scope

- App/area: `apps/nfid-frontend/src/features/security/components/remove-account.tsx` only
- Entry point: Security page → "Wallet address" row → trash icon → modal resolves to a plan
  whose current step is `DeletionMode.DEFAULT`
- Exit state: unchanged — clicking an enabled "Remove account" calls `executeStep(value)`,
  which finalizes deletion and triggers `logout()`

## User Flow

1. User with a deletion plan of `[DEFAULT]` opens the "Remove account" modal.
2. Modal shows the permanent-removal warning text, a "Cancel" button, and a "Remove account"
   button.
3. **Before:** "Remove account" is greyed out with no way to enable it.
   **After:** "Remove account" is enabled; clicking it runs `executeStep("")` →
   `defaultDeletionService.execute()` (no-op) → `finalizeDeletion`.

## Component States

| State    | Trigger                                        | UI Behavior                                                                                         |
| -------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| loading  | `isLoading` prop true                          | `BlurredLoader` overlay; buttons rendered underneath (unchanged)                                    |
| default  | `currentStep === DeletionMode.DEFAULT`         | Warning text, no input, "Remove account" **enabled**                                                |
| email    | `currentStep === DeletionMode.EMAIL`           | Code `Input`; "Remove account" enabled only when `value` passes `validateEmailCode` (unchanged)     |
| recovery | `currentStep === DeletionMode.RECOVERY_PHRASE` | Seed `textarea`; "Remove account" enabled only when `value` passes `validateSeedPhrase` (unchanged) |
| error    | `executeStep` rejects (handled by parent)      | parent shows `toaster.error`; modal stays open (unchanged)                                          |
| success  | `steps?.isCompleted`                           | component renders `null` (unchanged)                                                                |

## Data & State Design

- Fetch: none new.
- Mutations: none new.
- New state: none. Purely a `disabled` expression change.

### Change

```tsx
// remove-account.tsx — inside RemoveAccountModal

const isDefaultStep = currentStep === DeletionMode.DEFAULT

// button
<Button
  className="w-full"
  disabled={!isDefaultStep && (!value || !isValueValid)}
  type="red"
  onClick={() => executeStep(value)}
>
  Remove account
</Button>
```

- `DEFAULT` → button always enabled, regardless of `value` / `isValueValid`.
- `EMAIL` / `RECOVERY_PHRASE` → existing gating preserved exactly (`!value || !isValueValid`).
- `currentStep` is `undefined` on first render before the `useEffect` sets it; while
  `undefined`, `isDefaultStep` is `false`, so the existing gate applies and the button stays
  disabled until a step is known. The modal is also covered by `BlurredLoader` while
  `isLoading`.

## Accessibility

- [ ] Focus trap — `ModalComponent`, unchanged.
- [ ] aria-labels — buttons have visible text, unchanged.
- [ ] Keyboard navigation — the `DEFAULT` "Remove account" button becomes keyboard-reachable
      and activatable (was an unreachable disabled control).
- [ ] WCAG AA contrast — `type="red"` token, unchanged.

## Responsive Behavior

- Unchanged (`w-[95%]` / `md:w-[450px]`).

## Edge Cases

- First render, `currentStep === undefined`: `isDefaultStep` is `false`, existing gate keeps
  the button disabled until the `useEffect` sets the step.
- `EMAIL` / `RECOVERY_PHRASE` with empty or invalid input → still disabled.
- Re-opening the modal after a failed step: `handleClose` resets `value` / `isValueValid`;
  `DEFAULT` button stays enabled regardless, which is correct.

## Out of Scope

- Any change to `delete-account.service.ts` or the deletion step services (service logic is
  correct).
- Adding a typed confirmation ("type DELETE") to the `DEFAULT` step.
- Copy or layout changes to the modal.
