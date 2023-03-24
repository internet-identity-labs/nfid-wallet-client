// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.fetchAccountsService": {
      type: "done.invoke.fetchAccountsService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.fetchAccountsService": {
      type: "error.platform.fetchAccountsService"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    fetchAccountsService: "done.invoke.fetchAccountsService"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    assignAccounts: "done.invoke.fetchAccountsService"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {}
  eventsCausingServices: {
    fetchAccountsService: "BACK" | "xstate.init"
  }
  matchesStates:
    | "ConnectionDetails"
    | "End"
    | "Error"
    | "Start"
    | "Start.FetchAccounts"
    | { Start?: "FetchAccounts" }
  tags: never
}
