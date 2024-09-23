// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "": { type: "" }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {}
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    assignAmount: "ASSIGN_AMOUNT"
    assignDirection: "CHANGE_DIRECTION"
    assignError: "ASSIGN_ERROR"
    assignIsVault: "ASSIGN_VAULTS"
    assignReceiverWallet: "ASSIGN_RECEIVER_WALLET"
    assignSelectedFT: "ASSIGN_SELECTED_FT"
    assignSelectedNFTId: "ASSIGN_SELECTED_NFT"
    assignSourceAccount: "ASSIGN_SOURCE_ACCOUNT"
    assignSourceWallet: "ASSIGN_SOURCE_WALLET"
    assignSwapObject: "ON_SWAP"
    assignTokenStandard: "ASSIGN_TOKEN_STANDARD"
    assignTokenType: "CHANGE_TOKEN_TYPE"
    assignTransferObject: "ON_TRANSFER"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    isReceiveMachine: ""
    isSendFungible: ""
    isSendMachine: ""
    isSwapMachine: ""
  }
  eventsCausingServices: {}
  matchesStates:
    | "Hidden"
    | "ReceiveMachine"
    | "SendMachine"
    | "SendMachine.CheckSendType"
    | "SendMachine.SendFT"
    | "SendMachine.SendNFT"
    | "SwapMachine"
    | "SwapSuccess"
    | "TransferModal"
    | "TransferSuccess"
    | { SendMachine?: "CheckSendType" | "SendFT" | "SendNFT" }
  tags: never
}
