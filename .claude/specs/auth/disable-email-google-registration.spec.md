# Spec: Disable Email & Google Account Registration (Integration Layer)

> Status: DRAFT — awaiting engineer approval
> Created: 2026-08-31
> Backend: `sms-sender-serverless` — "Disable email and Google registration for new users"

## Overview

The `sms-sender-serverless` backend now blocks new-user registration on two
endpoints. When a request would create a brand-new identity while the block is
active, the Lambda returns `403` with a machine-readable body
`{ "error": "REGISTRATION_DISABLED", "message": "..." }` instead of the normal
success payload. This spec covers **only the `@nfid/integration` layer** of
`nfid-wallet-client`: the two service functions that call those endpoints must
detect this specific response and throw a dedicated typed error
(`RegistrationDisabledError`) that downstream code can branch on with
`instanceof`. No UI, no React, no XState/machine, no toast copy — those are
handled by another developer, who will consume the exported error class.

## Scope

- App/area: `packages/integration` (`@nfid/integration`)
- Entry point: two existing service calls that hit the affected endpoints
  - `googleSigninV2Service.signin()` → `POST /signin/v2`
    (`packages/integration/src/lib/google-signin/google-signin-v2.service.ts`)
  - `verificationService.sendVerification()` → `POST /send_verification_email`
    (`packages/integration/src/lib/verification-email/verification.service.ts`)
- Exit state: on the `REGISTRATION_DISABLED` response both functions reject with a
  `RegistrationDisabledError`; every other response path is unchanged.

## Backend contract (already shipped, read-only reference)

| Endpoint                        | Old non-OK behavior                  | New response added                                                                                             |
| ------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `POST /signin/v2`               | any non-OK → error text              | `403` `{ error: "REGISTRATION_DISABLED", message: "Registration of new users is permanently blocked." }`       |
| `POST /send_verification_email` | `429` → not-expired; else error text | same `403` `{ error: "REGISTRATION_DISABLED", message: ... }`; guard runs **before** the `429` anti-spam check |

- The `403` body is produced by `formatStructuredJSONResponse(403, {...})` — i.e.
  the JSON is the body verbatim, with a stable `error` discriminator string
  `"REGISTRATION_DISABLED"`.
- Backend also has a fail-closed `500` (`{ error: "Existance of email address
cannot be checked." }`) — **out of scope**, falls through to the existing
  generic `throw new Error(text)`.

## Changes

### 1. New guard service

**File (new):** `packages/integration/src/lib/authentication/registration-guard.service.ts`
— a service (repo `*Service` idiom, mirrors the backend `registrationGuardService`)
imported by both `google-signin` and `verification-email`.

- `export const REGISTRATION_DISABLED_ERROR_CODE = "REGISTRATION_DISABLED"` —
  the discriminator matched against the backend `error` field.
- `export const REGISTRATION_DISABLED_MESSAGE = "..."` — a **repo-owned**
  message string. The thrown error uses this constant, NOT the `message` field
  from the backend response, so copy can be changed here without a backend
  deploy. Current copy: _"Creating a new account with email or Google is no
  longer available. Existing users can still sign in for now while email and
  Google sign-in are being phased out."_ — makes clear new registration is
  stopped while existing users keep temporary sign-in access during the web2
  wind-down.
- `export class RegistrationDisabledError extends Error` —
  `constructor(message: string = REGISTRATION_DISABLED_MESSAGE) { super(message) }`
  (matches the existing inline error classes in `verification.service.ts`).
- `export const registrationGuardService` — singleton of a small
  `RegistrationGuardService` class with a **single public method**
  `assertRegistrationAllowed(status: number, rawBody: string): void` — throws
  `RegistrationDisabledError` only when `status === 403` **and**
  `JSON.parse(rawBody)?.error === REGISTRATION_DISABLED_ERROR_CODE`; no-op
  otherwise. Body parsing lives in a `private isRegistrationDisabledResponse`
  method wrapped in `try/catch`, so a non-JSON / unexpected body is treated as
  "not a registration block".

### 2. `google-signin-v2.service.ts` — `signin()`

In the existing `if (!response.ok)` block (after `const text = await
response.text()`), before `throw new Error(text)`:

```ts
registrationGuardService.assertRegistrationAllowed(response.status, text)
throw new Error(text)
```

### 3. `verification.service.ts` — `sendVerification()`

