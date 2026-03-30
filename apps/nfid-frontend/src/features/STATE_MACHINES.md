## Overview

This document summarizes the main XState machines used in `apps/nfid-frontend` and how they relate to each other. The goal is to make the current v4 setup easy to understand and to prepare for an eventual migration to xstate v5.

The core pattern is:

- Each feature has a single machine file.
- Machines are created via `createMachine(config, options)` where:
  - `config` holds `id`, `initial`, `context`, `states`, `schema`, `tsTypes`, etc.
  - `options` holds `actions`, `guards`, and `services`.

All machines are pure statecharts; IO and side effects are expressed through named actions and services.

---

## Auth domain

### `authentication/root/root-machine.ts` – `AuthenticationMachine`

- **Purpose**: Orchestrates top-level authentication flows (email, Google, Internet Identity, other options) and post-auth onboarding (2FA, passkeys, recovery reminders).
- **Inputs**:
  - Events like `AUTH_WITH_EMAIL`, `AUTH_WITH_GOOGLE`, `AUTH_WITH_II`, `AUTH_WITH_OTHER`, `SIGN_UP`, `SIGN_IN_PASSKEY`, `AUTHENTICATED`.
  - Optional `authRequest` and `appMeta` describing the calling app.
- **Outputs**:
  - Final `End` state whose `data` is the full `AuthenticationContext` (including `authSession` and flags like `showPasskeys`, `showRecovery`).
- **Relationships**:
  - Invokes:
    - `AuthWithEmailMachine` for email-based auth.
    - `AuthWithGoogleMachine` for Google auth.
    - II auth service (`signWithIIService`) for Internet Identity.
    - 2FA / passkeys / recovery services (`checkIf2FAEnabled`, `shouldShowPasskeys`, `shouldShowPasskeysEvery6thTime`, `shouldShowRecoveryPhraseEvery8thTime`).
  - Is itself invoked as a service by:
    - `ThirdPartyAuthMachine`
    - `NFIDAuthMachine`
    - `NFIDEmbedMachine`
    - `IdentityKitRPCMachine` (for interactive auth).

### `authentication/auth-selection/email-flow/machine.ts` – `AuthWithEmailMachine`

- **Purpose**: Handles the email verification flow: send code, poll for verification, then authorize and produce an `AuthSession`.
- **Inputs**:
  - Internal invoke events (`done.invoke.*`) from:
    - `sendVerificationEmail`
    - `checkEmailVerification`
    - `authorizeWithEmail`
  - User events: `BACK`, `RESEND`, `CONTINUE_VERIFIED`.
- **Outputs**:
  - Final `End` state with `data` equal to the machine’s `authSession`.
- **Relationships**:
  - Invoked as a child service by `AuthenticationMachine` for both sign-in and sign-up with email.

### `authentication/auth-selection/google-flow/auth-with-google.ts` – `AuthWithGoogleMachine`

- **Purpose**: Handles the Google sign-in flow: call Google sign-in service, then return the resulting `GoogleAuthSession`.
- **Inputs**:
  - `signWithGoogleService` invoke result events.
- **Outputs**:
  - Final `End` state with `data` equal to the `GoogleAuthSession`.
- **Relationships**:
  - Invoked as a child service by `AuthenticationMachine` during Google auth and sign-up.

### `authentication/3rd-party/third-party-machine.ts` – `ThirdPartyAuthMachine`

- **Purpose**: Drives the 3rd-party (window) auth flow:
  - Performs handshake with the embedding app.
  - Loads app metadata.
  - Delegates to `AuthenticationMachine` for actual user auth.
  - Posts delegation back via `postDelegation`.
- **Inputs**:
  - Handshake and app meta services (`handshake`, `getAppMeta`).
  - UI events such as `RETRY`, `CHOOSE_ACCOUNT`, `RESET`.
- **Outputs**:
  - Final `End` state, after delegation has been posted.
- **Relationships**:
  - Invokes `AuthenticationMachine` with `{ appMeta, authRequest, authSession }`.
  - UI is coordinated by `ThirdPartyAuthCoordinator`, which renders either:
    - The shared `AuthenticationCoordinator` when in `AuthenticationMachine`, or
    - An account selection UI when in `Authorization`.

### `authentication/nfid/nfid-machine.ts` – `NFIDAuthMachine`

- **Purpose**: NFID-specific wrapper that invokes the shared `AuthenticationMachine` for the NFID dashboard flow.
- **Inputs**:
  - No external events besides the internal `done.invoke.AuthenticationMachine`.
  - Initial `authRequest` is constructed from `window.location.origin`.
- **Outputs**:
  - Final `End` state when authentication completes; context holds `authSession`.
- **Relationships**:
  - Invokes `AuthenticationMachine` as a service.
  - `NFIDAuthCoordinator` uses this machine and, upon completion, navigates to the profile/tokens route.

---

## Embed & RPC domain

### `embed/machine.ts` – `NFIDEmbedMachineV2`

