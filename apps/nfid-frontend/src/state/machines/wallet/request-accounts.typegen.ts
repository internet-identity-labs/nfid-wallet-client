// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.AuthenticationMachine": {
      type: "done.invoke.AuthenticationMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.registerRequestAccountsHandler": {
      type: "done.invoke.registerRequestAccountsHandler"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.AuthenticationMachine": {
      type: "error.platform.AuthenticationMachine"
      data: unknown
    }
    "error.platform.registerRequestAccountsHandler": {
      type: "error.platform.registerRequestAccountsHandler"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    AuthenticationMachine: "done.invoke.AuthenticationMachine"
    registerRequestAccountsHandler: "done.invoke.registerRequestAccountsHandler"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingActions: {
    assignAuthSession: "done.invoke.AuthenticationMachine"
    assignRequestAccountsRequest: "done.invoke.registerRequestAccountsHandler"
  }
  eventsCausingServices: {
    AuthenticationMachine: "done.invoke.registerRequestAccountsHandler"
    registerRequestAccountsHandler: "xstate.init"
  }
  eventsCausingGuards: {}
  eventsCausingDelays: {}
  matchesStates: "Authenticate" | "End" | "Ready" | "RequestAccounts"
  tags: never
}
