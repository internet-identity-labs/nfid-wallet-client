# Spec: Disable Email Check on Delete Account

> Status: APPROVED
> Created: 2026-08-31

## Overview

Account deletion currently forces an email verification-code step for any profile
that has an email value. But some accounts do not have email as an actual device
(access point) — the email is present on the profile without a matching
authentication device — so the email verification-code step cannot be completed
and those users are blocked from deleting their account. Email and Google sign-in
— and their backing database — are being removed entirely in the next release, so
the email deletion check has no lasting value. This change removes the `EMAIL`
deletion step and all of its supporting code so that only **passkey** (2FA) and
**recovery phrase** confirmations gate account deletion. Accounts with neither a
passkey nor a recovery phrase fall through to the existing `DEFAULT` mode, where
the "Remove account" modal button is the sole confirmation.

## Scope

- **App/area:** `apps/nfid-frontend` — `features/security` (Security settings page);
  `packages/integration` — `lib/delete-account` deletion service.
- **Entry point:** Trash icon in the "Wallet address" row of the Security page
  (`RemoveAccountSection` → `getAccountDeletionSteps`). Unchanged.
- **Exit state:** Unchanged — on completion `logout()` is called and the user is
  returned to the sign-in screen; the modal never shows a success state.

## User Flow

### Passkey (2FA) account — unchanged

1. User opens Security page, clicks the trash icon.
2. `deleteAccountService.getPlan()` returns `steps: [PASSKEY]`.
3. Passkey step is prepared and auto-executed (`executeStep(plan, "confirm")`),
   prompting the platform passkey dialog.
4. On success the plan is finalized (`finalizeDeletion`) and the user is logged out.

### Recovery-phrase account — unchanged

1. User clicks the trash icon.
2. `getPlan()` returns `steps: [RECOVERY_PHRASE]`.
3. Modal shows the recovery-phrase `textarea`; user pastes their phrase and clicks
   "Remove account".
4. `recoveryPhraseDeletionService.execute` validates the derived principal, then the
   plan is finalized and the user is logged out.

### Email-only account (no passkey/recovery device) — changed

1. User clicks the trash icon.
2. `getPlan()` finds no applicable passkey or recovery step and no longer appends
   `EMAIL`, so it returns `steps: [DEFAULT]`.
3. Modal shows the standard warning paragraph with **Cancel** / **Remove account**.
4. User clicks "Remove account" → `defaultDeletionService.execute` is a no-op →
   `finalizeDeletion` runs → user is logged out.

### Account with both passkey/recovery **and** email — changed

- Previously the plan was e.g. `[PASSKEY, EMAIL]` or `[RECOVERY_PHRASE, EMAIL]`.
- Now the plan is `[PASSKEY]` or `[RECOVERY_PHRASE]` — the trailing email step is gone.

## Component States

| State   | Trigger                                             | UI Behavior                                                                                                   |
| ------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| loading | `getPlan` / `prepareStep` / `executeStep` in flight | `BlurredLoader` overlay inside the modal (`isDeletionLoading`); trash icon still opens the modal immediately. |
| empty   | Account has no passkey and no recovery phrase       | Modal shows only the warning paragraph + Cancel / Remove account (`DEFAULT` mode). No input rendered.         |
| error   | `getPlan` throws, passkey cancelled, wrong phrase   | `toaster.error("Deletion error. …")`; modal stays open so the user can retry or cancel.                       |
| success | `plan.isCompleted === true`                         | `logout()` is called; modal returns `null` (`steps?.isCompleted` guard). No toast.                            |

## Data & State Design

- **Fetch:** `deleteAccountService.getPlan()` → `im.get_account()` (IC canister).
  Unchanged except that the `EMAIL` step is never added to `plan.steps`.
- **Mutations:** `finalizeDeletion` → `userRegistry.address_book_delete_all()`,
  `walletStorageService.clearLocalWalletProfiles`, `im.remove_account()`. Unchanged.
- **New state:** None. No new XState machine, Jotai atom, or context. The deletion
  flow remains a plain async service driven by local `useState` in `SecurityPage`.

### Removed code (full cleanup)

