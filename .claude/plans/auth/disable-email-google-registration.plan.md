# Plan: Disable Email & Google Account Registration (Integration Layer)

> Status: DRAFT — awaiting engineer approval
> Spec: .claude/specs/auth/disable-email-google-registration.spec.md
> Created: 2026-08-31

## Codebase Analysis (findings)

- **Package:** `@nfid/integration` — Nx project name `integration`, jest via
  `@nx/jest`, lint via `@nx/eslint`. Test config
  `packages/integration/jest.config.ts` (globals from
  `config/jest-globals.cjs`, which already defines `AWS_SIGNIN_GOOGLE_V2` /
  `AWS_SEND_VERIFICATION_EMAIL`).
- **Call site 1 —** `packages/integration/src/lib/google-signin/google-signin-v2.service.ts`,
  `googleSigninV2Service.signin()`. Current non-OK handling (after
  `const text = await response.text()`):
  ```ts
  if (!response.ok) {
    throw new Error(text)
  }
  ```
  No existing `.spec.ts` for this file.
- **Call site 2 —** `packages/integration/src/lib/verification-email/verification.service.ts`,
  `verificationService.sendVerification()`. Current non-OK handling:
  ```ts
  const text = await response.text()
  if (!response.ok) {
    if (response.status === 429) {
      throw new PrevTokenHasNotExpiredError(text)
    }
    throw new Error(text)
  }
  ```
  Existing spec `verification.service.spec.ts` mocks `global.fetch` with
  `{ text: () => <string>, ok: <bool>, status: <n> }` and asserts
  `rejects.toThrow(<ErrorClass>)`. Same pattern reused here.
- **Existing typed-error idiom** in `verification.service.ts`:
  `export class PrevTokenHasNotExpiredError extends Error { constructor(message?: string) { super(message) } }`
  — downstream `apps/.../email-flow/services.ts` already does
  `e instanceof VerificationIsInProgressError`. Same idiom for the new error.
- **Barrel:** `packages/integration/src/index.ts` has
  `export * from "./lib/authentication"`, which re-exports
  `packages/integration/src/lib/authentication/index.ts`. Adding one line there
  surfaces the new error as `import { RegistrationDisabledError } from "@nfid/integration"`.
- **Backend response** (already shipped): `403` with body
  `{ "error": "REGISTRATION_DISABLED", "message": "..." }` (JSON is the whole
  body). Per approved spec, FE matches on `status === 403` **and**
  `error === "REGISTRATION_DISABLED"`, and uses a **repo-owned** message
  constant (not the backend `message`).
- **Out of scope** (other developer): all `apps/nfid-frontend` feature-layer
  `services.ts` / XState machines / UI / toasts; the backend fail-closed `500`;
  `verify_email` / `check_verification` / `link_google_account`.

## New Files

| File                                                                             | Type    | Purpose                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/integration/src/lib/authentication/registration-guard.service.ts`      | Service | `registrationGuardService` — singleton of a `RegistrationGuardService` class with one public method `assertRegistrationAllowed(status, rawBody)` and a `private isRegistrationDisabledResponse` method; `RegistrationDisabledError` class; `REGISTRATION_DISABLED_ERROR_CODE` + `REGISTRATION_DISABLED_MESSAGE` constants |
| `packages/integration/src/lib/authentication/registration-guard.service.spec.ts` | Test    | Unit tests for `assertRegistrationAllowed` (throws with repo message on match; no-op on wrong code / non-JSON / non-403)                                                                                                                                                                                                  |
| `packages/integration/src/lib/google-signin/google-signin-v2.service.spec.ts`    | Test    | Error-path tests: `403 REGISTRATION_DISABLED` → `RegistrationDisabledError`; other `403` → plain `Error`                                                                                                                                                                                                                  |

## Modified Files

| File                                                                           | Change                                                                                                                                                                                 |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/integration/src/lib/google-signin/google-signin-v2.service.ts`       | Import `registrationGuardService`; in `if (!response.ok)`, call `registrationGuardService.assertRegistrationAllowed(response.status, text)` before the generic `throw new Error(text)` |
| `packages/integration/src/lib/verification-email/verification.service.ts`      | Import `registrationGuardService`; in `sendVerification`'s `if (!response.ok)`, call the guard as the **first** statement (before `status === 429`)                                    |
| `packages/integration/src/lib/authentication/index.ts`                         | Add `export * from "./registration-guard.service"`                                                                                                                                     |
| `packages/integration/src/lib/verification-email/verification.service.spec.ts` | Add a case: mocked `403` `REGISTRATION_DISABLED` body → `sendVerification` `rejects.toThrow(RegistrationDisabledError)`                                                                |

## Types

- [ ] No shared `types/` entries. New symbols are local to
      `registration-disabled.error.ts` and exported via the integration barrel.

## XState / State Changes

