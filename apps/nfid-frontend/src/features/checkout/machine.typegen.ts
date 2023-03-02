// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.decodeRequest": {
      type: "done.invoke.decodeRequest"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.prepareSignature": {
      type: "done.invoke.prepareSignature"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.sendTransactionService": {
      type: "done.invoke.sendTransactionService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.decodeRequest": {
      type: "error.platform.decodeRequest"
      data: unknown
    }
    "error.platform.prepareSignature": {
      type: "error.platform.prepareSignature"
      data: unknown
    }
    "error.platform.sendTransactionService": {
      type: "error.platform.sendTransactionService"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    decodeRequest: "done.invoke.decodeRequest"
    prepareSignature: "done.invoke.prepareSignature"
    sendTransactionService: "done.invoke.sendTransactionService"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    assignDecodedData: "done.invoke.decodeRequest"
    assignPreparedSignature: "done.invoke.prepareSignature"
    assignRpcResponse: "done.invoke.sendTransactionService"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {}
  eventsCausingServices: {
    decodeRequest: "xstate.init"
    prepareSignature: "done.invoke.decodeRequest"
    sendTransactionService: "VERIFY"
  }
  matchesStates:
    | "Checkout"
    | "DecodeRequest"
    | "End"
    | "Preloader"
    | "Ramp"
    | "Success"
    | "TransactionDetails"
    | "Verifying"
  tags: never
}
