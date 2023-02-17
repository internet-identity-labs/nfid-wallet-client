// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.ConnectAccountService": {
      type: "done.invoke.ConnectAccountService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.ConnectAccountService": {
      type: "error.platform.ConnectAccountService"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    ConnectAccountService: "done.invoke.ConnectAccountService"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {}
  eventsCausingDelays: {}
  eventsCausingGuards: {}
  eventsCausingServices: {
    ConnectAccountService: "CONNECT_WITH_ACCOUNT"
  }
  matchesStates:
    | "ConnectAnonymously"
    | "ConnectWithAccount"
    | "ConnectionDetails"
    | "End"
    | "Error"
    | "Ready"
  tags: never
}
