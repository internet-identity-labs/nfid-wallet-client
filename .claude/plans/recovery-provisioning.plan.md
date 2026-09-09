# Plan: Recovery Provisioning on Login (integration layer)

> Status: COMPLETE
> Spec: .claude/specs/recovery-provisioning.spec.md
> Created: 2026-09-07
> Approved: 2026-09-07
> Amended: 2026-09-07 — `getPlan()` switched from `loadProfileFromStorage()` to
> `im.get_account()` (spec amendment of the same date). The local profile store
> is no longer imported by this module; both `getPlan` and `checkAccount` share
> the one canister read + `deviceTypeMapper.toDeviceTypes()` normalization.

## Scope reminder

Integration layer only, inside `packages/integration` (nx project `integration`).
**No UI, no XState, no Jotai, no routes, no Storybook** — those are a separate
developer's job. This plan produces one new module that mirrors
`packages/integration/src/lib/delete-account/` and one barrel-export edit.

## Codebase Analysis

- **Pattern to mirror:** `packages/integration/src/lib/delete-account/` —
  `delete-account.service.ts` (orchestrator + barrel re-exports), `enum/`,
  `dto/`, `error/`, `service/` step services registered in a `Map`,
  `delete-account.service.spec.ts`.
- **`im` actor:** `packages/integration/src/lib/actors.ts:125`
  (`export const im`). `im.get_account()` resolves to `{ data: [account], … }`;
  `delete-account.service.ts:38-39` reads `const { data } = await im.get_account(); const account = data[0]!`.
- **`AccountResponse` type:** `packages/integration/src/lib/_ic_api/identity_manager.d.ts`
  (`access_points: AccessPointRequest[]`, each `device_type: DeviceType` candid
  variant `{ Passkey: null } | { Recovery: null } | …`).
- **`hasOwnProperty` narrowing helper:** `packages/integration/src/lib/test-utils`
  — already used by `delete-account/service/recovery-phrase-deletion.service.ts`
  as `hasOwnProperty(accessPoint.device_type, "Recovery")`.
- **Domain `DeviceType` enum + `AccessPoint`/`Profile` types:**
  `packages/integration/src/lib/identity-manager/access-points.ts`
  (`enum DeviceType { … Passkey, Recovery … }`),
  `packages/integration/src/lib/identity-manager/profile/types.ts`
  (`Profile.accessPoints: AccessPoint[]`, `AccessPoint.deviceType: DeviceType`).
- **Profile store (NOT used):** `loadProfileFromStorage()` is only written on
  platform-authenticator ("localDevice") login paths (`setProfileToStorage` gated
  by `!withSecurityDevices` / `sessionSource === "localDevice"`), so it is not a
  reliable source at login. This module does not touch it — `getPlan` reads
  `im.get_account()` instead (amendment 2026-09-07).
- **Raw → domain device-type mapper:** `deviceTypeToDevice()` exists only
  app-side (`apps/nfid-frontend/src/integration/identity-manager/index.ts:~498`).
  This plan adds a minimal local equivalent in the module rather than moving it
  (spec open question 5).
- **WebAuthn probe:** no package-level helper today (only
  `navigator.credentials` use in `authentication/reauthentication.service.ts`).
  App-side has `isWebAuthNSupported` / `fetchWebAuthnPlatformCapability`
  (`apps/nfid-frontend/src/integration/device/index.ts`) — not importable from
  the package, so this plan adds a small probe in
  `service/passkey-recovery-provisioning-step-service.ts`
  (spec open question 2).
- **Barrel:** `packages/integration/src/index.ts:21`
  (`export * from "./lib/delete-account/delete-account.service"`).
- **nx targets for `integration`:** `build`, `lint`, `test` (no `typecheck`
  target — use `tsc --noEmit`).

## New Files

