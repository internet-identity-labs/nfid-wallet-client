// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.AuthWithEmailMachine": {
      type: "done.invoke.AuthWithEmailMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.AuthWithGoogleMachine": {
      type: "done.invoke.AuthWithGoogleMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.AuthWithIIService": {
      type: "done.invoke.AuthWithIIService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.checkIf2FAEnabled": {
      type: "done.invoke.checkIf2FAEnabled"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.shouldShowPasskeys": {
      type: "done.invoke.shouldShowPasskeys"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.shouldShowPasskeys6th": {
      type: "done.invoke.shouldShowPasskeys6th"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.shouldShowRecovery8th": {
      type: "done.invoke.shouldShowRecovery8th"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.AuthWithEmailMachine": {
      type: "error.platform.AuthWithEmailMachine"
      data: unknown
    }
    "error.platform.AuthWithGoogleMachine": {
      type: "error.platform.AuthWithGoogleMachine"
      data: unknown
    }
    "error.platform.checkIf2FAEnabled": {
      type: "error.platform.checkIf2FAEnabled"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    AuthWithEmailMachine: "done.invoke.AuthWithEmailMachine"
    AuthWithGoogleMachine: "done.invoke.AuthWithGoogleMachine"
    checkIf2FAEnabled: "done.invoke.checkIf2FAEnabled"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    assignAllowedDevices: "done.invoke.checkIf2FAEnabled"
    assignAuthSession:
      | "AUTHENTICATED"
      | "AUTH_WITH_II"
      | "SIGN_IN_PASSKEY"
      | "done.invoke.AuthWithEmailMachine"
      | "done.invoke.AuthWithGoogleMachine"
      | "done.invoke.AuthWithIIService"
    assignEmail: "AUTH_WITH_GOOGLE"
    assignIsEmbed: "AUTH_WITH_EMAIL" | "AUTH_WITH_GOOGLE" | "AUTH_WITH_OTHER"
    assignShowPasskeys:
      | "done.invoke.shouldShowPasskeys"
      | "done.invoke.shouldShowPasskeys6th"
    assignShowRecovery: "done.invoke.shouldShowRecovery8th"
    assignVerificationEmail: "AUTH_WITH_EMAIL"
    setShouldCheckRecoveryEvery8th: "done.invoke.checkIf2FAEnabled"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    is2FAEnabled: "done.invoke.checkIf2FAEnabled"
    isExistingAccount:
      | "done.invoke.AuthWithGoogleMachine"
      | "done.invoke.AuthWithIIService"
    isReturn: "done.invoke.AuthWithEmailMachine"
    showPasskeys:
      | "done.invoke.shouldShowPasskeys"
      | "done.invoke.shouldShowPasskeys6th"
    showRecovery: "done.invoke.shouldShowRecovery8th"
  }
  eventsCausingServices: {
    AuthWithEmailMachine: "AUTH_WITH_EMAIL"
    AuthWithGoogleMachine: "AUTH_WITH_GOOGLE"
    AuthWithIIService: "AUTH_WITH_II"
    checkIf2FAEnabled:
      | "done.invoke.AuthWithEmailMachine"
      | "done.invoke.AuthWithGoogleMachine"
      | "done.invoke.AuthWithIIService"
    shouldShowPasskeys:
      | "done.invoke.AuthWithEmailMachine"
      | "done.invoke.AuthWithGoogleMachine"
    shouldShowPasskeys6th: "AUTHENTICATED" | "done.invoke.checkIf2FAEnabled"
    shouldShowRecovery8th:
      | "AUTHENTICATED"
      | "SIGN_IN_PASSKEY"
      | "done.invoke.shouldShowPasskeys6th"
  }
  matchesStates:
    | "AddPasskeys"
    | "AddPasskeysSuccess"
    | "AuthSelection"
    | "AuthSelectionSignUp"
    | "AuthWithGoogle"
    | "AuthWithII"
    | "BackupWallet"
    | "BackupWalletSavePhrase"
    | "EmailAuthentication"
    | "End"
    | "OtherSignOptions"
    | "SignInWithRecoveryPhrase"
    | "SignUpPassKey"
    | "SignUpWithEmail"
    | "SignUpWithGoogle"
    | "TwoFA"
    | "check2FA"
    | "checkPasskeys"
    | "checkPasskeys6th"
    | "checkRecovery8th"
  tags: never
}
