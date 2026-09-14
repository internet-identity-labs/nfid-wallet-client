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
  showPasskeys?: boolean
  showRecovery?: boolean
  isEmbed?: boolean
  shouldShowRecoveryEvery8th?: boolean
}
```

### State Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ROOT AUTH MACHINE                                                                                │
│                                                                                                  │
│  ┌──────────────┐  AUTH_WITH_EMAIL   ──► EmailAuthentication                                    │
│  │ AuthSelection│  AUTH_WITH_GOOGLE  ──► AuthWithGoogle                                         │
│  │  (initial)   │  AUTH_WITH_II      ──► AuthWithII                                             │
│  │              │  AUTH_WITH_OTHER   ──► OtherSignOptions                                       │
│  │              │  SIGN_UP           ──► AuthSelectionSignUp                                    │
│  │              │  AUTHENTICATED     ──► End  (passkey sign-in completes here directly)         │
│  │              │  SIGN_IN_PASSKEY   ──► checkRecovery8th  (session assigned)                   │
│  └──────────────┘                                                                                │
│                                                                                                  │
│  OtherSignOptions ──AUTH_WITH_RECOVERY_PHRASE──► SignInWithRecoveryPhrase                        │
│  SignInWithRecoveryPhrase ──AUTHENTICATED──► checkPasskeys6th                                    │
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
│  SignUpWithGoogle / SignUpWithII  ──onDone──►  isExistingAccount? → checkPasskeys                │
│                                           └─ else (new account)  → AuthSelectionSignUp          │
│                                                                                                  │
│  EmailAuthentication / SignUpWithEmail  ──onDone──►  isReturn? → AuthSelection/AuthSelectionSignUp
│                                                  └─ else      → check2FA / checkPasskeys         │
│                                                                                                  │
│  check2FA ──onDone──► is2FAEnabled? → TwoFA (+ assignAllowedDevices)                            │
│                   └─ else          → checkPasskeys6th (+ setShouldCheckRecoveryEvery8th)         │
│                                                                                                  │
│  TwoFA ──AUTHENTICATED──► checkRecovery8th  (skips checkPasskeys6th)                            │
│                                                                                                  │
│  checkPasskeys6th ──onDone──► showPasskeys?            → AddPasskeys                            │
│                           ├─ shouldShowRecoveryEvery8th → checkRecovery8th                      │
│                           └─ else                       → End                                   │
│                                                                                                  │
│  checkRecovery8th ──onDone──► showRecovery? → BackupWallet                                      │
│                           └─ else           → End                                               │
│                                                                                                  │
│  checkPasskeys (signup path) ──onDone──► showPasskeys? → AddPasskeys                            │
│                                      └─ else           → End                                    │
│                                                                                                  │
│  AddPasskeys ──CONTINUE──► AddPasskeysSuccess ──DONE──► End                                     │
│             ──SKIP──► End                                                                        │
│             ──BACK──► AuthSelection                                                              │
│                                                                                                  │
│  BackupWallet ──DONE──► BackupWalletSavePhrase ──DONE──► End                                    │
│              ──SKIP──► End                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### States

| State                      | Description                           | Invokes                                |
| -------------------------- | ------------------------------------- | -------------------------------------- |
| `AuthSelection`            | Entry point; renders method chooser   | —                                      |
| `AuthSelectionSignUp`      | Sign-up variant of method chooser     | —                                      |
| `SignUpPassKey`            | Passkey registration                  | —                                      |
| `SignInWithRecoveryPhrase` | Recovery phrase entry                 | —                                      |
| `BackupWallet`             | Step 1 of recovery backup             | —                                      |
| `BackupWalletSavePhrase`   | Step 2 of recovery backup             | —                                      |
| `AuthWithGoogle`           | Google OAuth                          | `AuthWithGoogleMachine`                |
| `SignUpWithGoogle`         | Google OAuth for new accounts         | `AuthWithGoogleMachine`                |
| `AuthWithII`               | Internet Identity auth                | `signWithIIService`                    |
| `SignUpWithII`             | II for new accounts                   | `signWithIIService`                    |
| `SignUpWithEmail`          | Email signup                          | `AuthWithEmailMachine`                 |
| `EmailAuthentication`      | Email sign-in                         | `AuthWithEmailMachine`                 |
| `OtherSignOptions`         | Alternative methods                   | —                                      |
| `check2FA`                 | Check if 2FA is enabled               | `checkIf2FAEnabled`                    |
| `TwoFA`                    | 2FA code entry                        | —                                      |
| `checkPasskeys6th`         | Prompt passkeys every 6th login       | `shouldShowPasskeysEvery6thTime`       |
| `checkRecovery8th`         | Prompt recovery every 8th login       | `shouldShowRecoveryPhraseEvery8thTime` |
| `checkPasskeys`            | Check passkey availability for signup | `shouldShowPasskeys`                   |
| `AddPasskeys`              | Add passkey onboarding step           | —                                      |
| `AddPasskeysSuccess`       | Passkey added confirmation            | —                                      |
| `End`                      | **Final.** Carries `authSession`      | —                                      |

### Events

| Event                       | Payload                   | Origin State(s)                                                                                       | Target                                          |
| --------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `AUTH_WITH_EMAIL`           | `{ email, isEmbed }`      | `AuthSelection`                                                                                       | `EmailAuthentication`                           |
| `AUTH_WITH_EMAIL`           | `{ email, isEmbed }`      | `AuthSelectionSignUp`                                                                                 | `SignUpWithEmail`                               |
| `AUTH_WITH_GOOGLE`          | `{ jwt, email, isEmbed }` | `AuthSelection`                                                                                       | `AuthWithGoogle`                                |
| `AUTH_WITH_GOOGLE`          | `{ jwt, email, isEmbed }` | `AuthSelectionSignUp`                                                                                 | `SignUpWithGoogle`                              |
| `AUTH_WITH_II`              | `AbstractAuthSession?`    | `AuthSelection`                                                                                       | `AuthWithII`                                    |
| `AUTH_WITH_II`              | `AbstractAuthSession?`    | `AuthSelectionSignUp`                                                                                 | `SignUpWithII`                                  |
| `AUTH_WITH_OTHER`           | `{ isEmbed }`             | `AuthSelection`                                                                                       | `OtherSignOptions`                              |
| `AUTH_WITH_RECOVERY_PHRASE` | —                         | `OtherSignOptions`                                                                                    | `SignInWithRecoveryPhrase`                      |
| `SIGN_UP`                   | —                         | `AuthSelection`                                                                                       | `AuthSelectionSignUp`                           |
| `SIGN_IN`                   | —                         | `AuthSelectionSignUp`                                                                                 | `AuthSelection`                                 |
| `SIGN_UP_WITH_PASSKEY`      | —                         | `AuthSelectionSignUp`                                                                                 | `SignUpPassKey`                                 |
| `SIGN_IN_PASSKEY`           | `AbstractAuthSession?`    | `AuthSelection`                                                                                       | `checkRecovery8th`                              |
| `AUTHENTICATED`             | `AbstractAuthSession?`    | `AuthSelection`, `AuthSelectionSignUp`                                                                | `End`                                           |
| `AUTHENTICATED`             | `AbstractAuthSession?`    | `SignUpPassKey`                                                                                       | `End`                                           |
| `AUTHENTICATED`             | `AbstractAuthSession?`    | `OtherSignOptions`                                                                                    | `End`                                           |
| `AUTHENTICATED`             | `AbstractAuthSession?`    | `SignInWithRecoveryPhrase`                                                                            | `checkPasskeys6th`                              |
| `AUTHENTICATED`             | —                         | `TwoFA`                                                                                               | `checkRecovery8th`                              |
| `BACK`                      | —                         | `SignUpPassKey`, `SignInWithRecoveryPhrase` (→ `OtherSignOptions`), `OtherSignOptions`, `AddPasskeys` | varies                                          |
| `CONTINUE`                  | —                         | `AddPasskeys`                                                                                         | `AddPasskeysSuccess`                            |
| `SKIP`                      | —                         | `AddPasskeys`, `BackupWallet`                                                                         | `End`                                           |
| `DONE`                      | —                         | `AddPasskeysSuccess`, `BackupWallet`, `BackupWalletSavePhrase`                                        | `AddPasskeysSuccess` / `End`                    |
| `CHOOSE_WALLET`             | —                         | —                                                                                                     | — (defined in Events type, currently unhandled) |

### Guards

| Guard                        | Condition                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| `isExistingAccount`          | `event.data.anchor` is truthy (returned from Google/II invoke)                     |
| `isReturn`                   | Email machine `onDone` data is falsy (user navigated back)                         |
| `is2FAEnabled`               | `checkIf2FAEnabled` result is truthy                                               |
| `showPasskeys`               | `event.data.showPasskeys` is `true` (or `undefined`, defaults to `true`)           |
| `showRecovery`               | `event.data.showRecovery` is `true` (or `undefined`, defaults to `true`)           |
| `shouldShowRecoveryEvery8th` | `context.shouldShowRecoveryEvery8th === true` — inline guard in `checkPasskeys6th` |

### Actions

| Action                           | Effect                                                |
| -------------------------------- | ----------------------------------------------------- |
| `assignAuthSession`              | `context.authSession = event.data`                    |
| `assignVerificationEmail`        | `context.verificationEmail = event.data.email`        |
| `assignEmail`                    | `context.email = event.data.email`                    |
| `assignAllowedDevices`           | `context.allowedDevices = event.data.allowedPasskeys` |
| `assignShowPasskeys`             | `context.showPasskeys = event.data.showPasskeys`      |
| `assignShowRecovery`             | `context.showRecovery = event.data.showRecovery`      |
| `assignIsEmbed`                  | `context.isEmbed = event.data.isEmbed`                |
| `setShouldCheckRecoveryEvery8th` | `context.shouldShowRecoveryEvery8th = true`           |

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
