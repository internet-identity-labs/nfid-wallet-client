// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {}
  internalEvents: {
    "": { type: "" }
    "done.invoke.fetchGoogleDevice": {
      type: "done.invoke.fetchGoogleDevice"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "xstate.init": { type: "xstate.init" }
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
  }
  invokeSrcNameMap: {
    RegistrationMachine: "done.invoke.registration"
    signInWithGoogle: "done.invoke.signInWithGoogle"
    fetchGoogleDevice: "done.invoke.fetchGoogleDevice"
    RemoteReceiverMachine: "done.invoke.remote"
    registerDevice: "done.invoke.auth-unknown-device.RegisterDevice:invocation[0]"
  }
  missingImplementations: {
    actions: never
    services: "registerDevice"
    guards: never
    delays: never
  }
  eventsCausingServices: {
    RegistrationMachine: "" | "done.invoke.fetchGoogleDevice"
    fetchGoogleDevice: "AUTH_WITH_GOOGLE"
    RemoteReceiverMachine: "AUTH_WITH_REMOTE"
    signInWithGoogle: "done.invoke.fetchGoogleDevice"
    registerDevice: "TRUST_DEVICE"
  }
  eventsCausingGuards: {
    isMobileWithWebAuthn: ""
    isExistingGoogleAccount: "done.invoke.fetchGoogleDevice"
  }
  eventsCausingDelays: {}
  matchesStates:
    | "Start"
    | "RegistrationMachine"
    | "AuthSelection"
    | "AuthWithGoogle"
    | "AuthWithGoogle.SignIn"
    | "AuthWithGoogle.Fetch"
    | "RemoteAuthentication"
    | "RegisterDevice"
    | "RegisterDeviceError"
    | "ExistingAnchor"
    | "End"
    | { AuthWithGoogle?: "SignIn" | "Fetch" }
  tags: never
}
