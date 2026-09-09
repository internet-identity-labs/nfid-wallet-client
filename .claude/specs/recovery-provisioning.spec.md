# Spec: Recovery Provisioning on Login (integration layer)

> Status: APPROVED
> Created: 2026-09-07
> Approved: 2026-09-07
> Amended: 2026-09-07 — `getPlan()` now reads `im.get_account()` instead of
> `loadProfileFromStorage()`; the local profile store is no longer touched by this
> module. The store is only written on platform-authenticator ("localDevice")
> login paths, so it was not a reliable source. Both `getPlan` and `checkAccount`
> now share the one canister read + `deviceTypeMapper` normalization.

## Overview

On login we want to make sure every account has at least one "spare" recovery
device registered besides the one just used to sign in — a **passkey** and/or a
**recovery phrase** access point. This spec covers **only the integration
layer**: a new module under `packages/integration/src/lib/` that mirrors the
existing `delete-account` module. It exposes a small service that (1) builds a
_plan_ describing which single recovery device the current user is missing and
(2) verifies, on demand, that the device the UI just walked the user through has
actually landed in the account. The UI that renders the "add a passkey / write
down your phrase" screens is built separately by another developer and is out of
scope here.

The design reuses the shape of `delete-account`: a mode enum, a `Plan` DTO
carrying `steps` + `isCompleted`, per-mode step services registered in a `Map`,
and a typed error class.

## Scope

- **App/area:** `packages/integration` (shared integration package). New folder
  `packages/integration/src/lib/recovery-provisioning/`, sibling to `delete-account/`.
  Barrel export added to `packages/integration/src/index.ts`.
- **Entry point:** called by the authentication flow in `apps/nfid-frontend`
  immediately after a successful login, before the user lands in the wallet.
  Consumer wiring (XState/service call) is out of scope; this spec only fixes the
  contract the consumer will call.
- **Exit state:** `getPlan` resolves with a `RecoveryProvisioningPlan`. When
  `isCompleted === true` (or `steps` is empty) the consumer proceeds straight
  into the wallet. When `steps` has one entry the consumer shows the matching
  add-device UI, then calls `checkAccount(plan)` to confirm and gate entry.

## Naming

Module/type names (`contract.txt` placeholders `RP*` → `RecoveryProvisioning*`):

| Placeholder | Name                          |
| ----------- | ----------------------------- |
| `RPMode`    | `RecoveryProvisioningMode`    |
| `RPPlan`    | `RecoveryProvisioningPlan`    |
| `RPService` | `RecoveryProvisioningService` |
| `RPError`   | `RecoveryProvisioningError`   |
| module dir  | `recovery-provisioning/`      |
| service     | `recoveryProvisioningService` |

## Contract

```ts
export enum RecoveryProvisioningMode {
  PASSKEY = "PASSKEY",
  RECOVERY_PHRASE = "RECOVERY_PHRASE",
}

export interface RecoveryProvisioningPlan {
  steps: RecoveryProvisioningMode[] // 0 or 1 entry — see "one per login" below
  isCompleted: boolean
}

export class RecoveryProvisioningError extends Error {
  constructor(message?: string) {
    super(message ?? "Recovery device provisioning did not complete")
  }
}

export type RecoveryProvisioningService = {
  getPlan(): Promise<RecoveryProvisioningPlan>
  checkAccount(
    plan: RecoveryProvisioningPlan,
  ): Promise<RecoveryProvisioningPlan> // throws RecoveryProvisioningError
}
```

Both methods read the account from `im.get_account()` (the package-local `im`
actor from `../actors`) and normalize its raw candid `access_points`
(`device_type` variant) to a `DeviceType[]` via the module-local
`deviceTypeMapper`. No app-layer type and no `Profile` / local profile store is
involved.

Deltas from the `contract.txt` sketch, and why:

