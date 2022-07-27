// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "xstate.init": { type: "xstate.init" }
    "done.invoke.isMobileWithWebAuthn": {
      type: "done.invoke.isMobileWithWebAuthn"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.fetchGoogleDevice": {
      type: "done.invoke.fetchGoogleDevice"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.isMobileWithWebAuthn": {
      type: "error.platform.isMobileWithWebAuthn"
      data: unknown
    }
    "done.invoke.registration": {
      type: "done.invoke.registration"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.registration": {
      type: "error.platform.registration"
      data: unknown
    }
    "done.invoke.signInWithGoogle": {
      type: "done.invoke.signInWithGoogle"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.signInWithGoogle": {
      type: "error.platform.signInWithGoogle"
      data: unknown
    }
    "error.platform.fetchGoogleDevice": {
      type: "error.platform.fetchGoogleDevice"
      data: unknown
    }
    "done.invoke.remote": {
      type: "done.invoke.remote"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.remote": { type: "error.platform.remote"; data: unknown }
    "done.invoke.loginWithAnchor": {
      type: "done.invoke.loginWithAnchor"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.loginWithAnchor": {
      type: "error.platform.loginWithAnchor"
      data: unknown
    }
  }
  invokeSrcNameMap: {
    isMobileWithWebAuthn: "done.invoke.isMobileWithWebAuthn"
    RegistrationMachine: "done.invoke.registration"
    signInWithGoogle: "done.invoke.signInWithGoogle"
    fetchGoogleDevice: "done.invoke.fetchGoogleDevice"
    RemoteReceiverMachine: "done.invoke.remote"
    loginWithAnchor: "done.invoke.loginWithAnchor"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingActions: {}
  eventsCausingServices: {
    isMobileWithWebAuthn: "xstate.init"
    RegistrationMachine:
      | "done.invoke.isMobileWithWebAuthn"
      | "done.invoke.fetchGoogleDevice"
    signInWithGoogle: "done.invoke.fetchGoogleDevice"
    fetchGoogleDevice: "AUTH_WITH_GOOGLE"
    RemoteReceiverMachine: "AUTH_WITH_REMOTE"
    loginWithAnchor: "AUTH_WITH_EXISTING_ANCHOR"
  }
  eventsCausingGuards: {
    bool: "done.invoke.isMobileWithWebAuthn"
    isExistingGoogleAccount: "done.invoke.fetchGoogleDevice"
  }
  eventsCausingDelays: {}
  matchesStates:
    | "Start"
    | "Start.CheckCapability"
    | "RegistrationMachine"
    | "AuthSelection"
    | "AuthWithGoogle"
    | "AuthWithGoogle.SignIn"
    | "AuthWithGoogle.Fetch"
    | "RemoteAuthentication"
    | "ExistingAnchor"
    | "End"
    | "AuthenticateSameDevice"
    | { Start?: "CheckCapability"; AuthWithGoogle?: "SignIn" | "Fetch" }
  tags: never
}