- [ ] None. No machine, atom, or context changes in this plan (feature layer is
      the other developer's scope).

## Implementation Checklist

<!-- Execute EXACTLY ONE checkbox at a time using /execute-ui-plan -->

### Types & Interfaces

- [ ] Create `packages/integration/src/lib/authentication/registration-disabled.error.ts`:
  - `export const REGISTRATION_DISABLED_ERROR_CODE = "REGISTRATION_DISABLED"`
  - `export const REGISTRATION_DISABLED_MESSAGE = "Registration is currently disabled."`
    (final wording — see Risks/Open item)
  - `export class RegistrationDisabledError extends Error` with
    `constructor(message: string = REGISTRATION_DISABLED_MESSAGE) { super(message) }`
    (matches `PrevTokenHasNotExpiredError` idiom)
  - `export function isRegistrationDisabledResponse(status: number, rawBody: string): boolean`
    — return `false` unless `status === 403`; then `try { JSON.parse(rawBody) }`
    and return `parsed?.error === REGISTRATION_DISABLED_ERROR_CODE`; `catch` →
    `return false`. No `any` — type the parsed value as `{ error?: string }`.

### Data Layer

- [ ] `google-signin-v2.service.ts` — add import
      `import { isRegistrationDisabledResponse, RegistrationDisabledError } from "../authentication/registration-disabled.error"`
      (import the **file directly**, not `../authentication`, to avoid pulling the
      auth-state barrel / a require cycle). In `signin()`'s `if (!response.ok)`:
  ```ts
  if (isRegistrationDisabledResponse(response.status, text)) {
    throw new RegistrationDisabledError()
  }
  throw new Error(text)
  ```
- [ ] `verification.service.ts` — add the same direct import. In
      `sendVerification()`'s `if (!response.ok)`, put the new check first:
  ```ts
  if (isRegistrationDisabledResponse(response.status, text)) {
    throw new RegistrationDisabledError()
  }
  if (response.status === 429) {
    throw new PrevTokenHasNotExpiredError(text)
  }
  throw new Error(text)
  ```

### State Machine

- [ ] N/A

### Atoms / Context

- [ ] N/A

### Components — Atoms

- [ ] N/A

### Components — Feature

- [ ] N/A

### Tests

- [ ] `registration-disabled.error.spec.ts`:
  - `isRegistrationDisabledResponse(403, '{"error":"REGISTRATION_DISABLED","message":"x"}')` → `true`
  - `isRegistrationDisabledResponse(403, '{"error":"SOMETHING_ELSE"}')` → `false`
  - `isRegistrationDisabledResponse(403, '{}')` → `false`
  - `isRegistrationDisabledResponse(403, 'not json')` → `false`
  - `isRegistrationDisabledResponse(429, '{"error":"REGISTRATION_DISABLED"}')` → `false`
  - `new RegistrationDisabledError()` → `message === REGISTRATION_DISABLED_MESSAGE`, `instanceof Error`
- [ ] `google-signin-v2.service.spec.ts` (new): mock `global.fetch` per the
      `verification.service.spec.ts` pattern:
  - `{ ok: false, status: 403, text: () => '{"error":"REGISTRATION_DISABLED","message":"x"}' }`
    → `googleSigninV2Service.signin("tok")` `rejects.toThrow(RegistrationDisabledError)`
  - `{ ok: false, status: 403, text: () => "forbidden" }` → `rejects.toThrow(Error)` and
    **not** `RegistrationDisabledError` (`rejects.not.toThrow(RegistrationDisabledError)` /
    assert `err.constructor === Error`)
- [ ] `verification.service.spec.ts`: add
      "should exec sendVerification and receive RegistrationDisabledError" — mock
      `{ ok: false, status: 403, text: () => '{"error":"REGISTRATION_DISABLED","message":"x"}' }`,
      assert `rejects.toThrow(RegistrationDisabledError)`. Import the class from
      `../authentication/registration-disabled.error`.

### Wiring

- [ ] `packages/integration/src/lib/authentication/index.ts` — append
      `export * from "./registration-disabled.error"`.
- [ ] Confirm `import { RegistrationDisabledError } from "@nfid/integration"`
      resolves (via existing `export * from "./lib/authentication"` in
      `packages/integration/src/index.ts`) — no root `index.ts` edit expected.

### Verification

- [ ] `yarn nx lint integration` — zero new errors/warnings (no `any`, import
      order per Prettier plugin)
- [ ] `yarn nx test integration` — all passing, including 3 new/updated specs
- [ ] `tsc --noEmit -p packages/integration/tsconfig.lib.json` — zero new errors
- [ ] `yarn format:check` — clean
- [ ] Grep check: no remaining bare `throw new Error(text)` on the
      `REGISTRATION_DISABLED` path in either service; downstream consumers still
      compile (`yarn nx run nfid-frontend:typecheck` if quick — otherwise note as
      the other developer's gate)

## Risks & Notes

- **Downstream flattening (other developer's scope, but flag it):**
  `apps/nfid-frontend/src/features/authentication/auth-selection/google-flow/services.ts`
  currently does `catch (e: any) { throw new Error(e.message) }`, which destroys
  the `RegistrationDisabledError` type. The email path
  (`email-flow/services.ts` `sendVerificationEmail`) rethrows `e` as-is, so it
  survives there. The other developer must preserve/branch on the type in the
  Google path.
- **Import cycle:** import the error from its **file path**
  (`../authentication/registration-disabled.error`), never the
  `../authentication` barrel — the barrel pulls `auth-state.ts` etc. The new
  file itself imports nothing, so it is cycle-safe.
- **Order in `sendVerification`:** `403` and `429` cannot collide; the new check
  is placed first only for clarity/specificity.
- **Non-JSON / unexpected `403` bodies** fall through to the existing
  `throw new Error(text)` — behavior unchanged for every path except the exact
  `REGISTRATION_DISABLED` code.
- **Message wording (resolved):** `REGISTRATION_DISABLED_MESSAGE` explains that
  new email/Google account creation is stopped while existing users keep
  temporary sign-in access during the web2 wind-down. Repo-owned constant —
  editable here without a backend deploy.
- **`ic.isLocal`** path hits the same relative endpoint strings; the guard is
  transport-agnostic (operates on `response.status` + body), so local dev
  behaves identically.
- No new deps, no `serverless`/env/config changes on the FE side.