- **Purpose**: Manages the NFID embed popup:
  - Receives RPC messages from the embedding app.
  - Ensures the user is authenticated (via `AuthenticationMachine` and token expiry checks).
  - Executes procedures (e.g., signature, delegation, transfers) and posts responses back.
- **Structure**:
  - Parallel machine with three top-level regions:
    - `RPC_RECEIVER`: listens for RPC messages, queues them, and marks when the handler is ready.
    - `AUTH`: loads app meta, checks or acquires authentication (using `CheckAppMeta`, `CheckAuthState`, and `AuthenticationMachine`), and manages delegation expiry timers.
    - `HANDLE_PROCEDURE`: determines whether a request can be auto-approved, requests user approval when needed, and executes `ExecuteProcedureService`.
- **Inputs**:
  - RPC events via `RPCReceiver` (`RPC_MESSAGE`, etc.).
  - Approval events like `APPROVE`, `APPROVE_IC_GET_DELEGATION`, `APPROVE_IC_REQUEST_TRANSFER`, `CANCEL`, `RETRY`.
  - Internal `SESSION_EXPIRED` events from the session expiry watcher.
- **Outputs**:
  - Side effects via window messaging:
    - `nfid_ready`, `nfid_authenticated`, `nfid_unauthenticated`.
    - RPC responses or cancellation messages.
- **Relationships**:
  - Invokes:
    - `AuthenticationMachine` to ensure the user is signed in.
    - `CheckApplicationMeta` and `CheckAuthState`.
    - `RPCReceiver` and `ExecuteProcedureService`.
  - UI coordination is handled by `NFIDEmbedCoordinator`, which:
    - Renders `AuthenticationCoordinator` when in `AUTH.Authenticate`.
    - Renders `ProcedureApprovalCoordinator` during `HANDLE_PROCEDURE.AWAIT_PROCEDURE_APPROVAL`.

---

## IdentityKit domain

### `identitykit/machine.ts` – `IdentityKitRPCMachine`

- **Purpose**: Orchestrates the IdentityKit RPC flow:
  - Receives and queues RPC requests.
  - Validates each request and decides whether authentication is needed.
  - Uses `AuthenticationMachine` when user interaction is required.
  - Executes either silent or interactive methods, then formats and sends a JSON-RPC-like response back to the opener/parent window.
- **Structure**:
  - Parallel machine with:
    - `RPCReceiverV3` region: receives `ON_REQUEST` events and manages the requests queue.
    - `Main` region: handles request lifecycle via substates:
      - `Ready` → `ValidateRequest` → `Authentication` / `ExecuteSilentRequest` / `InteractiveRequest` → `SendResponse`.
- **Inputs**:
  - `ON_REQUEST` events carrying new RPC requests.
  - UI events during interactive flows: `ON_APPROVE`, `ON_CANCEL`, `ON_BACK`, `TRY_AGAIN`.
- **Outputs**:
  - Window messages containing either success results or structured error payloads.
- **Relationships**:
  - Invokes:
    - `AuthenticationMachine` with a minimal `AuthenticationContext` derived from `activeRequest.origin`.
    - Method services (`validateRequest`, `executeSilentMethod`, `getInteractiveMethodData`, `executeInteractiveMethod`).
    - Response-related services (`prepareCancelResponse`, `prepareFailedResponse`, `sendResponse`).
  - UI for interactive approvals is rendered outside this file, driven by the machine’s `Main.InteractiveRequest` substates.

---

## Transfer domain

### `transfer-modal/machine.ts` – `TransferMachine`

- **Purpose**: Controls the transfer modal UI routing and context:
  - Chooses between send/receive/swap/convert/stake/redeem flows.
  - For send flows, chooses between FT and NFT and stores the resulting transfer object.
- **Inputs**:
  - Modal-level events: `SHOW`, `HIDE`, `CHANGE_DIRECTION`, `CHANGE_TOKEN_TYPE`.
  - Context-assignment events: `ASSIGN_*` (source account, wallet, amount, token, NFT ID, etc.).
  - Flow events like `ON_TRANSFER`, `ASSIGN_ERROR`.
- **Outputs**:
  - Context fields such as `transferObject`, `direction`, and `tokenType`, used by the UI to perform and display transfers.
- **Relationships**:
  - Pure state router: no external services invoked.
  - The UI uses this machine’s state to decide which concrete transfer form to show and when to show success screens.

---

## How to use this document

- When you touch any of these machines:
  - Check this file to understand where it sits in the overall flow.
  - Verify whether it invokes or is invoked by `AuthenticationMachine` or other machines.
- When planning a future xstate v5 migration:
  - Migrate the simpler, isolated machines first (e.g., `TransferMachine`, `AuthWithGoogleMachine`).
  - Then move to wrappers (`NFIDAuthMachine`, `ThirdPartyAuthMachine`).
  - Finally, migrate the composition-heavy machines (`AuthenticationMachine`, `NFIDEmbedMachineV2`, `IdentityKitRPCMachine`).
