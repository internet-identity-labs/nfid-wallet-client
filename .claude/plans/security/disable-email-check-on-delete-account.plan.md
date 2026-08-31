# Plan: Disable Email Check on Delete Account

> Status: COMPLETE — code + automated checks done; manual dev-server smoke test pending (engineer)
> Spec: .claude/specs/security/disable-email-check-on-delete-account.spec.md
> Created: 2026-08-31

## Summary

Remove the `EMAIL` account-deletion step and all supporting code. After this change
`deleteAccountService.getPlan()` can only return `PASSKEY`, `RECOVERY_PHRASE`, or
`DEFAULT` steps. No new files, no new UI — this is a deletion / refactor.

## New Files

_None._

## Modified Files

| File                                                                         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/integration/src/lib/delete-account/enum/deletion-mode.enum.ts`     | Remove the `EMAIL = "EMAIL"` member.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `packages/integration/src/lib/delete-account/delete-account.service.ts`      | Remove `emailDeletionService` import; remove `export * from "./service/email-deletion.service"`, `export * from "./error/email-already-deleted.error"`, `export * from "./error/incorrect-code.error"`; remove `EmailAlreadyDeletedError` import; remove the `[DeletionMode.EMAIL, emailDeletionService]` map entry; remove the `if (await emailDeletionService.isApplicable(account)) steps.push(DeletionMode.EMAIL)` block in `getPlan`; remove the `if (error instanceof EmailAlreadyDeletedError) return finalizeDeletion(plan)` branch in `prepareStep`. |
| `packages/integration/src/lib/delete-account/delete-account.service.spec.ts` | Remove `IncorrectCodeError` import; delete the two email-only tests (lines ~35, ~89); rewrite the "chain RECOVERY_PHRASE then EMAIL" test (line ~126) to assert recovery-only completion; add a new test for the email-value / `DEFAULT` path. Details in **Tests** below.                                                                                                                                                                                                                                                                                    |
| `apps/nfid-frontend/src/features/security/components/remove-account.tsx`     | Delete the `currentStep === DeletionMode.EMAIL` JSX block (lines ~85–107); remove `Input` (and pre-existing-unused `Loader`) from the `@nfid-frontend/ui` import; remove `validateEmailCode` from the `../utils` import (keep `validateSeedPhrase`); **[deviation, approved 2026-08-31]** add an explicit `isConfirmDisabled` derived value — `currentStep === DeletionMode.DEFAULT ? false : !value                                                                                                                                                          |     | !isValueValid`— and use it for the confirm button's`disabled`, so `DEFAULT` mode (email-only accounts) skips validity checking entirely and the button is clickable. |
| `apps/nfid-frontend/src/features/security/utils.ts`                          | Remove the `validateEmailCode` function (only importer is `remove-account.tsx`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

## Deleted Files

| File                                                                               | Reason                                                       |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `packages/integration/src/lib/delete-account/service/email-deletion.service.ts`    | Email deletion step removed.                                 |
| `packages/integration/src/lib/delete-account/error/incorrect-code.error.ts`        | `IncorrectCodeError` only thrown by the email service.       |
| `packages/integration/src/lib/delete-account/error/email-already-deleted.error.ts` | `EmailAlreadyDeletedError` only thrown by the email service. |

## Types

- [ ] No new types. `DeletionMode` enum loses one member — `Plan.steps: DeletionMode[]`
      and `DeletionError.deletionMode: DeletionMode` still typecheck.

## XState / State Changes

- [ ] N/A — the deletion flow is a plain async service driven by `useState` in
      `SecurityPage`. No machine, atom, or context involved.

## Atoms / Context

- [ ] N/A.

## Implementation Checklist

<!-- Execute EXACTLY ONE checkbox at a time using /execute-ui-plan -->

### Data Layer — integration package

- [x] Remove the `EMAIL` member from `DeletionMode` in
      `packages/integration/src/lib/delete-account/enum/deletion-mode.enum.ts`.
- [x] Delete `packages/integration/src/lib/delete-account/service/email-deletion.service.ts`.
- [x] Delete `packages/integration/src/lib/delete-account/error/incorrect-code.error.ts`
      and `packages/integration/src/lib/delete-account/error/email-already-deleted.error.ts`.
- [x] In `packages/integration/src/lib/delete-account/delete-account.service.ts`:
      drop the `emailDeletionService` and `EmailAlreadyDeletedError` imports; drop the
      three `export *` lines for the deleted files; drop the `[DeletionMode.EMAIL, …]`
      entry from `stepServices`; drop the `emailDeletionService.isApplicable` push in
      `getPlan`; drop the `EmailAlreadyDeletedError` short-circuit in `prepareStep`.
- [x] Repo-wide grep for `DeletionMode.EMAIL`, `emailDeletionService`,
      `IncorrectCodeError`, `EmailAlreadyDeletedError`, `email-deletion.service`,
      `incorrect-code.error`, `email-already-deleted.error` — confirm zero remaining
      references outside the spec test (which is handled next).

### Data Layer — frontend app

- [x] In `apps/nfid-frontend/src/features/security/components/remove-account.tsx`:
      delete the `currentStep === DeletionMode.EMAIL` block; remove `Input` from the
      `@nfid-frontend/ui` import; change `import { validateEmailCode, validateSeedPhrase }`
      to `import { validateSeedPhrase }`.
- [x] In `apps/nfid-frontend/src/features/security/utils.ts`: delete the
      `validateEmailCode` function.
- [x] **[deviation, approved 2026-08-31]** In `remove-account.tsx`, add an explicit
      `isConfirmDisabled` derived value —
      `currentStep === DeletionMode.DEFAULT ? false : !value || !isValueValid` —
      and pass it to the confirm-button `disabled` prop (was `!value || !isValueValid`).
      `DEFAULT` mode renders no input, so it skips validity checking entirely and the
      "Remove account" button is clickable. Spec: button is the sole gate for `DEFAULT`.
- [x] Confirm `apps/nfid-frontend/src/features/security/index.tsx` needs no change
      (it references `DeletionMode.PASSKEY` only; no `EMAIL`, no `IncorrectCodeError`).

### Tests

- [x] In `packages/integration/src/lib/delete-account/delete-account.service.spec.ts`:
      remove the `import { IncorrectCodeError } …` line. _(Also removed now-unused
      `walletStorage` / `serializeUserIdData` imports.)_
- [x] Delete the test `"should delete account via EMAIL step when correct code is provided"`.
- [x] Delete the test `"should throw IncorrectCodeError when wrong email deletion code is submitted"`.
- [x] Rewrite `"should chain RECOVERY_PHRASE then EMAIL steps when both are configured on the account"`
      → `"should require only the RECOVERY_PHRASE step when the account also has an email"`:
      build the same account (email + Recovery access point), assert
      `plan.steps` equals `[DeletionMode.RECOVERY_PHRASE]`, execute the recovery step
      with `RECOVERY_SEED_PHRASE`, assert `result.isCompleted === true`, assert
      `im.get_account()` returns `status_code === 404`, and assert `global.fetch` was
      **not** called (no email lambda round-trip).
- [x] Add test `"should return only the DEFAULT step for an account that has an email value but no passkey or recovery"`:
      `createAccount(..., { email: TEST_EMAIL })`, `mockUserIdData(principal, TEST_EMAIL)`,
      `const plan = await deleteAccountService.getPlan()`, assert
      `plan.steps` equals `[DeletionMode.DEFAULT]`, `await deleteAccountService.prepareStep(plan)`,
      `const result = await deleteAccountService.executeStep(plan, "")`, assert
      `result.isCompleted === true` and `im.get_account()` → `status_code === 404`.
- [x] Keep `"should throw IncorrectSeedPhraseError when wrong recovery phrase is submitted"` unchanged.

### Wiring

- [x] N/A — no routes, no barrel index beyond the `export *` lines already covered
      in the integration-package step. `packages/integration/src/index.ts` line 21
      (`export * from "./lib/delete-account/delete-account.service"`) stays as-is.

### Verification

_Note: the real Nx project names are `nfid-wallet-client` (app, sourceRoot
`apps/nfid-frontend/src`) and `integration` — CLAUDE.md's `nfid-frontend` is stale._

- [x] `yarn nx lint nfid-wallet-client` — passed, zero errors (pre-existing
      warnings only; none in the touched files).
- [x] `yarn nx lint integration` — passed, 0 errors / 171 pre-existing warnings.
- [x] `tsc --noEmit -p apps/nfid-frontend/tsconfig.json` — only `TS2688 'uuid'`,
      confirmed pre-existing on clean `main` via `git stash`. Zero new errors.
- [x] `yarn nx test integration --testFile=delete-account.service.spec.ts` —
      **1 suite / 3 tests passed** (20.6s). Tests run against mainnet canisters +
      the AWS `dev` gateway (`IC_HOST=https://ic0.app` in `config/jest-globals.cjs`),
      no local replica needed. NOTE: `--testPathPattern=` is silently ignored by
      `@nx/jest` 22 + jest 30 — use `--testFile=` or `--testPathPatterns=` (plural).