In the existing `if (!response.ok)` block, add the guard **before** the
`response.status === 429` branch:

```ts
registrationGuardService.assertRegistrationAllowed(response.status, text)
if (response.status === 429) {
  throw new PrevTokenHasNotExpiredError(text)
}
throw new Error(text)
```

(Ordering is defensive only — `403` and `429` cannot collide.)

### 4. Barrel export

`packages/integration/src/lib/authentication/index.ts` — add
`export * from "./registration-guard.service"` (surfaces via the existing
`export * from "./lib/authentication"` in `packages/integration/src/index.ts`)
so downstream code can `import { RegistrationDisabledError } from "@nfid/integration"`.

## Component States

Not a UI feature. Behavioral states of the two integration calls:

| State                                  | Trigger                                     | Behavior                                                                    |
| -------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| success                                | `2xx`                                       | unchanged — returns delegation/identity/email or `SendVerificationResponse` |
| registration disabled                  | `403` + `error === "REGISTRATION_DISABLED"` | rejects with `RegistrationDisabledError` (message = repo constant)          |
| rate limited (`sendVerification` only) | `403`? no — `429`                           | unchanged — `PrevTokenHasNotExpiredError`                                   |
| fail-closed check error                | `500` `{ error: "Existance..." }`           | unchanged — generic `Error(text)` (out of scope)                            |
| other non-OK                           | any other status                            | unchanged — generic `Error(text)`                                           |

## Data & State Design

- Fetch: raw `fetch` inside the two service functions (no SWR/XState here).
- Mutations: none added.
- New state: none. One new exported error class + two helper constants + one
  pure predicate function.

## Accessibility

- N/A — no DOM, no components.

## Responsive Behavior

- N/A.

## Edge Cases

- `403` with a body that is not JSON, or JSON without `error` /
  with a different `error` value → `isRegistrationDisabledResponse` returns
  `false`; falls through to `throw new Error(text)` (unchanged behavior).
- Backend `message` wording drifts → no effect on FE; FE uses its own constant.
- Backend later reuses `403` for another reason with a different `error` code →
  not misclassified (code match, not status-only).
- `sendVerification` blocked user: backend returns `403` not `429`, so the user
  never sees the "previous token not expired" path — correct.
- Local dev (`ic.isLocal`) hits the same relative endpoint paths; behavior
  identical.

## Test Plan

- `registration-disabled.error` unit spec (co-located
  `*.spec.ts`): `isRegistrationDisabledResponse` truth table (403 + correct
  code → true; 403 + wrong/absent code → false; 403 + non-JSON → false; non-403
  → false); `RegistrationDisabledError` default message === repo constant and
  `instanceof Error`.
- `google-signin-v2.service` spec: mock `fetch` → `403` with the
  `REGISTRATION_DISABLED` body → `signin()` rejects with
  `RegistrationDisabledError`; `403` with unrelated body → rejects with plain
  `Error`; happy path unchanged.
- `verification.service` spec: mock `fetch` → `403` `REGISTRATION_DISABLED` →
  `sendVerification()` rejects with `RegistrationDisabledError`; `429` still →
  `PrevTokenHasNotExpiredError`; happy path unchanged.
- Verification commands: `yarn nx run integration:typecheck` (or package
  equivalent), `yarn nx lint integration`, `yarn nx test integration`,
  `yarn format:check`.

## Out of Scope

- Any UI, React component, toast, or copy rendering.
- XState machine / feature-layer `services.ts` changes
  (`apps/nfid-frontend/src/features/authentication/auth-selection/google-flow/services.ts`,
  `.../email-flow/services.ts` and their machines) — the other developer will
  add `instanceof RegistrationDisabledError` handling there.
  - Heads-up for that work: `google-flow/services.ts` currently does
    `catch (e: any) { throw new Error(e.message) }`, which flattens the typed
    error — it will need to rethrow the original / check `instanceof` before
    re-wrapping.
- The backend fail-closed `500` ("Existance of email address cannot be
  checked.") — left as generic error.
- `verify_email`, `check_verification`, `link_google_account` — not guarded by
  the backend, no change.
- Any re-enable / feature-flag plumbing on the FE (backend flag only).

## Open Questions for Planning

1. ~~Final wording of `REGISTRATION_DISABLED_MESSAGE`.~~ Resolved — see §1.
2. Confirm `@nfid/integration` test tooling/pattern for `fetch` mocking used by
   neighboring specs.
