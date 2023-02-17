// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.ConnectAccountService": {
      type: "done.invoke.ConnectAccountService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.createAccountService": {
      type: "done.invoke.createAccountService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.fetchAccountLimitService": {
      type: "done.invoke.fetchAccountLimitService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.fetchAccountsService": {
      type: "done.invoke.fetchAccountsService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.ConnectAccountService": {
      type: "error.platform.ConnectAccountService"
      data: unknown
    }
    "error.platform.createAccountService": {
      type: "error.platform.createAccountService"
      data: unknown
    }
    "error.platform.fetchAccountLimitService": {
      type: "error.platform.fetchAccountLimitService"
      data: unknown
    }
    "error.platform.fetchAccountsService": {
      type: "error.platform.fetchAccountsService"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    ConnectAccountService: "done.invoke.ConnectAccountService"
    createAccountService: "done.invoke.createAccountService"
    fetchAccountLimitService: "done.invoke.fetchAccountLimitService"
    fetchAccountsService: "done.invoke.fetchAccountsService"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: "fetchAccountLimitService"
  }
  eventsCausingActions: {
    assignAccounts: "done.invoke.fetchAccountsService"
    assignUserLimit: "done.invoke.fetchAccountLimitService"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {}
  eventsCausingServices: {
    ConnectAccountService:
      | "CONNECT_WITH_ACCOUNT"
      | "done.invoke.createAccountService"
    createAccountService: "CONNECT_ANONYMOUSLY"
    fetchAccountLimitService: "BACK" | "xstate.init"
    fetchAccountsService:
      | "BACK"
      | "done.invoke.fetchAccountLimitService"
      | "xstate.init"
  }
  matchesStates:
    | "ConnectAnonymously"
    | "ConnectWithAccount"
    | "ConnectionDetails"
    | "End"
    | "Error"
    | "Start"
    | "Start.FetchAccountLimit"
    | "Start.FetchAccounts"
    | { Start?: "FetchAccountLimit" | "FetchAccounts" }
  tags: never
}
