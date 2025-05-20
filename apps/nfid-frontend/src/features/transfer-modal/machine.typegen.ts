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
    assignSelectedTargetFT: "ASSIGN_SELECTED_TARGET_FT"
    assignSourceAccount: "ASSIGN_SOURCE_ACCOUNT"
    assignSourceWallet: "ASSIGN_SOURCE_WALLET"
    assignStakeId: "ASSIGN_STAKE_ID"
    assignTokenStandard: "ASSIGN_TOKEN_STANDARD"
    assignTokenType: "CHANGE_TOKEN_TYPE"
    assignTransferObject: "ON_TRANSFER"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    isConvertMachine: ""
    isReceiveMachine: ""
    isRedeemMachine: ""
    isSendFungible: ""
    isSendMachine: ""
    isStakeMachine: ""
    isSwapMachine: ""
  }
  eventsCausingServices: {}
  matchesStates:
    | "ConvertMachine"
    | "Hidden"
    | "ReceiveMachine"
    | "RedeemMachine"
    | "SendMachine"
    | "SendMachine.CheckSendType"
    | "SendMachine.SendFT"
    | "SendMachine.SendNFT"
    | "StakeMachine"
    | "SwapMachine"
    | "SwapSuccess"
    | "TransferModal"
    | "TransferSuccess"
    | { SendMachine?: "CheckSendType" | "SendFT" | "SendNFT" }
  tags: never
}
