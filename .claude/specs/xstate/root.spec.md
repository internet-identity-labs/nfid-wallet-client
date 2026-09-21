# XState Spec — Root Auth Machine

> **Shared across:** wallet, embed, identitykit-rpc, 3rd-party
> **Machines:** Root Auth, Email Flow
> **Prerequisite for:** XState v4 → v5 migration

---

## Machine Inventory

| Machine    | File                                                           | Type     |
| ---------- | -------------------------------------------------------------- | -------- |
| Root Auth  | `features/authentication/root/root-machine.ts`                 | Compound |
| Email Flow | `features/authentication/auth-selection/email-flow/machine.ts` | Compound |

---

## 1. Root Authentication Machine

**File:** `features/authentication/root/root-machine.ts`

**Role:** Shared orchestrator. Invoked by the NFID wrapper, the Embed machine, the IdentityKit RPC machine, and the 3rd-Party machine. Emits a final `End` state carrying `authSession`.

### Context

```ts
{
  verificationEmail?: string
  authRequest?: AuthorizationRequest        // { hostname, maxTimeToLive, sessionPublicKey, ... }
  appMeta?: AuthorizingAppMeta
  authSession?: AbstractAuthSession
  error?: Error
  selectedPersonaId?: number
  thirdPartyAuthSession?: ApproveIcGetDelegationSdkResponse
  allowedDevices?: string[]                 // passkey devices
  email2FA?: string
  email?: string
  walletName?: string
  anchor?: number
  isEmbed?: boolean
  wallets: ExistingWallet[]                 // wallets found on this device; populated by CheckWallets
  recoveryProvisioningPlan?: RecoveryProvisioningPlan  // set by GetRecoveryProvisioningPlan
}
```

### State Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ROOT AUTH MACHINE                                                                                │
│                                                                                                  │
│  CheckWallets (initial, invokes getAllWalletsFromThisDevice)                                     │
│    onDone [hasWallets && isPasskeySupported] ──(assignWallets)──► ChooseWallet                  │
│    onDone [else]                             ──────────────────► AuthSelection                  │
│                                                                                                  │
│  ChooseWallet                                                                                    │
│    AUTH_WITH_PASSKEY ──(assignAuthSession)──► GetRecoveryProvisioningPlan                        │
│    CHOOSE_WALLET   ──────────────────────► AuthSelection  (use different method)                │
│    BACK            ──────────────────────► AuthSelection                                        │
│                                                                                                  │
│  ┌──────────────┐  AUTH_WITH_EMAIL   ──► EmailAuthentication                                    │
│  │ AuthSelection│  AUTH_WITH_GOOGLE  ──► AuthWithGoogle                                         │
│  │              │  AUTH_WITH_II      ──► AuthWithII                                             │
│  │              │  AUTH_WITH_OTHER   ──► OtherSignOptions                                       │
│  │              │  SIGN_UP           ──► AuthSelectionSignUp                                    │
│  │              │  AUTHENTICATED     ──► End  (passkey sign-in completes here directly)         │
│  │              │  AUTH_WITH_PASSKEY ──► GetRecoveryProvisioningPlan  (session assigned)        │
│  │              │  CHOOSE_WALLET     ──► ChooseWallet  (back arrow, only when wallets in ctx)   │
│  └──────────────┘                                                                                │
│                                                                                                  │
│  OtherSignOptions ──AUTH_WITH_RECOVERY_PHRASE──► SignInWithRecoveryPhrase                        │
│  SignInWithRecoveryPhrase ──AUTHENTICATED──► GetRecoveryProvisioningPlan                         │
│                                                                                                  │
│  ┌─────────────────┐  AUTH_WITH_EMAIL   ──► SignUpWithEmail                                     │
│  │AuthSelectionSignUp  AUTH_WITH_GOOGLE  ──► SignUpWithGoogle                                   │
│  │                 │  AUTH_WITH_II      ──► SignUpWithII                                        │
│  │                 │  SIGN_UP_WITH_PASSKEY ► SignUpPassKey                                      │
│  │                 │  SIGN_IN           ──► AuthSelection                                       │
│  │                 │  AUTHENTICATED     ──► End  (passkey sign-up completes here directly)      │
│  └─────────────────┘                                                                             │
│                                                                                                  │
│  AuthWithGoogle / AuthWithII  ──onDone──►  isExistingAccount? → check2FA                        │
│                                        └─ else (new account)  → AuthSelection                   │
│                                                                                                  │
│  SignUpWithGoogle / SignUpWithII  ──onDone──►  isExistingAccount? → GetRecoveryProvisioningPlan  │
│                                           └─ else (new account)  → AuthSelectionSignUp          │
│                                                                                                  │
│  EmailAuthentication / SignUpWithEmail  ──onDone──►  isReturn? → AuthSelection/AuthSelectionSignUp
│                                                  └─ else      → check2FA / GetRecoveryProvisioningPlan
│                                                                                                  │
│  check2FA ──onDone──► is2FAEnabled? → TwoFA (+ assignAllowedDevices)                            │
│                   └─ else           → GetRecoveryProvisioningPlan                               │
│                                                                                                  │
│  TwoFA ──AUTHENTICATED──► GetRecoveryProvisioningPlan                                           │
│                                                                                                  │
│  GetRecoveryProvisioningPlan ──onDone──► needsPasskey?       → AddPasskeys                      │
│  (invokes recoveryProvisioningService    needsRecoveryPhrase? → AuthAddRecoveryPhrase            │
│   .getPlan(); one device per login)      else (completed)    → End                              │
│                              ──onError──► End  (fail-open: re-prompted next login)              │
│                                                                                                  │
│  AddPasskeys ──CONTINUE──► VerifyPasskeyProvisioning                                            │
│  (mandatory — no SKIP, no BACK)                                                                  │
│                                                                                                  │
│  VerifyPasskeyProvisioning ──onDone──► AddPasskeysSuccess ──DONE──► End                         │
│  (invokes recoveryProvisioningService  ──onError──► End  (fail-open)                            │
│   .checkAccount(plan))                                                                           │
│                                                                                                  │
│  AuthAddRecoveryPhrase ──DONE──► AuthSaveRecoveryPhrase ──DONE──► VerifyRecoveryProvisioning    │
│  (mandatory — no SKIP)                                                                           │
│                                                                                                  │
│  VerifyRecoveryProvisioning ──onDone──► End                                                     │
│  (invokes recoveryProvisioningService  ──onError──► End  (fail-open)                            │
│   .checkAccount(plan))                                                                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### States

