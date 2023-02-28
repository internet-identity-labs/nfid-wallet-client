// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.SignTypedDataService": {
      type: "done.invoke.SignTypedDataService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.SignTypedDataService": {
      type: "error.platform.SignTypedDataService"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
    "xstate.stop": { type: "xstate.stop" }
  }
  invokeSrcNameMap: {
    SignTypedDataService: "done.invoke.SignTypedDataService"
  }
  missingImplementations: {
    actions: "sendRPCResponse"
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    sendRPCResponse: "done.invoke.SignTypedDataService" | "xstate.stop"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {}
  eventsCausingServices: {
    SignTypedDataService: "SIGN"
  }
  matchesStates: "ConfirmSign" | "End" | "SignTypedDataV4"
  tags: never
}
