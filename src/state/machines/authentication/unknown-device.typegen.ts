// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.registration": {
      type: "done.invoke.registration"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.AuthWithGoogleMachine": {
      type: "done.invoke.AuthWithGoogleMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.remote": {
      type: "done.invoke.remote"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.loginWithAnchor": {
      type: "done.invoke.loginWithAnchor"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "xstate.init": { type: "xstate.init" }
    "done.invoke.isMobileWithWebAuthn": {
      type: "done.invoke.isMobileWithWebAuthn"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.isMobileWithWebAuthn": {
      type: "error.platform.isMobileWithWebAuthn"
      data: unknown
    }
    "error.platform.registration": {
      type: "error.platform.registration"
      data: unknown
    }
    "error.platform.AuthWithGoogleMachine": {
      type: "error.platform.AuthWithGoogleMachine"
      data: unknown
    }
    "error.platform.remote": { type: "error.platform.remote"; data: unknown }
    "error.platform.loginWithAnchor": {
      type: "error.platform.loginWithAnchor"
      data: unknown
    }
  }
  invokeSrcNameMap: {
    isMobileWithWebAuthn: "done.invoke.isMobileWithWebAuthn"
    RegistrationMachine: "done.invoke.registration"
    AuthWithGoogleMachine: "done.invoke.AuthWithGoogleMachine"
    RemoteReceiverMachine: "done.invoke.remote"
    loginWithAnchor: "done.invoke.loginWithAnchor"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingActions: {
    assignAuthSession:
      | "done.invoke.registration"
      | "done.invoke.AuthWithGoogleMachine"
      | "done.invoke.remote"
      | "done.invoke.loginWithAnchor"
  }
  eventsCausingServices: {
    isMobileWithWebAuthn: "xstate.init"
    RegistrationMachine:
      | "done.invoke.isMobileWithWebAuthn"
      | "done.invoke.AuthWithGoogleMachine"
    AuthWithGoogleMachine: "AUTH_WITH_GOOGLE"
    RemoteReceiverMachine: "AUTH_WITH_REMOTE"
    loginWithAnchor: "AUTH_WITH_EXISTING_ANCHOR"
  }
  eventsCausingGuards: {
    bool: "done.invoke.isMobileWithWebAuthn"
    isExistingGoogleAccount: "done.invoke.AuthWithGoogleMachine"
  }
  eventsCausingDelays: {}
  matchesStates:
    | "Start"
    | "Start.CheckCapability"
    | "RegistrationMachine"
    | "AuthSelection"
    | "AuthWithGoogle"
    | "RemoteAuthentication"
    | "ExistingAnchor"
    | "AuthenticateSameDevice"
    | "End"
    | { Start?: "CheckCapability" }
  tags: never
}