- [ ] Manual smoke test in dev server: Security page → trash icon on a
      passkey/2FA account still prompts the passkey dialog; on a recovery-phrase
      account still shows the phrase `textarea`; the email code `Input` is gone;
      email-only account shows the plain warning + clickable "Remove account".

## Risks & Notes

- **Integration tests hit a live/local IC replica** (`im.create_account`, lambda
  actor). They are slow (`jest.setTimeout(120000)`) and may require the local
  replica/dfx environment the existing suite already assumes. Do not re-run the
  full suite just to filter — check for an existing test report first, then run
  only the `delete-account` pattern.
- `@nfid/integration` re-exports `delete-account.service` via
  `packages/integration/src/index.ts`. The deleted error classes were re-exported
  transitively through the three `export *` lines in `delete-account.service.ts`;
  removing those lines removes them from the public surface. Grep step above
  guards against an external importer.
- `remove-account.tsx` also imports `Loader` from `@nfid-frontend/ui`, which is
  already unused (pre-existing). Out of scope; leave it unless `lint --fix`
  removes it automatically.
- `antiPhishingCodeService` is imported by the deleted `email-deletion.service.ts`
  but is used elsewhere in the codebase — do not delete it.
- The `DEFAULT` deletion path (`defaultDeletionService.execute` is a no-op) means
  an email-value-only account is deleted immediately on the "Remove account"
  click, with only the modal warning as confirmation. This is the intended,
  spec-approved behavior.
- No i18n/localization files touched (project has none for this modal — copy is
  inline English).
