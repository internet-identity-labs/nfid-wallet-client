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
    "done.invoke.getThirdPartyAuthSession": {
      type: "done.invoke.getThirdPartyAuthSession"
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
    "error.platform.getThirdPartyAuthSession": {
      type: "error.platform.getThirdPartyAuthSession"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    AuthWithEmailMachine: "done.invoke.AuthWithEmailMachine"
    AuthWithGoogleMachine: "done.invoke.AuthWithGoogleMachine"
    getThirdPartyAuthSession: "done.invoke.getThirdPartyAuthSession"
  }
  missingImplementations: {
    actions: "assignThirdPartyAuthSession"
    delays: never
    guards: "isNFID"
    services: never
  }
  eventsCausingActions: {
    assignAuthSession:
      | "AUTHENTICATED"
      | "done.invoke.AuthWithEmailMachine"
      | "done.invoke.AuthWithGoogleMachine"
    assignThirdPartyAuthSession: "done.invoke.getThirdPartyAuthSession"
    assignVerificationEmail: "AUTH_WITH_EMAIL"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    isExistingAccount:
      | "done.invoke.AuthWithEmailMachine"
      | "done.invoke.AuthWithGoogleMachine"
    isNFID: ""
    isReturn: "done.invoke.AuthWithEmailMachine"
  }
  eventsCausingServices: {
    AuthWithEmailMachine: "AUTH_WITH_EMAIL"
    AuthWithGoogleMachine: "AUTH_WITH_GOOGLE"
    getThirdPartyAuthSession: ""
  }
  matchesStates:
    | "AuthSelection"
    | "AuthWithGoogle"
    | "Authenticated"
    | "EmailAuthentication"
    | "End"
    | "GetThirdPartyAuthSession"
    | "OtherSignOptions"
  tags: never
}