- **`RecoveryProvisioningPlan` has no `account` field.** `checkAccount` fetches a
  fresh account every call (a snapshot from `getPlan` would be stale once the UI
  has added the device), so nothing needs the account carried on the plan.
- **`getPlan()` takes no argument** (no `SignIdentity`, no `Profile`). It calls
  `im.get_account()` itself, so the login call site stays clean. If the canister
  returns no account or the call fails, it **throws** `RecoveryProvisioningError`
  (see behaviour below) — it never fabricates a completed plan. The package-local
  `im` actor is authenticated by the time login completes (same assumption
  `delete-account` relies on — open question 4).
- **`RecoveryProvisioningError` carries only an optional `message`.** No `mode` —
  the caller already knows which mode it asked about (`plan.steps[0]`). No
  `retriable` — the caller treats every `RecoveryProvisioningError` from either
  method the same way: let the user into the wallet, re-offer on the next login.

### Where the account data comes from

- **`getPlan()`** — calls `im.get_account()` **once**. `data[0]` is the account;
  if it is absent (`data === []`) or the call throws → `getPlan` throws
  `RecoveryProvisioningError`. It never guesses and never fabricates a completed
  plan.
- **`checkAccount(plan)`** — also calls `im.get_account()` **once** (a fresh read
  every call, since the UI has just added a device).
- **Both** normalize the raw candid `access_points` (`device_type` variant
  `{ Recovery: null }` / `{ Passkey: null }`) to a `DeviceType[]` via the
  module-local `deviceTypeMapper.toDeviceTypes()` before the `isRegistered`
  predicate. `deviceTypeToDevice` currently lives app-side and is not importable
  from the package, so the module ships its own minimal mapper (spec open
  question 5).

### Per-mode step service (internal)

Mirrors `DeletionStepService`, but detection-only — **the integration never adds
the device itself**, it only reads the account:

```ts
interface RecoveryProvisioningStepService {
  // environment capability: can we even offer this mode here?
  //   PASSKEY -> WebAuthn / platform-authenticator check (see "passkey support")
  //   RECOVERY_PHRASE -> always true
  supportsMode(): Promise<boolean>

  // is an access point of this kind already registered?
  // fed a normalized DeviceType[] (see "Where the account data comes from")
  isRegistered(deviceTypes: DeviceType[]): boolean
}
```

Registered in a `Map<RecoveryProvisioningMode, RecoveryProvisioningStepService>`:

- `passkeyRecoveryProvisioningStepService` — `isRegistered` = `deviceTypes.includes(DeviceType.Passkey)`; `supportsMode` = integration-side WebAuthn detection.
- `recoveryPhraseRecoveryProvisioningStepService` — `isRegistered` = `deviceTypes.includes(DeviceType.Recovery)`; `supportsMode` = `true`.

### `getPlan()` behaviour

1. `const { data } = await im.get_account()`. If `data[0]` is absent or the call
   threw → **`throw new RecoveryProvisioningError(...)`**.
2. `deviceTypes = deviceTypeMapper.toDeviceTypes(account.access_points)`.
3. Walk modes in fixed priority order **`[PASSKEY, RECOVERY_PHRASE]`**. For the
   first mode where `await supportsMode()` is `true` **and**
   `isRegistered(deviceTypes)` is `false`, return
   `{ steps: [mode], isCompleted: false }`.
4. If no mode qualifies, return `{ steps: [], isCompleted: true }`.
5. **One recovery device per login.** Even when both a passkey and a recovery
   phrase are missing, the plan contains at most one step; the other is picked up
   on the next login. (Confirmed with product.)
6. Any other `Error` thrown while doing the above is re-thrown as
   `RecoveryProvisioningError`. `getPlan` never returns a fabricated
   `{ isCompleted: true }` on failure — the consumer is responsible for catching
   `RecoveryProvisioningError` and letting the user into the wallet.

### `checkAccount(plan)` behaviour

Called by the consumer after the add-device UI reports it finished.