| State                         | Description                                                                       | Invokes                       |
| ----------------------------- | --------------------------------------------------------------------------------- | ----------------------------- |
| `CheckWallets`                | **Initial.** Loads wallets from device                                            | `getAllWalletsFromThisDevice` |
| `ChooseWallet`                | Shows wallet list for passkey sign-in                                             | —                             |
| `AuthSelection`               | Auth method chooser                                                               | —                             |
| `AuthSelectionSignUp`         | Sign-up variant of method chooser                                                 | —                             |
| `SignUpPassKey`               | Passkey registration                                                              | —                             |
| `SignInWithRecoveryPhrase`    | Recovery phrase entry                                                             | —                             |
| `AuthAddRecoveryPhrase`       | Step 1 of recovery backup (mandatory, no skip)                                    | —                             |
| `AuthSaveRecoveryPhrase`      | Step 2 of recovery backup                                                         | —                             |
| `AuthWithGoogle`              | Google OAuth                                                                      | `signWithGoogleService`       |
| `SignUpWithGoogle`            | Google OAuth for new accounts                                                     | `signWithGoogleService`       |
| `AuthWithII`                  | Internet Identity auth                                                            | `signWithIIService`           |
| `SignUpWithII`                | II for new accounts                                                               | `signWithIIService`           |
| `SignUpWithEmail`             | Email signup                                                                      | `AuthWithEmailMachine`        |
| `EmailAuthentication`         | Email sign-in                                                                     | `AuthWithEmailMachine`        |
| `OtherSignOptions`            | Alternative methods                                                               | —                             |
| `check2FA`                    | Check if 2FA is enabled                                                           | `checkIf2FAEnabled`           |
| `TwoFA`                       | 2FA code entry                                                                    | —                             |
| `GetRecoveryProvisioningPlan` | Mandatory post-login check via `recoveryProvisioningService.getPlan()`            | `getRecoveryProvisioningPlan` |
| `VerifyPasskeyProvisioning`   | Verify passkey was added via `recoveryProvisioningService.checkAccount()`         | `verifyRecoveryProvisioning`  |
| `VerifyRecoveryProvisioning`  | Verify recovery phrase was added via `recoveryProvisioningService.checkAccount()` | `verifyRecoveryProvisioning`  |
| `AddPasskeys`                 | Add passkey onboarding (mandatory, no skip/back)                                  | —                             |
| `AddPasskeysSuccess`          | Passkey added confirmation                                                        | —                             |
| `End`                         | **Final.** Carries `authSession`                                                  | —                             |

