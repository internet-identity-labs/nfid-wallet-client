// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {
    assignUserLimit: "done.invoke.fetchAccountLimitService"
    assignAccounts: "done.invoke.fetchAccountsService"
    handleAccounts: "done.invoke.fetchAccountsService"
  }
  internalEvents: {
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
    "done.invoke.createAccountService": {
      type: "done.invoke.createAccountService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "xstate.init": { type: "xstate.init" }
    "error.platform.fetchAccountLimitService": {
      type: "error.platform.fetchAccountLimitService"
      data: unknown
    }
    "error.platform.fetchAccountsService": {
      type: "error.platform.fetchAccountsService"
      data: unknown
    }
    "error.platform.createAccountService": {
      type: "error.platform.createAccountService"
      data: unknown
    }
    "done.invoke.fetchDelegateService": {
      type: "done.invoke.fetchDelegateService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.fetchDelegateService": {
      type: "error.platform.fetchDelegateService"
      data: unknown
    }
  }
  invokeSrcNameMap: {
    fetchAccountLimitService: "done.invoke.fetchAccountLimitService"
    fetchAccountsService: "done.invoke.fetchAccountsService"
    createAccountService: "done.invoke.createAccountService"
    fetchDelegateService: "done.invoke.fetchDelegateService"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingServices: {
    fetchAccountLimitService: "xstate.init"
    fetchAccountsService: "done.invoke.fetchAccountLimitService"
    createAccountService: "CREATE_ACCOUNT"
    fetchDelegateService: "SELECT_ACCOUNT" | "done.invoke.createAccountService"
  }
  eventsCausingGuards: {}
  eventsCausingDelays: {}
  matchesStates:
    | "Start"
    | "FetchAccounts"
    | "CreateAccount"
    | "PresentAccounts"
    | "GetDelegation"
    | "End"
  tags: never
}
