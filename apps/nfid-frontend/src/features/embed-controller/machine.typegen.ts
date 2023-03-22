// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "": { type: "" }
    "done.invoke.MethodControllerService": {
      type: "done.invoke.MethodControllerService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.SignTypedDataService": {
      type: "done.invoke.SignTypedDataService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.decodeRPCRequestService": {
      type: "done.invoke.decodeRPCRequestService"
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
    "error.platform.MethodControllerService": {
      type: "error.platform.MethodControllerService"
      data: unknown
    }
    "error.platform.SignTypedDataService": {
      type: "error.platform.SignTypedDataService"
      data: unknown
    }
    "error.platform.decodeRPCRequestService": {
      type: "error.platform.decodeRPCRequestService"
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
    "xstate.after(3000)#EmbedController.Initial.UI.DecodeRequest": {
      type: "xstate.after(3000)#EmbedController.Initial.UI.DecodeRequest"
    }
    "xstate.init": { type: "xstate.init" }
    "xstate.stop": { type: "xstate.stop" }
  }
  invokeSrcNameMap: {
    MethodControllerService: "done.invoke.MethodControllerService"
    SignTypedDataService: "done.invoke.SignTypedDataService"
    decodeRPCRequestService: "done.invoke.decodeRPCRequestService"
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
    assignData: "done.invoke.decodeRPCRequestService"
    assignError:
      | ""
      | "error.platform.MethodControllerService"
      | "error.platform.SignTypedDataService"
      | "error.platform.decodeRPCRequestService"
      | "error.platform.prepareSignature"
      | "error.platform.sendTransactionService"
    assignMethod:
      | "BUY"
      | "DEPLOY_COLLECTION"
      | "LAZY_MINT"
      | "MINT"
      | "SELL"
      | "done.invoke.MethodControllerService"
      | "done.state.EmbedController.Initial"
      | "error.platform.MethodControllerService"
      | "xstate.stop"
    assignPreparedSignature: "done.invoke.prepareSignature"
    assignRpcResponse:
      | "done.invoke.SignTypedDataService"
      | "done.invoke.sendTransactionService"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    hasError: ""
    hasPreparedSignature: "" | "SIGN"
  }
  eventsCausingServices: {
    MethodControllerService: "xstate.after(3000)#EmbedController.Initial.UI.DecodeRequest"
    SignTypedDataService: "SIGN"
    decodeRPCRequestService: "xstate.init"
    prepareSignature: "xstate.init"
    sendTransactionService: "" | "SIGN"
  }
  matchesStates:
    | "Canceled"
    | "Done"
    | "Error"
    | "Initial"
    | "Initial.PrepareSignature"
    | "Initial.PrepareSignature.End"
    | "Initial.PrepareSignature.Prepare"
    | "Initial.UI"
    | "Initial.UI.Buy"
    | "Initial.UI.DecodeRequest"
    | "Initial.UI.DefaultSign"
    | "Initial.UI.DeployCollection"
    | "Initial.UI.End"
    | "Initial.UI.Error"
    | "Initial.UI.LazyMint"
    | "Initial.UI.MethodController"
    | "Initial.UI.Mint"
    | "Initial.UI.Sell"
    | "Initial.UI.SendTransaction"
    | "Initial.UI.SignTypedData"
    | "Initial.UI.Success"
    | "Initial.UI.TransactionDetails"
    | "Initial.UI.WaitForSignature"
    | {
        Initial?:
          | "PrepareSignature"
          | "UI"
          | {
              PrepareSignature?: "End" | "Prepare"
              UI?:
                | "Buy"
                | "DecodeRequest"
                | "DefaultSign"
                | "DeployCollection"
                | "End"
                | "Error"
                | "LazyMint"
                | "MethodController"
                | "Mint"
                | "Sell"
                | "SendTransaction"
                | "SignTypedData"
                | "Success"
                | "TransactionDetails"
                | "WaitForSignature"
            }
      }
  tags: never
}