1. `mode = plan.steps[0]`. If `plan.steps` is empty / `plan.isCompleted`, return
   `plan` unchanged.
2. Fetch the account **once**: `im.get_account()`. Normalize its `access_points`
   to `DeviceType[]` via `deviceTypeMapper.toDeviceTypes()` and pass that to the
   step service.
3. If `stepServices.get(mode).isRegistered(deviceTypes)` → return
   `{ ...plan, steps: [], isCompleted: true }`.
4. Else → `throw new RecoveryProvisioningError()` — the device the UI tried to
   add is still not on the account.
5. Any other `Error` thrown here (canister/network/our side) is re-thrown as
   `RecoveryProvisioningError`; it is never swallowed into a fabricated completed
   plan. The consumer catches it, lets the user into the wallet, and the missing
   device is re-offered on the next login via `getPlan`.

### Passkey support detection

Done **inside the integration** (`passkeyRecoveryProvisioningStepService.supportsMode()`),
not passed in by the caller. Uses a `navigator.credentials` /
`PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()` style check
(the package already touches `navigator.credentials` in
`authentication/reauthentication.service.ts`). When it returns `false`, `PASSKEY`
never enters a plan and the caller never shows the passkey screen — the browser
is filtered out before that point. If the passkey is unsupported and a recovery
phrase already exists, `getPlan` returns an empty completed plan.

## Component States

UI is out of scope; these are the states the **consumer** observes from the
service return / throw.

| State   | Trigger                                                             | Integration behaviour                                                         |
| ------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| loading | `getPlan` / `checkAccount` (`im.get_account()`) in flight           | Promise pending. One canister call each.                                      |
| empty   | Account already has all applicable recovery devices                 | `getPlan` → `{ steps: [], isCompleted: true }`. Consumer skips to wallet.     |
| pending | Exactly one recovery device missing                                 | `getPlan` → `{ steps: [mode], isCompleted: false }`. Consumer shows add UI.   |
| error   | `getPlan` gets no account back / `im.get_account()` failed          | `getPlan` throws `RecoveryProvisioningError`. Consumer lets the user in.      |
| error   | Device still absent after the add flow / `checkAccount` I/O failure | `checkAccount` throws `RecoveryProvisioningError`. Consumer lets the user in. |
| success | `checkAccount` sees the new access point                            | `{ ...plan, steps: [], isCompleted: true }`.                                  |

Both methods signal every failure by throwing `RecoveryProvisioningError`;
neither fabricates an `{ isCompleted: true }` result on error. The consumer
catches it and proceeds into the wallet (retried next login). No optimistic
updates — `checkAccount` always re-reads the account from the canister before
deciding.

## Data & State Design

- **Fetch:** both `getPlan()` and `checkAccount()` call `im.get_account()`
  **once** (package-local `im` actor from `../actors`, same as
  `delete-account.service.ts`), normalize the raw `access_points` to
  `DeviceType[]` via `deviceTypeMapper.toDeviceTypes()`, and pass that to the step
  service. No local profile store, no fallback; a missing account / failed call
  throws `RecoveryProvisioningError`.
- **Mutations / side effects:** **none in this module.** Registering the passkey
  or recovery-phrase access point (`im.create_access_point` with
  `device_type: { Passkey: null }` / `{ Recovery: null }`, the WebAuthn create
  ceremony, BIP39 mnemonic generation) is done by the UI layer built separately.
  This module only reads.
- **New global state:** none. No XState machine, no Jotai atom in the integration
  package. The consuming app may wrap this in a machine — out of scope.
- **Module layout (mirrors `delete-account/`):**
  ```
  packages/integration/src/lib/recovery-provisioning/
  ├── recovery-provisioning.service.ts        // recoveryProvisioningService + RecoveryProvisioningService interface + barrel re-exports
  ├── recovery-provisioning.service.spec.ts
  ├── enum/recovery-provisioning-mode.enum.ts
  ├── dto/recovery-provisioning-plan.dto.ts
  ├── error/recovery-provisioning.error.ts
  ├── lib/device-type.mapper.ts               // deviceTypeMapper.toDeviceTypes (both getPlan + checkAccount)
  └── service/
      ├── recovery-provisioning-step-service.ts               // RecoveryProvisioningStepService interface
      ├── passkey-recovery-provisioning-step-service.ts
      └── recovery-phrase-recovery-provisioning-step-service.ts
  ```
