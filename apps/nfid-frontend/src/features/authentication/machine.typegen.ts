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
    "done.invoke.postDelegation": {
      type: "done.invoke.postDelegation"
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
    "error.platform.postDelegation": {
      type: "error.platform.postDelegation"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    AuthWithEmailMachine: "done.invoke.AuthWithEmailMachine"
    AuthWithGoogleMachine: "done.invoke.AuthWithGoogleMachine"
    postDelegation: "done.invoke.postDelegation"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    assignAuthSession:
      | "done.invoke.AuthWithEmailMachine"
      | "done.invoke.AuthWithGoogleMachine"
    assignVerificationEmail: "AUTH_WITH_EMAIL"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    isExistingAccount:
      | "done.invoke.AuthWithEmailMachine"
      | "done.invoke.AuthWithGoogleMachine"
    isReturn: "done.invoke.AuthWithEmailMachine"
  }
  eventsCausingServices: {
    AuthWithEmailMachine: "AUTH_WITH_EMAIL"
    AuthWithGoogleMachine: "AUTH_WITH_GOOGLE"
    postDelegation:
      | "done.invoke.AuthWithEmailMachine"
      | "done.invoke.AuthWithGoogleMachine"
  }
  matchesStates:
    | "AuthSelection"
    | "AuthWithGoogle"
    | "EmailAuthentication"
    | "End"
  tags: never
}
