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
    "done.invoke.shouldShowSNSBanner": {
      type: "done.invoke.shouldShowSNSBanner"
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
    "error.platform.shouldShowPasskeys": {
      type: "error.platform.shouldShowPasskeys"
      data: unknown
    }
    "error.platform.shouldShowSNSBanner": {
      type: "error.platform.shouldShowSNSBanner"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    AuthWithEmailMachine: "done.invoke.AuthWithEmailMachine"
    AuthWithGoogleMachine: "done.invoke.AuthWithGoogleMachine"
    checkIf2FAEnabled: "done.invoke.checkIf2FAEnabled"
    shouldShowPasskeys: "done.invoke.shouldShowPasskeys"
    shouldShowSNSBanner: "done.invoke.shouldShowSNSBanner"
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
    assignShowPasskeys: "done.invoke.shouldShowPasskeys"
    assignShowSNSBanner: "done.invoke.shouldShowSNSBanner"
    assignVerificationEmail: "AUTH_WITH_EMAIL"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    is2FAEnabled: "done.invoke.checkIf2FAEnabled"
    isExistingAccount: "done.invoke.AuthWithGoogleMachine"
    isReturn: "done.invoke.AuthWithEmailMachine"
    showPasskeys: "done.invoke.shouldShowPasskeys"
    showSNSBanner: "done.invoke.shouldShowSNSBanner"
  }
  eventsCausingServices: {
    AuthWithEmailMachine: "AUTH_WITH_EMAIL"
    AuthWithGoogleMachine: "AUTH_WITH_GOOGLE"
    checkIf2FAEnabled:
      | "done.invoke.AuthWithEmailMachine"
      | "done.invoke.AuthWithGoogleMachine"
    shouldShowPasskeys: "done.invoke.checkIf2FAEnabled"
    shouldShowSNSBanner:
      | "AUTHENTICATED"
      | "DONE"
      | "SKIP"
      | "done.invoke.shouldShowPasskeys"
  }
  matchesStates:
    | "AddPasskeys"
    | "AddPasskeysSuccess"
    | "AuthSelection"
    | "AuthWithGoogle"
    | "EmailAuthentication"
    | "End"
    | "OtherSignOptions"
    | "SNSBanner"
    | "TwoFA"
    | "check2FA"
    | "checkPasskeys"
    | "checkSNSBanner"
  tags: never
}
