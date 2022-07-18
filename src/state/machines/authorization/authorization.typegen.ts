// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {
    assignUserLimit: "done.invoke.fetchAppUserLimit"
    assignAccounts: "done.invoke.fetchAccounts"
    handleAccounts: "done.invoke.fetchAccounts"
  }
  internalEvents: {
    "done.invoke.fetchAppUserLimit": {
      type: "done.invoke.fetchAppUserLimit"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.fetchAccounts": {
      type: "done.invoke.fetchAccounts"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.createAccount": {
      type: "done.invoke.createAccount"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "xstate.init": { type: "xstate.init" }
    "error.platform.fetchAppUserLimit": {
      type: "error.platform.fetchAppUserLimit"
      data: unknown
    }
    "error.platform.fetchAccounts": {
      type: "error.platform.fetchAccounts"
      data: unknown
    }
    "error.platform.createAccount": {
      type: "error.platform.createAccount"
      data: unknown
    }
    "done.invoke.fetchDelegate": {
      type: "done.invoke.fetchDelegate"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.fetchDelegate": {
      type: "error.platform.fetchDelegate"
      data: unknown
    }
  }
  invokeSrcNameMap: {
    fetchAppUserLimit: "done.invoke.fetchAppUserLimit"
    fetchAccounts: "done.invoke.fetchAccounts"
    createAccount: "done.invoke.createAccount"
    fetchDelegate: "done.invoke.fetchDelegate"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingServices: {
    fetchAppUserLimit: "xstate.init"
    fetchAccounts: "done.invoke.fetchAppUserLimit"
    createAccount: "CREATE_ACCOUNT"
    fetchDelegate: "SELECT_ACCOUNT" | "done.invoke.createAccount"
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
