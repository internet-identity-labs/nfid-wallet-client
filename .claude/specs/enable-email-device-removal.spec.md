# Spec: Enable Email Device Removal

> Status: APPROVED
> Created: 2026-09-02
> Version tag: v1.9.0

## Overview

Today the email login device (the `{ Email: null }` access point) can only be observed in
Security settings — deletion is prohibited. This feature lifts that restriction, but only
when the account still has safe fallback authentication after the email is gone: at least
one non-legacy passkey **and** a recovery phrase. The work in this spec is **integration
layer only** — a new `emailDeviceService` in the shared `@nfid/integration` package that
exposes a `hasSpareDevices()` predicate and a guarded `removeEmailDevice()`. All UI wiring
(showing the delete control, confirmation dialog, toasts, list refresh) is out of scope and
will be done by another developer on top of this service.

## Scope

- **App/area:** `packages/integration/src/lib/device/` (new folder in the shared
  `@nfid/integration` package). Exported from `packages/integration/src/index.ts`.
- **Entry point:** Consumers import `emailDeviceService` from `@nfid/integration` and call
  `hasSpareDevices()` to decide whether to render/enable a delete affordance for the email
  device, and `removeEmailDevice()` to perform the removal.
- **Exit state:** `removeEmailDevice()` resolves when the email access point has been
  removed from Identity Manager; rejects with `NoSpareAuthMethodError` when the
  spare-device precondition is not met, or `EmailDeviceNotFoundError` when there is no
  email access point.

## User Flow

_(Service-level flow; UI is a separate task.)_

1. Security screen loads the user's devices and calls `emailDeviceService.hasSpareDevices()`.
2. `hasSpareDevices()` calls `im.get_account()`, reads `account.access_points`, and returns:
   - `true` — account has **≥ 1 non-legacy Passkey** access point **and** **≥ 1 Recovery**
     access point.
   - `false` — otherwise (no qualifying passkey, no recovery phrase, or neither).
3. The consuming UI uses the boolean to enable/disable the email-device delete action
   (behaviour of the disabled state is the other developer's decision).
4. When the user confirms deletion, the UI calls `emailDeviceService.removeEmailDevice()`.
5. `removeEmailDevice()` calls `im.get_account()` and:
   - No `{ Email: null }` access point → throws `EmailDeviceNotFoundError`, no removal call.
   - Spare-auth guard fails (same rule as step 2) → throws `NoSpareAuthMethodError`
     (message: `"Missing spare device type"`), no removal call is made.
   - Guard passes → re-authenticates with a passkey (see step 6), then calls
     `im.remove_access_point({ pub_key: <email principal_id> })`.
6. **Passkey re-auth before removal:** the current session may be signed by the email
   device that is about to be deleted, which would leave the caller unauthorized the moment
   the access point is gone. So, immediately before the removal call, `removeEmailDevice()`
   swaps the active identity to a passkey-backed delegation via the shared
   `reauthenticationService.reauthenticateWithPasskey(accessPoints)` method (a WebAuthn
   ceremony + fresh FE delegation chain + `authState.set(...)`). This is the same routine
   `passkeyDeletionService.prepare()` runs today, extracted into
   `authentication/reauthentication.service.ts` and reused by both. If the ceremony is
   cancelled/fails it throws `PasskeyNotConfirmedError` and no removal call is made.
   The re-auth is **unconditional** — it runs even when the current session is already
   passkey-backed. `authState.activeDevicePrincipalId` only identifies the specific device
   for a fresh passkey login (it collapses to the anchor principal after a page reload, and
   email logins never set it), so there is no reliable "am I already on a passkey" check to
   gate on. The extra WebAuthn prompt also serves as a security confirmation before a
   destructive auth-method change.
7. On success the promise resolves `void`; the UI refreshes its device list.

## Component States

_(No components in scope. States below describe `emailDeviceService` outcomes.)_

| State   | Trigger                                                                                                          | Service Behavior                                                                                   |
| ------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| loading | `hasSpareDevices()` / `removeEmailDevice()` in flight (awaiting `im.get_account()` / `im.remove_access_point()`) | Returns a pending `Promise`; no internal caching — caller controls loading UI.                     |
| empty   | Account has no email access point                                                                                | `hasSpareDevices()` returns `false`. `removeEmailDevice()` throws `EmailDeviceNotFoundError`.      |
| error   | Spare-auth precondition not met                                                                                  | `removeEmailDevice()` throws `NoSpareAuthMethodError` — never reaches `remove_access_point`.       |
| error   | `im.get_account()` returns no account / non-200                                                                  | Both methods reject with a plain `Error` describing the failure.                                   |
| error   | `im.remove_access_point()` rejects                                                                               | `removeEmailDevice()` rejects, wrapping the canister message (`Not able to remove ap: <message>`). |
| success | Precondition met, email access point found and removed                                                           | `removeEmailDevice()` resolves `void`.                                                             |

## Data & State Design

- **Fetch:** `im.get_account()` (from `@nfid/integration` actors) → `account.access_points:
AccessPointResponse[]`. Both public methods always call `im.get_account()` internally and
  take no arguments (no pre-loaded-data overload in v1 — keep it simple).
- Device kind is read from `access_point.device_type` using the existing
  `hasOwnProperty(device_type, "Passkey" | "Recovery" | "Email")` helper from
  `../test-utils` (same approach as `passkey-deletion.service.ts` /
  `recovery-phrase-deletion.service.ts`).
- **Spare-auth rule (shared by both methods):**
  - non-legacy passkey = access point where `hasOwnProperty(device_type, "Passkey")`
    **and** `credential_id[0]?.length` is truthy (mirrors `passkeyDeletionService.prepare`).
  - recovery phrase = access point where `hasOwnProperty(device_type, "Recovery")`.
  - rule passes only when **both** are present.
- **Mutations:** `im.remove_access_point({ pub_key })` where `pub_key` is the email access
  point's `principal_id` (matches `removeAccessPoint()` in
  `apps/nfid-frontend/src/integration/identity-manager/index.ts:387`).
