// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "": { type: "" }
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
    "done.invoke.checkIf2FAEnabled": {
      type: "done.invoke.checkIf2FAEnabled"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.getWallets": {
      type: "done.invoke.getWallets"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.shouldShowPasskeys": {
      type: "done.invoke.shouldShowPasskeys"
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
    "error.platform.getWallets": {
      type: "error.platform.getWallets"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    AuthWithEmailMachine: "done.invoke.AuthWithEmailMachine"
    AuthWithGoogleMachine: "done.invoke.AuthWithGoogleMachine"
    checkIf2FAEnabled: "done.invoke.checkIf2FAEnabled"
    getWallets: "done.invoke.getWallets"
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
      | "done.invoke.AuthWithEmailMachine"
      | "done.invoke.AuthWithGoogleMachine"
    assignEmail: "AUTH_WITH_GOOGLE"
    assignIsEmbed: "AUTH_WITH_EMAIL" | "AUTH_WITH_GOOGLE" | "AUTH_WITH_OTHER"
    assignShowPasskeys: "done.invoke.shouldShowPasskeys"
    assignVerificationEmail: "AUTH_WITH_EMAIL"
    assignWallets: "done.invoke.getWallets"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    is2FAEnabled: "done.invoke.checkIf2FAEnabled"
    isExistingAccount: "done.invoke.AuthWithGoogleMachine"
    isReturn: "done.invoke.AuthWithEmailMachine"
    showChooseWallet: ""
    showPasskeys: "done.invoke.shouldShowPasskeys"
    showSNSBanner: ""
  }
  eventsCausingServices: {
    AuthWithEmailMachine: "AUTH_WITH_EMAIL"
    AuthWithGoogleMachine: "AUTH_WITH_GOOGLE"
    checkIf2FAEnabled:
      | "done.invoke.AuthWithEmailMachine"
      | "done.invoke.AuthWithGoogleMachine"
    getWallets: "xstate.init"
    shouldShowPasskeys: "done.invoke.checkIf2FAEnabled"
  }
  matchesStates:
    | "AddPasskeys"
    | "AddPasskeysSuccess"
    | "AuthSelection"
    | "AuthWithGoogle"
    | "CheckChooseWallet"
    | "ChooseWallet"
    | "EmailAuthentication"
    | "End"
    | "OtherSignOptions"
    | "ProceedWallets"
    | "SNSBanner"
    | "TwoFA"
    | "check2FA"
    | "checkPasskeys"
    | "checkSNSBanner"
  tags: never
}
