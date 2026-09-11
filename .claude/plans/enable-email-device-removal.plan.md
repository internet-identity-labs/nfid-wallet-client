# Plan: Enable Email Device Removal

> Status: IMPLEMENTED — increment 2 (passkey re-auth) done, awaiting engineer review; increment 1 complete
> Spec: .claude/specs/enable-email-device-removal.spec.md
> Created: 2026-09-02

## Summary

Integration-layer only. Add a new `emailDeviceService` singleton to the shared
`@nfid/integration` package under `packages/integration/src/lib/device/`, exposing
`hasSpareDevices()` and `removeEmailDevice()`, plus two typed errors. No UI, no XState, no
Jotai, no SWR. Mirrors the structure and conventions of
`packages/integration/src/lib/delete-account/`.

## New Files

| File                                                                              | Type                      | Purpose                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/integration/src/lib/device/error/no-spare-auth-method.error.ts`         | Error class               | `NoSpareAuthMethodError extends Error` (default message `"Email device cannot be removed without a passkey and recovery phrase as backup."`)                                                                                                                                      |
| `packages/integration/src/lib/device/error/email-device-not-found.error.ts`       | Error class               | `EmailDeviceNotFoundError extends Error` (default message `"No email device found on this account."`)                                                                                                                                                                             |
| `packages/integration/src/lib/device/email-device.service.ts`                     | Service (barrel)          | `class EmailDeviceService` + singleton `emailDeviceService` + re-exports of the errors (mirrors `delete-account.service.ts`). The public method contract (TSDoc for `hasSpareDevices` / `removeEmailDevice`) lives on the class — no separate dto interface file.                 |
| `packages/integration/src/lib/device/email-device.service.spec.ts`                | Unit test                 | Tests for both methods with `im` actor mocked                                                                                                                                                                                                                                     |
| `packages/integration/src/lib/authentication/reauthenticate-with-passkey.ts`      | Auth helper (increment 2) | `reauthenticateWithPasskey(accessPoints)` + `PasskeySignIdentity`, extracted verbatim from `passkeyDeletionService.prepare()`: WebAuthn ceremony → FE delegation chain → `authState.set(...)`. Throws `PasskeyNotConfirmedError` when no non-legacy passkey / ceremony cancelled. |
| `packages/integration/src/lib/authentication/reauthenticate-with-passkey.spec.ts` | Unit test (increment 2)   | `getPasskey` / `requestFEDelegationChain` / `authState.set` / `navigator.credentials` mocked                                                                                                                                                                                      |

## Modified Files

| File                                                                              | Change                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/integration/src/index.ts`                                               | Add `export * from "./lib/device/email-device.service"` (after the `delete-account` line)                                                                                                                                                                                                 |
| `packages/integration/src/lib/delete-account/service/passkey-deletion.service.ts` | **Increment 2.** Remove the local `PasskeySignIdentity` class + `PasskeyCredential` type + now-unused imports; `prepare()` body becomes `await reauthenticateWithPasskey(plan.account.access_points)` inside its existing `try/catch` that maps to `DeletionError`. Behaviour-preserving. |
| `packages/integration/src/lib/device/email-device.service.ts`                     | **Increment 2.** In `removeEmailDevice()`, after the not-found and spare-auth guards pass and before `im.remove_access_point`, `await reauthenticateWithPasskey(accessPoints)`.                                                                                                           |
| `packages/integration/src/lib/device/email-device.service.spec.ts`                | **Increment 2.** `jest.mock` the re-auth helper; assert it is awaited before `im.remove_access_point`, and not called when either guard fails.                                                                                                                                            |

## Types

- No new type files. `EmailDeviceService` is the service class itself. Reuses
  `AccessPointResponse` / `AccountResponse` / `DeviceType` from
  `../_ic_api/identity_manager.d`. No changes to `apps/nfid-frontend/src/types/`.

## XState / State Changes

- None.

## Atoms / Context

- None.