- Barrel: add `export * from "./lib/recovery-provisioning/recovery-provisioning.service"` to
  `packages/integration/src/index.ts`.

## Accessibility

- [ ] N/A — no UI in this spec. (Consumer UI must meet the standard modal a11y
      bar: focus trap, `aria-label`s, keyboard nav, WCAG AA.)

## Responsive Behavior

- N/A — integration layer only.

## Edge Cases

- **Both passkey and recovery phrase missing** → plan carries only the passkey
  step; recovery phrase surfaces next login.
- **Browser without passkey support** → passkey mode filtered out by
  `supportsMode()`; falls through to recovery phrase or to an empty completed
  plan. User is never shown a passkey screen and is never logged out.
- **`im.get_account()` in `getPlan` returns no account (`data === []`) or fails
  (network/canister)** → `getPlan` throws `RecoveryProvisioningError`. Consumer
  catches it, lets the user in, retried next login.
- **`im.get_account()` fails (network/canister)** in `checkAccount` → throws
  `RecoveryProvisioningError`; consumer lets the user in, retried next login.
- **User abandons / dismisses the add-device UI** → UI calls `checkAccount`,
  access point absent → `RecoveryProvisioningError`; consumer lets the user in
  and the device is re-offered next login.
- **Account already fully provisioned** → `getPlan` returns
  `{ steps: [], isCompleted: true }`; consumer shows nothing.
- **`deviceType` mapping gap** → the raw→`DeviceType` normalization in
  `checkAccount` must cover the `Recovery` and `Passkey` candid variants at
  least; anything unmapped counts as "not present".
- **Race: device added in another tab during login** → `checkAccount` re-reads
  the account, so it will see it and complete.

## Open Questions / To Confirm

1. **Single-step-per-login** is confirmed with product, but confirm the same
   holds when the user has _zero_ recovery devices (still only prompt for one).
2. Exact passkey-support probe: is
   `isUserVerifyingPlatformAuthenticatorAvailable()` the right gate, or a looser
   `window.PublicKeyCredential` presence check (cross-device passkeys)?
3. ~~Confirm every login path writes the profile store before `getPlan`~~ —
   **resolved by the amendment.** `getPlan` no longer reads the profile store; it
   calls `im.get_account()` like `checkAccount`. The only requirement now is that
   the `im` actor is authenticated when `getPlan` runs (same as #4).
4. Confirm the `im` actor is authenticated at the point the consumer calls
   `getPlan` / `checkAccount` right after login, so dropping `SignIdentity` is
   safe.
5. Pin down the raw `device_type` → `DeviceType` normalization in `checkAccount`:
   reuse/move `deviceTypeToDevice` (currently in
   `apps/nfid-frontend/src/integration/identity-manager`) into
   `packages/integration`, or inline a minimal `{ Recovery }` / `{ Passkey }`
   check.
6. Should `getPlan` skip provisioning entirely for account types that can't hold
   these access points (e.g. II-anchored / delegated sessions)? If so, what flag
   identifies them?

## Out of Scope

- Any UI: add-passkey screen, recovery-phrase display/confirm screen, skip
  buttons, toasts, error banners.
- The actual `create_access_point` calls / WebAuthn ceremony / mnemonic
  generation — built by another developer.
- Consumer-side wiring: where in the auth XState flow `getPlan` / `checkAccount`
  are invoked, and how the gate blocks navigation into the wallet.
- Telemetry / analytics events.
- i18n — no strings shipped from the integration layer.
- Localization, animation, responsive behaviour.
