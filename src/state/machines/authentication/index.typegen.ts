// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {
    assignAuthSession: "done.invoke.known-device" | "done.invoke.unknown-device"
  }
  internalEvents: {
    "done.invoke.known-device": {
      type: "done.invoke.known-device"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.unknown-device": {
      type: "done.invoke.unknown-device"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "": { type: "" }
    "xstate.init": { type: "xstate.init" }
    "error.platform.known-device": {
      type: "error.platform.known-device"
      data: unknown
    }
    "error.platform.unknown-device": {
      type: "error.platform.unknown-device"
      data: unknown
    }
  }
  invokeSrcNameMap: {
    KnownDeviceMachine: "done.invoke.known-device"
    UnknownDeviceMachine: "done.invoke.unknown-device"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingServices: {
    KnownDeviceMachine: ""
    UnknownDeviceMachine: ""
  }
  eventsCausingGuards: {
    isDeviceRegistered: ""
  }
  eventsCausingDelays: {}
  matchesStates: "IsDeviceRegistered" | "KnownDevice" | "UnknownDevice" | "End"
  tags: never
}
