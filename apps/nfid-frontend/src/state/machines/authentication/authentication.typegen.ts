// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "": { type: "" }
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
    "error.platform.known-device": {
      type: "error.platform.known-device"
      data: unknown
    }
    "error.platform.unknown-device": {
      type: "error.platform.unknown-device"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    KnownDeviceMachine: "done.invoke.known-device"
    UnknownDeviceMachine: "done.invoke.unknown-device"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    assignAuthSession: "done.invoke.known-device" | "done.invoke.unknown-device"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    isDeviceRegistered: ""
  }
  eventsCausingServices: {
    KnownDeviceMachine: ""
    UnknownDeviceMachine: ""
  }
  matchesStates: "End" | "IsDeviceRegistered" | "KnownDevice" | "UnknownDevice"
  tags: never
}