| File                                                                                                               | Type      | Purpose                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/integration/src/lib/recovery-provisioning/enum/recovery-provisioning-mode.enum.ts`                       | Enum      | `RecoveryProvisioningMode { PASSKEY, RECOVERY_PHRASE }`                                                                                                 |
| `packages/integration/src/lib/recovery-provisioning/dto/recovery-provisioning-plan.dto.ts`                         | DTO       | `RecoveryProvisioningPlan { steps: RecoveryProvisioningMode[]; isCompleted: boolean }`                                                                  |
| `packages/integration/src/lib/recovery-provisioning/service/recovery-provisioning-step-service.ts`                 | Interface | `RecoveryProvisioningStepService` interface (`supportsMode()`, `isRegistered(deviceTypes)`)                                                             |
| `packages/integration/src/lib/recovery-provisioning/error/recovery-provisioning.error.ts`                          | Error     | `RecoveryProvisioningError extends Error` (optional `message` only)                                                                                     |
| `packages/integration/src/lib/recovery-provisioning/lib/device-type.mapper.ts`                                     | Mapper    | `deviceTypeMapper` object — `toDeviceTypes(access_points)`: raw `AccessPointResponse[]` → `DeviceType[]`, used by **both** `getPlan` and `checkAccount` |
| `packages/integration/src/lib/recovery-provisioning/service/passkey-recovery-provisioning-step-service.ts`         | Service   | `passkeyRecoveryProvisioningStepService`: `supportsMode()` WebAuthn probe, `isRegistered` = includes `DeviceType.Passkey`                               |
| `packages/integration/src/lib/recovery-provisioning/service/recovery-phrase-recovery-provisioning-step-service.ts` | Service   | `recoveryPhraseRecoveryProvisioningStepService`: `supportsMode()` = `true`, `isRegistered` = includes `DeviceType.Recovery`                             |
| `packages/integration/src/lib/recovery-provisioning/recovery-provisioning.service.ts`                              | Service   | `recoveryProvisioningService` orchestrator + `RecoveryProvisioningService` interface + barrel re-exports (mirrors `delete-account.service.ts`)          |
| `packages/integration/src/lib/recovery-provisioning/recovery-provisioning.service.spec.ts`                         | Test      | Unit tests — `im.get_account` (`jest.spyOn`) and `window.PublicKeyCredential` mocked                                                                    |

## Modified Files

| File                                | Change                                                                                          |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| `packages/integration/src/index.ts` | Add `export * from "./lib/recovery-provisioning/recovery-provisioning.service"` next to line 21 |

## Types

- [x] `RecoveryProvisioningMode` (enum) — `enum/recovery-provisioning-mode.enum.ts`
- [x] `RecoveryProvisioningPlan` — `dto/recovery-provisioning-plan.dto.ts`
- [x] `RecoveryProvisioningStepService` — `dto/recovery-provisioning-step-service.dto.ts`
- [x] `RecoveryProvisioningService` — `dto/recovery-provisioning-service.dto.ts`
- [x] `RecoveryProvisioningError` — `error/recovery-provisioning.error.ts`

## XState / State Changes

- N/A — integration layer. No machine, atom, or context in this plan. The
  consumer app will wrap `recoveryProvisioningService` in its own auth-flow state
  (out of scope).

## Implementation Checklist

<!-- Execute EXACTLY ONE checkbox at a time using /execute-ui-plan -->

### Types & Interfaces

- [x] Create `enum/recovery-provisioning-mode.enum.ts` with `RecoveryProvisioningMode { PASSKEY = "PASSKEY", RECOVERY_PHRASE = "RECOVERY_PHRASE" }`.
- [x] Create `dto/recovery-provisioning-plan.dto.ts` — `RecoveryProvisioningPlan { steps: RecoveryProvisioningMode[]; isCompleted: boolean }`.
- [x] Create `service/recovery-provisioning-step-service.ts` — `RecoveryProvisioningStepService` interface `{ supportsMode(): Promise<boolean>; isRegistered(deviceTypes: DeviceType[]): boolean }` (import `DeviceType` from `../../identity-manager/access-points`).
- [x] `RecoveryProvisioningService` interface `{ getPlan(): Promise<RecoveryProvisioningPlan>; checkAccount(plan: RecoveryProvisioningPlan): Promise<RecoveryProvisioningPlan> }` — declared inline in `recovery-provisioning.service.ts` (co-located with the service it types).
- [x] Create `error/recovery-provisioning.error.ts` — `RecoveryProvisioningError extends Error` with `constructor(message?: string) { super(message ?? "Recovery device provisioning did not complete") }`.

### Data Layer

- [x] Create `lib/device-type.mapper.ts` — `deviceTypeMapper` object with `toDeviceTypes(accessPoints: AccessPointResponse[]): DeviceType[]`, used by **both** `getPlan` and `checkAccount`: map each `device_type` candid variant → `DeviceType` via `hasOwnProperty` checks (from `../../test-utils`) for at least `"Passkey"` and `"Recovery"`; drop anything unmapped. Implemented functionally with `flatMap` (`[] | [DeviceType]`).

### State Machine

- N/A.

### Atoms / Context

- N/A.

### Services — step services

- [x] Create `service/recovery-phrase-recovery-provisioning-step-service.ts` — `recoveryPhraseRecoveryProvisioningStepService: RecoveryProvisioningStepService` with `supportsMode: async () => true` and `isRegistered: (deviceTypes) => deviceTypes.includes(DeviceType.Recovery)`.
- [x] Create `service/passkey-recovery-provisioning-step-service.ts` — `passkeyRecoveryProvisioningStepService: RecoveryProvisioningStepService` with `isRegistered: (deviceTypes) => deviceTypes.includes(DeviceType.Passkey)` and `supportsMode()`: return `false` if `typeof window === "undefined"` or no `window.PublicKeyCredential`; otherwise `await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()` wrapped in try/catch → `false` on throw. (Probe choice = spec open question 2.)

### Services — orchestrator

- [x] Create `recovery-provisioning.service.ts`:
  - Imports: `im` from `../actors`, the step services, `deviceTypeMapper`, `RecoveryProvisioningError`, `RecoveryProvisioningStepService` from `./service/recovery-provisioning-step-service`, types. (No profile-store import.)
  - Declare the `RecoveryProvisioningService` interface inline (co-located with the service).
  - `stepServices = new Map<RecoveryProvisioningMode, RecoveryProvisioningStepService>([[PASSKEY, passkeyRecoveryProvisioningStepService], [RECOVERY_PHRASE, recoveryPhraseRecoveryProvisioningStepService]])`. No separate `PRIORITY` array — `Map` iteration follows insertion order, so the entry order _is_ the priority order.
  - `getPlan()`: `try { const { data } = await im.get_account(); const account = data[0]; if (!account) throw new RecoveryProvisioningError("No account returned to evaluate recovery devices"); const deviceTypes = deviceTypeMapper.toDeviceTypes(account.access_points); for (const [mode, service] of stepServices) { if ((await service.supportsMode()) && !service.isRegistered(deviceTypes)) return { steps: [mode], isCompleted: false } } return { steps: [], isCompleted: true } } catch (error) { if (error instanceof RecoveryProvisioningError) throw error; console.error(...); throw new RecoveryProvisioningError((error as Error).message) }`. **`getPlan` never returns a fabricated completed plan on failure — it throws.**
  - `checkAccount(plan)`: if `!plan.steps.length || plan.isCompleted` return `plan`. `try { const currentMode = plan.steps[0]; const service = stepServices.get(currentMode); if (!service) throw new RecoveryProvisioningError("Unknown recovery mode"); const { data } = await im.get_account(); const deviceTypes = deviceTypeMapper.toDeviceTypes(data[0]?.access_points ?? []); if (service.isRegistered(deviceTypes)) return { ...plan, steps: [], isCompleted: true }; throw new RecoveryProvisioningError() } catch (error) { if (error instanceof RecoveryProvisioningError) throw error; console.error(...); throw new RecoveryProvisioningError((error as Error).message) }`. **Also throws (not swallows) on canister failure.**
  - Add barrel re-exports at the top (mirror `delete-account.service.ts`): `export * from "./dto/recovery-provisioning-plan.dto"`, `./enum/recovery-provisioning-mode.enum`, `./error/recovery-provisioning.error`, `./service/recovery-provisioning-step-service`, `./service/passkey-recovery-provisioning-step-service`, `./service/recovery-phrase-recovery-provisioning-step-service`.
  - `export const recoveryProvisioningService: RecoveryProvisioningService = { getPlan, checkAccount }`.

### Tests

- [x] Create `recovery-provisioning.service.spec.ts` (mock `im.get_account` via `jest.spyOn(im, "get_account")`, stub `window.PublicKeyCredential`). Cases:
  - `getPlan` → `{ steps: [PASSKEY], isCompleted: false }` when the account has no Passkey AP and `supportsMode()` true.
  - `getPlan` → `{ steps: [RECOVERY_PHRASE], isCompleted: false }` when Passkey present (or `supportsMode()` false) and no Recovery AP.
  - `getPlan` → `{ steps: [], isCompleted: true }` when both APs present.
  - `getPlan` → only one step when both missing, and it is `PASSKEY` (priority).
  - `getPlan` **throws `RecoveryProvisioningError`** when `im.get_account()` resolves `{ data: [] }` (no account).
  - `getPlan` **throws `RecoveryProvisioningError`** when `im.get_account()` rejects.
  - `checkAccount({ steps: [PASSKEY], isCompleted: false })` → completed when `im.get_account()` now returns a Passkey AP.
  - `checkAccount(...)` throws `RecoveryProvisioningError` when the AP is still absent.
  - `checkAccount(...)` throws `RecoveryProvisioningError` when `im.get_account()` rejects.
  - `checkAccount({ steps: [], isCompleted: true })` returns the plan unchanged, no canister call.
  - `passkeyRecoveryProvisioningStepService.supportsMode()` → `false` when `window.PublicKeyCredential` is undefined, `true` when the platform authenticator reports available.

### Wiring

- [x] Add `export * from "./lib/recovery-provisioning/recovery-provisioning.service"` to `packages/integration/src/index.ts` (adjacent to the `delete-account` export, line ~21).
- [x] Consumer wiring in `apps/nfid-frontend` (calling `getPlan` post-login, rendering the add-device UI, calling `checkAccount`, gating wallet entry) — **OUT OF SCOPE**, separate developer.

### Verification

- [x] `yarn nx lint integration` — zero new errors/warnings.
- [x] `yarn nx test integration recovery-provisioning.service.spec.ts` — all passing (single-file run per memory `run-single-test-file-nx`). Check for an existing report before re-running to filter.
- [x] `tsc --noEmit -p packages/integration/tsconfig.lib.json` (no nx `typecheck` target) — zero errors.
- [x] `yarn nx build integration` — succeeds (barrel export resolves).
- [x] No dev-server smoke test — no UI in this change.

## Risks & Notes

- **`getPlan` throws on any failure — no fallback, no fabricated result.** If `im.get_account()` returns no account / rejects, or anything else in `getPlan` throws, it raises `RecoveryProvisioningError`. `checkAccount` likewise throws on canister failure or a still-absent access point. The consumer must catch `RecoveryProvisioningError` from both and let the user into the wallet (retried next login). Nothing in this module ever returns `{ isCompleted: true }` to paper over an error.
- **Spec open questions still open:** #1 (one device per login from zero — product), #6 (exclude II-anchored / delegated accounts). Both degrade safely: worst case `getPlan` offers a step, `checkAccount` throws, consumer lets the user in. If #6 comes back "exclude", add a guard in `getPlan` after reading the account.
- **Amendment 2026-09-07 — profile store dropped.** `getPlan` now calls `im.get_account()` (same as `checkAccount`), not `loadProfileFromStorage()`. The old open question 3 (does every login path write `setProfileToStorage` first) is moot: the store was only warm on platform-authenticator logins, so it was an unreliable source.
- **Open question 4 (`im` actor authenticated at call site):** both `getPlan` and `checkAccount` now call `im`. Same assumption `delete-account.getPlan` already relies on. Confirm the consumer calls both only after `authState` is set (right after login).
- **Open question 5 (`device_type` normalization):** handled by the local `toDeviceTypes` helper. If more `DeviceType` values are needed later, prefer promoting `deviceTypeToDevice` into `packages/integration` over growing the local helper.
- **`isUserVerifyingPlatformAuthenticatorAvailable()`** only reports _platform_ authenticators — a user with a roaming/cross-device passkey but no platform one would be re-prompted. Acceptable per spec ("filtered out before that point" is about unsupported browsers); revisit if product wants roaming passkeys to count.
- **Test infra:** `delete-account.service.spec.ts` is a live-canister integration test (`jest.setTimeout(120000)`, `createAccount`). This module is pure detection, so the plan uses fast mocked unit tests instead (13 cases). `im.get_account` is stubbed with `jest.spyOn`; `window.PublicKeyCredential` is stubbed per-test and cleared in `beforeEach`. An optional live integration test can be added later mirroring `delete-account` if desired.
