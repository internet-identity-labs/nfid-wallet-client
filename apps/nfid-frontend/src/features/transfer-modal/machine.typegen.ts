// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "": { type: "" }
    "done.invoke.TransferMachine.TransferFT:invocation[0]": {
      type: "done.invoke.TransferMachine.TransferFT:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.TransferMachine.TransferNFT:invocation[0]": {
      type: "done.invoke.TransferMachine.TransferNFT:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "xstate.after(5000)#TransferMachine.Success": {
      type: "xstate.after(5000)#TransferMachine.Success"
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    transferFT: "done.invoke.TransferMachine.TransferFT:invocation[0]"
    transferNFT: "done.invoke.TransferMachine.TransferNFT:invocation[0]"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    assignAmount: "ASSIGN_AMOUNT"
    assignDirection: "CHANGE_DIRECTION"
    assignReceiverWallet: "ASSIGN_RECEIVER_WALLET"
    assignSelectedFT: "ASSIGN_SELECTED_FT"
    assignSelectedNFT: "ASSIGN_SELECTED_NFT"
    assignSourceAccount: "ASSIGN_SOURCE_ACCOUNT"
    assignSourceWallet: "ASSIGN_SOURCE_WALLET"
    assignSuccessMessage:
      | "done.invoke.TransferMachine.TransferFT:invocation[0]"
      | "done.invoke.TransferMachine.TransferNFT:invocation[0]"
    assignTokenType: "CHANGE_TOKEN_TYPE"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    isSendFungible: ""
    isSendMachine: ""
  }
  eventsCausingServices: {
    transferFT: "ON_SUBMIT"
    transferNFT: "ON_SUBMIT"
  }
  matchesStates:
    | "Hidden"
    | "ReceiveMachine"
    | "SendMachine"
    | "SendMachine.CheckSendType"
    | "SendMachine.SendFT"
    | "SendMachine.SendNFT"
    | "Success"
    | "TransferFT"
    | "TransferModal"
    | "TransferNFT"
    | { SendMachine?: "CheckSendType" | "SendFT" | "SendNFT" }
  tags: never
}