| File                                                                               | Action                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/integration/src/lib/delete-account/service/email-deletion.service.ts`    | Delete file.                                                                                                                                                                                                                                               |
| `packages/integration/src/lib/delete-account/error/incorrect-code.error.ts`        | Delete file (`IncorrectCodeError`).                                                                                                                                                                                                                        |
| `packages/integration/src/lib/delete-account/error/email-already-deleted.error.ts` | Delete file (`EmailAlreadyDeletedError`).                                                                                                                                                                                                                  |
| `packages/integration/src/lib/delete-account/enum/deletion-mode.enum.ts`           | Remove `EMAIL` member.                                                                                                                                                                                                                                     |
| `packages/integration/src/lib/delete-account/delete-account.service.ts`            | Drop `emailDeletionService` import + `export *`, the `[EMAIL, …]` map entry, the `emailDeletionService.isApplicable` block, and the `EmailAlreadyDeletedError` catch in `prepareStep`.                                                                     |
| `apps/nfid-frontend/src/features/security/components/remove-account.tsx`           | Delete the `currentStep === DeletionMode.EMAIL` branch; drop the now-unused `Input` import and `validateEmailCode` import.                                                                                                                                 |
| `apps/nfid-frontend/src/features/security/utils.ts`                                | Remove `validateEmailCode` (confirm no other importers first).                                                                                                                                                                                             |
| `packages/integration/src/lib/delete-account/delete-account.service.spec.ts`       | Remove the two EMAIL tests ("delete account via EMAIL step", "throw IncorrectCodeError …"), the `IncorrectCodeError` import, and any `DeletionMode.EMAIL` assertions. Add a test asserting `getPlan()` never returns `EMAIL` for an email-bearing account. |

> `@nfid/integration` re-exports these symbols via barrels — after deletion, run a
> repo-wide check for `IncorrectCodeError`, `EmailAlreadyDeletedError`,
> `emailDeletionService`, and `DeletionMode.EMAIL` and clean up any stragglers
> (the planning step will enumerate exact barrel files).

## Accessibility

- [ ] Focus trap — handled by existing `ModalComponent` (Radix); unchanged.
- [ ] aria-labels — no new interactive elements; the trash `IconCmpTrash` keeps its
      existing affordance (note: it is a bare clickable `svg` today — out of scope
      to fix here, but call it out in the plan if trivial).
- [ ] Keyboard navigation — unchanged; removing a conditional branch does not alter
      tab order for the remaining `DEFAULT` / `RECOVERY_PHRASE` states.
- [ ] WCAG AA contrast — no visual/style changes.

## Responsive Behavior

- Mobile: unchanged — modal is `w-[95%]`.
- Desktop: unchanged — modal is `md:w-[450px]`.

## Edge Cases

- **Account with an email value but no passkey/recovery device:** plan is
  `[DEFAULT]`; deletion proceeds on the "Remove account" click with no code. This
  is the intended behavior — these accounts have no email device to verify
  against, which is exactly why the email step is being removed.
- **Account with passkey + email:** plan is `[PASSKEY]`; email step no longer
  appended. Passkey confirmation still required.
- **Account with recovery + email:** plan is `[RECOVERY_PHRASE]`; email step no
  longer appended.
- **`prepareStep` `EmailAlreadyDeletedError` short-circuit:** this branch
  (`if (error instanceof EmailAlreadyDeletedError) return finalizeDeletion(plan)`)
  is removed with the error class; no code path can produce it once the email step
  is gone.
- **In-flight modal state:** `RemoveAccountModal` keys its rendered input off
  `currentStep`; with `EMAIL` removed, `currentStep` can only be `undefined`,
  `RECOVERY_PHRASE`, or `DEFAULT` — the `undefined`/`DEFAULT` case already renders
  no input, so no fallback needed.
- **Anti-phishing code:** `antiPhishingCodeService` is used elsewhere; only the
  delete-account import is removed, not the service.

## Out of Scope

- Removing email / Google sign-in itself and its database (separate next-release work).
- Adding a typed-confirmation ("type DELETE") gate for `DEFAULT` mode — explicitly
  declined; the modal button remains the sole gate for that path.
- Any change to passkey or recovery-phrase deletion logic.
- Redesign of the Security page or the "Remove account" modal copy.
- Fixing the bare-`svg` click target on the trash icon (mention only).