## Implementation Details (reference for execution)

### `hasSpareDevices(): Promise<boolean>`

1. `const { data, status_code, error } = await im.get_account()`.
2. If `status_code !== 200` or `!data[0]` → throw `Error(`emailDeviceService.fetchAccessPoints im.get_account: ${error[0] ?? status_code}`)` (shared private `fetchAccessPoints()`, no `caller` arg — stack trace identifies the public method).
3. `const accessPoints = data[0].access_points`.
4. `hasNonLegacyPasskey = accessPoints.some(ap => hasOwnProperty(ap.device_type, "Passkey") && !!ap.credential_id[0]?.length)`.
5. `hasRecoveryPhrase = accessPoints.some(ap => hasOwnProperty(ap.device_type, "Recovery"))`.
6. `return hasNonLegacyPasskey && hasRecoveryPhrase`.

- `hasOwnProperty` imported from `../test-utils` (same as `passkey-deletion.service.ts`).
- The rule lives in a private method `hasSpareAuthMethods(accessPoints)` on the service
  class so `removeEmailDevice()` reuses the exact rule. Service is a `class EmailDevice
implements EmailDeviceService` exported as the singleton `emailDeviceService`; the
  device-type predicates (`isNonLegacyPasskey`, `isRecoveryPhrase`, `isEmailDevice`) and
  `fetchAccessPoints` are private methods.

### `removeEmailDevice(): Promise<void>`

1. `const accessPoints = await this.fetchAccessPoints()` (shared guard).
2. `const emailAccessPoint = accessPoints.find(ap => hasOwnProperty(ap.device_type, "Email"))`.
3. If `!emailAccessPoint` → `throw new EmailDeviceNotFoundError()`.
4. If `!hasSpareAuthMethods(accessPoints)` → `throw new NoSpareAuthMethodError()`.
   (No `im.remove_access_point` call.)
5. `const { error, status_code } = await im.remove_access_point({ pub_key: emailAccessPoint.principal_id })`.
6. If `status_code !== 200` → `throw new Error(`emailDeviceService.removeEmailDevice im.remove_access_point: ${error[0] ?? status_code}`)`.
7. Resolve `void`.

- Ordering note (matches spec §User Flow step 5): **email-device-not-found is checked
  before the spare-auth guard**, so a caller with no email device always gets
  `EmailDeviceNotFoundError`, never `NoSpareAuthMethodError`.

### Error classes

```ts
export class NoSpareAuthMethodError extends Error {
  constructor(
    message = "Email device cannot be removed without a passkey and recovery phrase as backup.",
  ) {
    super(message)
  }
}
export class EmailDeviceNotFoundError extends Error {
  constructor(message = "No email device found on this account.") {
    super(message)
  }
}
```

Consumers branch with `instanceof` (`error instanceof NoSpareAuthMethodError`), matching
how `delete-account` handles its error types. No `this.name` assignment — consistent with
the existing error classes in the package (`DeletionError`, `IncorrectCodeError`, etc.).

### `email-device.service.ts` shape

```ts
import { AccessPointResponse } from "../_ic_api/identity_manager.d"
import { im } from "../actors"
import { hasOwnProperty } from "../test-utils"
import { EmailDeviceNotFoundError } from "./error/email-device-not-found.error"
import { NoSpareAuthMethodError } from "./error/no-spare-auth-method.error"

export * from "./error/email-device-not-found.error"
export * from "./error/no-spare-auth-method.error"

export class EmailDeviceService {
  async hasSpareDevices(): Promise<boolean> {
    /* … */
  }
  async removeEmailDevice(): Promise<void> {
    /* … */
  }

  private async fetchAccessPoints() {
    /* … */
  }
  private hasSpareAuthMethods(accessPoints: AccessPointResponse[]) {
    /* … */
  }
  private isNonLegacyPasskey(accessPoint: AccessPointResponse) {
    /* … */
  }
  private isRecoveryPhrase(accessPoint: AccessPointResponse) {
    /* … */
  }
  private isEmailDevice(accessPoint: AccessPointResponse) {
    /* … */
  }
}

export const emailDeviceService = new EmailDeviceService()
```

