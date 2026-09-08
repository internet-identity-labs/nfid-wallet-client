# Plan: Delete Account — DEFAULT step button always disabled

> Status: COMPLETE
> Spec: .claude/specs/delete-account-default-button.spec.md
> Created: 2026-09-03

## New Files

None.

## Modified Files

| File                                                                     | Change                                                                                 |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | --- | --------------- |
| `apps/nfid-frontend/src/features/security/components/remove-account.tsx` | Add `isDefaultStep` derivation; change button `disabled` to `!isDefaultStep && (!value |     | !isValueValid)` |

## Types

- [ ] None. `DeletionMode` is already imported in `remove-account.tsx`.

## XState / State Changes

- [ ] None. No machine, atom, or context involved.

## Implementation Checklist

<!-- Execute EXACTLY ONE checkbox at a time using /execute-ui-plan -->

### Components — Feature

- [x] In `remove-account.tsx`, inside `RemoveAccountModal`, derive
      `const isDefaultStep = currentStep === DeletionMode.DEFAULT` (place it after the
      `currentStep` state / before the `return`).
- [x] Change the "Remove account" `<Button>` `disabled` prop from
      `disabled={!value || !isValueValid}` to
      `disabled={!isDefaultStep && (!value || !isValueValid)}`. Leave `onClick={() => executeStep(value)}`
      and everything else untouched.

### Tests

- [x] None. No test changes — FE-only fix. (`remove-account.tsx` has no existing test suite;
      service logic remains covered by `delete-account.service.spec.ts`, untouched here.)

### Verification

- [x] `yarn nx lint nfid-wallet-client --fix` — no new warnings/errors (project is
      `nfid-wallet-client`; CLAUDE.md's `nfid-frontend` name is stale). Pre-existing warnings
      in `remove-account.tsx` (unused `Loader` import, `useEffect` deps) are untouched by this change.
- [x] Typecheck — `tsc --noEmit -p apps/nfid-frontend/tsconfig.json` fails at repo level on a
      pre-existing `TS2688: Cannot find type definition file for 'uuid'` (missing dev dep,
      unrelated); no type errors reported for `security/` or `remove-account.tsx`.
- [ ] Manual smoke test: Security page → remove account as a user whose plan resolves to
      `DEFAULT`; confirm the button is clickable and deletion proceeds. Also confirm the
      EMAIL / RECOVERY_PHRASE steps still gate the button on a valid value.

## Risks & Notes

- Two-line change; no runtime dependencies added; no test changes (FE-only).
- `currentStep` is `undefined` on first render until the `useEffect` sets `steps.steps[0]`;
  with `isDefaultStep === false` the pre-existing gate keeps the button disabled during that
  window — matches spec.
- `PASSKEY` never reaches an interactive modal state (parent auto-runs it in
  `getAccountDeletionSteps`), so it needs no branch here; it also has no input, so the
  pre-existing gate would disable it — acceptable and unchanged.
- No existing test file for this component and none added — verification is lint + typecheck
  - manual smoke.