- **New state:** none. No XState machine, no Jotai atom, no SWR hook in this package. The
  service is a stateless object literal exported as a singleton `emailDeviceService`,
  following the `deleteAccountService` pattern.

### Proposed file layout

```
packages/integration/src/lib/device/
├── email-device.service.ts           ← exports `emailDeviceService` (object literal, typed by DTO)
├── email-device.service.spec.ts      ← unit/integration tests
├── dto/
│   └── email-device-service.dto.ts   ← `EmailDeviceService` interface
└── error/
    ├── no-spare-auth-method.error.ts  ← `NoSpareAuthMethodError extends Error`
    └── email-device-not-found.error.ts ← `EmailDeviceNotFoundError extends Error`
```

### Public contract

```ts
export interface EmailDeviceService {
  /** true only when the account has ≥1 non-legacy Passkey AND ≥1 Recovery access point. */
  hasSpareDevices(): Promise<boolean>
  /**
   * Removes the email access point from Identity Manager.
   * @throws EmailDeviceNotFoundError when the account has no email access point.
   * @throws NoSpareAuthMethodError   when hasSpareDevices() would be false.
   */
  removeEmailDevice(): Promise<void>
}

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

- `packages/integration/src/index.ts` gains
  `export * from "./lib/device/email-device.service"`.

## Accessibility

- N/A — no UI in scope. (a11y for the delete control / confirmation dialog belongs to the
  follow-up UI task.)

## Responsive Behavior

- N/A — integration layer only.

## Edge Cases

- **No email device on the account:** `hasSpareDevices()` returns `false`.
  `removeEmailDevice()` throws `EmailDeviceNotFoundError` (not a silent no-op) so the UI can
  distinguish "nothing to do" from "blocked by the spare-auth rule".
- **Passkey present but no recovery phrase (or vice versa):** `hasSpareDevices()` returns
  `false`; `removeEmailDevice()` throws `NoSpareAuthMethodError`.
- **Only legacy passkeys (empty `credential_id`):** do **not** satisfy the passkey
  requirement — `hasSpareDevices()` returns `false`. A real WebAuthn credential is required
  as the fallback.
- **II-based accounts (`wallet === II`):** v1 only removes the Identity Manager access
  point via `im.remove_access_point`. It does **not** touch the II anchor's devices. Note
  for review — email devices are not expected to exist on II anchors, but confirm.
- **Race — email device removed between the predicate call and `removeEmailDevice()`:**
  `removeEmailDevice()` re-fetches the account and hits the "email device not found" path,
  surfacing `EmailDeviceNotFoundError`.
- **Client guard vs. backend:** `removeEmailDevice()` trusts its own in-method guard and
  does not call `remove_access_point` when the guard fails. If the canister _also_ enforces
  the rule and rejects a call that passed the client guard, that rejection is wrapped and
  rethrown as-is (not normalised to `NoSpareAuthMethodError`) — treated as an unexpected
  desync.

## Out of Scope

- Any UI: rendering/enabling the delete button, confirmation modal, success/error toasts,
  device-list refresh, disabled-state tooltip copy.
- A 2FA / OTP challenge beyond the passkey re-auth described in User Flow step 6.
- Removing the email from the user profile (`profile.email`) or unlinking Google.
- Touching II anchor devices.
- i18n / copy.
- Backend / canister changes.
- Caching, an SWR hook wrapper, or a pre-loaded-access-points overload for the service.

## Resolved Decisions

1. `hasSpareDevices()` requires **both** a passkey and a recovery phrase.
2. Legacy passkeys (empty `credential_id`) do **not** count — a non-legacy passkey is required.
3. Both methods always call `im.get_account()` internally; no pre-loaded-data parameter.
4. `removeEmailDevice()` throws `EmailDeviceNotFoundError` when no email device exists (no no-op).
5. Naming: service `emailDeviceService`; methods `hasSpareDevices()` / `removeEmailDevice()`;
   errors `NoSpareAuthMethodError` (message
   `"Email device cannot be removed without a passkey and recovery phrase as backup."`) and
   `EmailDeviceNotFoundError` (message `"No email device found on this account."`).
6. `removeEmailDevice()` re-authenticates with a passkey right before
   `im.remove_access_point` so the caller is not left unauthorized when the email device it
   was signed with is removed. The passkey ceremony + `authState.set` currently inlined in
   `passkeyDeletionService.prepare()` is extracted to a shared
   `authentication/reauthentication.service.ts` (`reauthenticationService.reauthenticateWithPasskey`
   - `PasskeySignIdentity`) and both call sites use it. The re-auth runs only after the
     not-found and spare-auth guards pass.
7. The re-auth is **unconditional** — not gated on the current session's device type.
   `authState.activeDevicePrincipalId` is only device-specific for a fresh passkey login
   (collapses to the anchor principal after reload; email logins never set it), so there is
   no reliable current-is-passkey check. A passkey user therefore sees one extra WebAuthn
   prompt, which also acts as a security confirmation before the destructive change.
