// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.AuthenticationMachine": {
      type: "done.invoke.AuthenticationMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.trustDeviceMachine": {
      type: "done.invoke.trustDeviceMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.AuthenticationMachine": {
      type: "error.platform.AuthenticationMachine"
      data: unknown
    }
    "error.platform.trustDeviceMachine": {
      type: "error.platform.trustDeviceMachine"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    AuthenticationMachine: "done.invoke.AuthenticationMachine"
    TrustDeviceMachine: "done.invoke.trustDeviceMachine"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    assignAuthSession: "done.invoke.AuthenticationMachine"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    isWebAuthNSupported: "done.invoke.AuthenticationMachine"
  }
  eventsCausingServices: {
    AuthenticationMachine: "xstate.init"
    TrustDeviceMachine: "done.invoke.AuthenticationMachine"
  }
  matchesStates: "Authenticate" | "End" | "TrustDevice"
  tags: never
}