## Implementation Checklist

<!-- Execute EXACTLY ONE checkbox at a time using /execute-ui-plan -->

### Errors

- [x] Create `packages/integration/src/lib/device/error/no-spare-auth-method.error.ts` (`NoSpareAuthMethodError extends Error`, default message `"Email device cannot be removed without a passkey and recovery phrase as backup."`; no `this.name`, matching existing package error classes)
- [x] Create `packages/integration/src/lib/device/error/email-device-not-found.error.ts` (`EmailDeviceNotFoundError extends Error`, default message `"No email device found on this account."`; no `this.name`)

### Data Layer / Service

- [x] Create `packages/integration/src/lib/device/email-device.service.ts`: `export class EmailDeviceService` with private `hasSpareAuthMethods` / `fetchAccessPoints` / device-type predicate methods, exported as singleton `emailDeviceService`; implements `hasSpareDevices()` and `removeEmailDevice()` per "Implementation Details"; re-export both errors from this file

### Wiring

- [x] Add `export * from "./lib/device/email-device.service"` to `packages/integration/src/index.ts` (place next to the existing `delete-account` export)

### Tests

- [x] Create `packages/integration/src/lib/device/email-device.service.spec.ts` — unit tests, `jest.spyOn(im, "get_account")` / `jest.spyOn(im, "remove_access_point")` mocked (no local replica). Cases:
  - `hasSpareDevices()` → `true` when access points contain a non-legacy Passkey (non-empty `credential_id`) **and** a Recovery
  - `hasSpareDevices()` → `false` when only a legacy Passkey (empty `credential_id`) + Recovery
  - `hasSpareDevices()` → `false` when Passkey present but no Recovery
  - `hasSpareDevices()` → `false` when Recovery present but no Passkey
  - `hasSpareDevices()` → `false` when neither / no email device present
  - `hasSpareDevices()` rejects with `Error` when `im.get_account()` returns `status_code !== 200`
  - `removeEmailDevice()` → calls `im.remove_access_point({ pub_key: <email principal_id> })` and resolves when spare-auth rule passes
  - `removeEmailDevice()` → throws `EmailDeviceNotFoundError` when no `{ Email: null }` access point (even if spare-auth would also fail)
  - `removeEmailDevice()` → throws `NoSpareAuthMethodError` and does **not** call `im.remove_access_point` when email device exists but spare-auth rule fails
  - `removeEmailDevice()` → rejects with `Error` when `im.remove_access_point()` returns `status_code !== 200`

### Increment 2 — passkey re-auth before removal

