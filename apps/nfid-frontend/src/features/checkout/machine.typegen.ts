// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.getPurchaseInfo": {
      type: "done.invoke.getPurchaseInfo"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.sendTransactionService": {
      type: "done.invoke.sendTransactionService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.getPurchaseInfo": {
      type: "error.platform.getPurchaseInfo"
      data: unknown
    }
    "error.platform.sendTransactionService": {
      type: "error.platform.sendTransactionService"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    getPurchaseInfo: "done.invoke.getPurchaseInfo"
    sendTransactionService: "done.invoke.sendTransactionService"
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
    getPurchaseInfo: "xstate.init"
    sendTransactionService: "VERIFY"
  }
  matchesStates:
    | "Checkout"
    | "End"
    | "Preloader"
    | "Ramp"
    | "Success"
    | "TransactionDetails"
    | "Verifying"
  tags: never
}
