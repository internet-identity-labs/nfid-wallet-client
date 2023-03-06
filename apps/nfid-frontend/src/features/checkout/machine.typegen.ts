// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "": { type: "" }
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
  eventsCausingGuards: {
    hasPreparedSignature: "" | "VERIFY"
  }
  eventsCausingServices: {
    decodeRequest: "xstate.init"
    prepareSignature: "xstate.init"
    sendTransactionService: "" | "VERIFY"
  }
  matchesStates:
    | "done"
    | "initial"
    | "initial.Preparation"
    | "initial.Preparation.DecodeRequest"
    | "initial.Preparation.DecodeRequest.Decode"
    | "initial.Preparation.DecodeRequest.Done"
    | "initial.Preparation.PrepareSignature"
    | "initial.Preparation.PrepareSignature.Done"
    | "initial.Preparation.PrepareSignature.Prepare"
    | "initial.UI"
    | "initial.UI.Checkout"
    | "initial.UI.End"
    | "initial.UI.Loader"
    | "initial.UI.Ramp"
    | "initial.UI.Success"
    | "initial.UI.TransactionDetails"
    | "initial.UI.Verifying"
    | "initial.UI.WaitForSignature"
    | {
        initial?:
          | "Preparation"
          | "UI"
          | {
              Preparation?:
                | "DecodeRequest"
                | "PrepareSignature"
                | {
                    DecodeRequest?: "Decode" | "Done"
                    PrepareSignature?: "Done" | "Prepare"
                  }
              UI?:
                | "Checkout"
                | "End"
                | "Loader"
                | "Ramp"
                | "Success"
                | "TransactionDetails"
                | "Verifying"
                | "WaitForSignature"
            }
      }
  tags: never
}
