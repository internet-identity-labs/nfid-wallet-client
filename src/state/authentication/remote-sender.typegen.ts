// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {
    ingestUser: "done.invoke.known-device" | "done.invoke.registration"
  }
  internalEvents: {
    "done.invoke.known-device": {
      type: "done.invoke.known-device"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.registration": {
      type: "done.invoke.registration"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "": { type: "" }
    "xstate.init": { type: "xstate.init" }
    "error.platform.known-device": {
      type: "error.platform.known-device"
      data: unknown
    }
    "error.platform.registration": {
      type: "error.platform.registration"
      data: unknown
    }
    "done.invoke.post-delegate": {
      type: "done.invoke.post-delegate"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.post-delegate": {
      type: "error.platform.post-delegate"
      data: unknown
    }
  }
  invokeSrcNameMap: {
    KnownDeviceMachine: "done.invoke.known-device"
    RegistrationMachine: "done.invoke.registration"
    postDelegate: "done.invoke.post-delegate"
  }
  missingImplementations: {
    actions: never
    services: "KnownDeviceMachine"
    guards: "isDeviceRegistered"
    delays: never
  }
  eventsCausingServices: {
    KnownDeviceMachine: ""
    RegistrationMachine: ""
    postDelegate: "done.invoke.known-device" | "done.invoke.registration"
  }
  eventsCausingGuards: {
    isDeviceRegistered: ""
  }
  eventsCausingDelays: {}
  matchesStates:
    | "IsDeviceRegistered"
    | "KnownDevice"
    | "RegistrationMachine"
    | "End"
  tags: never
}