### Events

| Event                       | Payload                   | Origin State(s)                                                                        | Target                                               |
| --------------------------- | ------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `AUTH_WITH_EMAIL`           | `{ email, isEmbed }`      | `AuthSelection`                                                                        | `EmailAuthentication`                                |
| `AUTH_WITH_EMAIL`           | `{ email, isEmbed }`      | `AuthSelectionSignUp`                                                                  | `SignUpWithEmail`                                    |
| `AUTH_WITH_GOOGLE`          | `{ jwt, email, isEmbed }` | `AuthSelection`                                                                        | `AuthWithGoogle`                                     |
| `AUTH_WITH_GOOGLE`          | `{ jwt, email, isEmbed }` | `AuthSelectionSignUp`                                                                  | `SignUpWithGoogle`                                   |
| `AUTH_WITH_II`              | `AbstractAuthSession?`    | `AuthSelection`                                                                        | `AuthWithII`                                         |
| `AUTH_WITH_II`              | `AbstractAuthSession?`    | `AuthSelectionSignUp`                                                                  | `SignUpWithII`                                       |
| `AUTH_WITH_OTHER`           | `{ isEmbed }`             | `AuthSelection`                                                                        | `OtherSignOptions`                                   |
| `AUTH_WITH_RECOVERY_PHRASE` | —                         | `OtherSignOptions`                                                                     | `SignInWithRecoveryPhrase`                           |
| `SIGN_UP`                   | —                         | `AuthSelection`                                                                        | `AuthSelectionSignUp`                                |
| `SIGN_IN`                   | —                         | `AuthSelectionSignUp`                                                                  | `AuthSelection`                                      |
| `SIGN_UP_WITH_PASSKEY`      | —                         | `AuthSelectionSignUp`                                                                  | `SignUpPassKey`                                      |
| `AUTH_WITH_PASSKEY`         | `AbstractAuthSession?`    | `AuthSelection`                                                                        | `GetRecoveryProvisioningPlan`                        |
| `AUTH_WITH_PASSKEY`         | `AbstractAuthSession?`    | `ChooseWallet`                                                                         | `GetRecoveryProvisioningPlan`                        |
| `CHOOSE_WALLET`             | —                         | `ChooseWallet`                                                                         | `AuthSelection` (use different method)               |
| `CHOOSE_WALLET`             | —                         | `AuthSelection`                                                                        | `ChooseWallet` (back arrow, requires wallets in ctx) |
| `AUTHENTICATED`             | `AbstractAuthSession?`    | `AuthSelection`, `AuthSelectionSignUp`                                                 | `End`                                                |
| `AUTHENTICATED`             | `AbstractAuthSession?`    | `SignUpPassKey`                                                                        | `End`                                                |
| `AUTHENTICATED`             | `AbstractAuthSession?`    | `OtherSignOptions`                                                                     | `End`                                                |
| `AUTHENTICATED`             | `AbstractAuthSession?`    | `SignInWithRecoveryPhrase`                                                             | `GetRecoveryProvisioningPlan`                        |
| `AUTHENTICATED`             | —                         | `TwoFA`                                                                                | `GetRecoveryProvisioningPlan`                        |
| `BACK`                      | —                         | `SignUpPassKey`, `SignInWithRecoveryPhrase` (→ `OtherSignOptions`), `OtherSignOptions` | varies                                               |
| `CONTINUE`                  | —                         | `AddPasskeys`                                                                          | `VerifyPasskeyProvisioning`                          |
| `DONE`                      | —                         | `AddPasskeysSuccess`                                                                   | `End`                                                |
| `DONE`                      | —                         | `AuthAddRecoveryPhrase`                                                                | `AuthSaveRecoveryPhrase`                             |
| `DONE`                      | —                         | `AuthSaveRecoveryPhrase`                                                               | `VerifyRecoveryProvisioning`                         |

