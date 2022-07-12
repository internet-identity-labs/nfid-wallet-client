// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {
    ingestGoogle: "AUTH_WITH_GOOGLE"
    ingestSignIdentity: "done.invoke.remote"
  }
  internalEvents: {
    "done.invoke.remote": {
      type: "done.invoke.remote"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "": { type: "" }
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
    "error.platform.remote": { type: "error.platform.remote"; data: unknown }
  }
  invokeSrcNameMap: {
    RegistrationMachine: "done.invoke.registration"
    RemoteReceiverMachine: "done.invoke.remote"
    registerDevice: "done.invoke.authenticate-unknown-device.RegisterDevice:invocation[0]"
  }
  missingImplementations: {
    actions: never
    services: "registerDevice"
    guards: never
    delays: never
  }
  eventsCausingServices: {
    RegistrationMachine: ""
    RemoteReceiverMachine: "AUTH_WITH_REMOTE"
    registerDevice: "TRUST_DEVICE"
  }
  eventsCausingGuards: {
    isMobileWithWebAuthn: ""
    googleIdentityExists: ""
  }
  eventsCausingDelays: {}
  matchesStates:
    | "Start"
    | "End"
    | "RegistrationMachine"
    | "AuthSelection"
    | "AuthWithGoogle"
    | "RemoteAuthentication"
    | "RegisterDeviceDecider"
    | "RegisterDevice"
    | "RegisterDeviceError"
  tags: never
}