- [x] Create `packages/integration/src/lib/authentication/reauthentication.service.ts`: moved `PasskeySignIdentity` (and its `PasskeyCredential` type) out of `passkey-deletion.service.ts`; `export class ReauthenticationService` with `reauthenticateWithPasskey(accessPoints: AccessPointResponse[]): Promise<void>` doing the exact sequence from the old `passkeyDeletionService.prepare()` (filter non-legacy passkeys via private `isNonLegacyPasskey` → `PasskeyNotConfirmedError` if none → `getPasskey` → build credentials → `PasskeySignIdentity` → `requestFEDelegationChain` → `DelegationIdentity.fromDelegation` → `authState.set`), exported as singleton `reauthenticationService`. No `Plan`/`DeletionError` coupling — raw `PasskeyNotConfirmedError` on the no-passkey path.
- [x] Refactor `passkey-deletion.service.ts`: deleted the local `PasskeySignIdentity`/`PasskeyCredential` and now-unused imports; `prepare()` keeps its `try/catch` (→ `DeletionError`) with body `await reauthenticationService.reauthenticateWithPasskey(plan.account.access_points)`
- [x] Edit `email-device.service.ts`: `import { reauthenticationService } from "../authentication/reauthentication.service"`; in `removeEmailDevice()` call `await reauthenticationService.reauthenticateWithPasskey(accessPoints)` after both guards, before `im.remove_access_point`
- [x] Create `packages/integration/src/lib/authentication/reauthentication.service.spec.ts` — Given/When/Then, `it("should …")`: throws `PasskeyNotConfirmedError` when no non-legacy passkey (no `getPasskey` call); happy path calls `authState.set` with the passkey delegation (mocks: `getPasskey`, `requestFEDelegationChain`, `authState.set`)
- [x] Update `email-device.service.spec.ts`: `jest.mock("../authentication/reauthentication.service")`; added cases — `removeEmailDevice()` awaits the re-auth before `im.remove_access_point` (invocation order asserted); not called on `EmailDeviceNotFoundError`; not called on `NoSpareAuthMethodError`; propagates a re-auth rejection without calling the canister
- [x] `yarn nx lint integration --fix` — 0 errors, 0 warnings in touched files (171 pre-existing warnings unchanged)
- [x] `yarn nx test integration email-device.service.spec.ts` (11/11) and `yarn nx test integration reauthentication.service.spec.ts` (2/2) — all green
- [x] `yarn nx build integration` — tsc clean

**Not done (out of scope / deferred):** `reauthenticationService` is not added to `packages/integration/src/index.ts` (mirrors `passkeyDeletionService`, which is also not in the barrel — only `deleteAccountService` / `emailDeviceService` are). `delete-account.service.spec.ts` untouched: it never exercises `passkeyDeletionService.prepare()` (its `createAccount` helper leaves `is2fa_enabled` false, so `isApplicable` returns false), and the refactor is behaviour-preserving.

### Verification

- [x] `yarn nx lint integration --fix` — zero errors (171 pre-existing warnings, none in new files)
- [x] `yarn nx test integration email-device.service.spec.ts` — 10/10 passing in ~6s (the executor takes the test file as a positional `[testFile]` arg; `--testPathPattern` is silently ignored under Jest 30, which renamed it `--testPathPatterns`)
- [x] `yarn nx build integration` — tsc clean (also builds `config`, `client-db`)
- [x] Confirmed `EmailDeviceService`, `emailDeviceService`, `NoSpareAuthMethodError`, `EmailDeviceNotFoundError` emitted in `dist/packages/integration/src/lib/device/` and re-exported via the package barrel

## Risks & Notes

- **Import path for `hasOwnProperty`**: `passkey-deletion.service.ts` imports it from
  `../../test-utils`; from `lib/device/` the correct depth is `../test-utils`. Verify at
  execution time.
- **`test-utils` in a shipped path**: `delete-account` services already import from
  `../test-utils` in production code and it's exported from the package index, so this is an
  accepted pattern here — no new concern.
- **Legacy-passkey definition**: "non-legacy" = `device_type` is `Passkey` **and**
  `credential_id[0]?.length` truthy. This matches `passkeyDeletionService.prepare`'s filter.
  If product later wants II/`Unknown`-type devices to count, the `hasSpareAuthMethods`
  helper is the single place to change.
- **II anchors**: unchanged from spec — v1 only removes the IM access point, does not touch
  II anchor devices. Still flagged for reviewer confirmation that email devices never exist
  on II anchors.
- **No pre-check bypass**: `removeEmailDevice()` intentionally never calls
  `remove_access_point` when its client guard fails; a canister-side rejection that slips
  through is surfaced as a generic `Error`, not normalised to `NoSpareAuthMethodError`
  (spec §Edge Cases "Client guard vs. backend").
- **Test style**: chose fast unit tests with a mocked `im` actor rather than the
  replica-backed integration style used by `delete-account.service.spec.ts` (which needs a
  running local replica and `jest.setTimeout(120000)`). If the team prefers consistency
  with `delete-account`, swap the Tests checkbox for a `createAccount`-based integration
  spec — larger and slower.