### Guards

| Guard                 | Condition                                                                   |
| --------------------- | --------------------------------------------------------------------------- |
| `hasWallets`          | `event.data.length > 0` (wallets returned by `getAllWalletsFromThisDevice`) |
| `isPasskeySupported`  | `isWebAuthNSupported()` — device supports WebAuthn                          |
| `isExistingAccount`   | `event.data.anchor` is truthy (returned from Google/II invoke)              |
| `isReturn`            | Email machine `onDone` data is falsy (user navigated back)                  |
| `is2FAEnabled`        | `checkIf2FAEnabled` result is truthy                                        |
| `needsPasskey`        | `event.output.steps[0] === RecoveryProvisioningMode.PASSKEY`                |
| `needsRecoveryPhrase` | `event.output.steps[0] === RecoveryProvisioningMode.RECOVERY_PHRASE`        |

### Actions

| Action                           | Effect                                                |
| -------------------------------- | ----------------------------------------------------- |
| `assignWallets`                  | `context.wallets = event.data`                        |
| `assignAuthSession`              | `context.authSession = event.data`                    |
| `assignVerificationEmail`        | `context.verificationEmail = event.data.email`        |
| `assignEmail`                    | `context.email = event.data.email`                    |
| `assignAllowedDevices`           | `context.allowedDevices = event.data.allowedPasskeys` |
| `assignIsEmbed`                  | `context.isEmbed = event.data.isEmbed`                |
| `assignRecoveryProvisioningPlan` | `context.recoveryProvisioningPlan = event.output`     |

---

## 2. Email Flow Machine

**File:** `features/authentication/auth-selection/email-flow/machine.ts`

**Invoked by:** `EmailAuthentication` and `SignUpWithEmail` states in root machine.

### Context

```ts
{
  authSession?: AuthSession
  verificationEmail: string        // passed as input
  keyPair: KeyPair
  requestId: string
  antiPhishingCode?: string
  emailDelegation?: Ed25519KeyIdentity
  chainRoot?: DelegationChain
  delegation: DelegationIdentity
}
```

### State Diagram

```
SendVerificationEmail (invokes sendVerificationEmail)
        │ onDone  ──────────────────────────────────► PendingEmailVerification
        │ onError [isRequestNotExpired]  ──(toast)──► PendingEmailVerification
        │ onError [else]                 ──(toast)──► End (no session)
        ▼
PendingEmailVerification (invokes checkEmailVerification)
        │ onDone  ──────────────────────────────────► EmailVerified
        │ onError ──(stopInterval)──────────────────► Error
        │ BACK    ──(stopInterval)──────────────────► End (no session)
        │ RESEND  ──(stopInterval)──────────────────► SendVerificationEmail
        ▼
EmailVerified (invokes authorizeWithEmail)
        │ onDone  ──────────────────────────────────► Authenticated
        │ onError ──────────────────────────────────► Error
        ▼
Authenticated
        │ CONTINUE_VERIFIED ────────────────────────► End (final, carries authSession)

Error
        │ BACK   ────────────────────────────────────► End (no session)
        │ RESEND ────────────────────────────────────► SendVerificationEmail
```

### Guards

| Guard                 | Condition                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------- |
| `isRequestNotExpired` | `error.message.includes("Please wait for a minute!")` — allows retry on rate-limit error |

### Services

| Service                  | Description                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| `sendVerificationEmail`  | POST to backend; returns `{ keyPair, requestId, antiPhishingCode }`                      |
| `checkEmailVerification` | Polls until verification confirmed; returns `{ emailDelegation, chainRoot, delegation }` |
| `authorizeWithEmail`     | Exchanges email delegation for `authSession`                                             |

---

_Spec created: 2026-09-14_
