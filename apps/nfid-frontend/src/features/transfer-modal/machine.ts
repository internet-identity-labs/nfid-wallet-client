import { ActorRefFrom, assign, createMachine } from "xstate"

import { Events, TransferMachineContext } from "./types"

const transferMachineConfig = {
  id: "TransferMachine",
  initial: "Hidden",
  on: {
    CHANGE_TOKEN_TYPE: {
      target: "#SendMachine.CheckSendType",
      actions: "assignTokenType",
    },
    CHANGE_DIRECTION: {
      target: ".TransferModal",
      actions: "assignDirection",
    },
    ASSIGN_IS_EARN_UPDATE: { actions: "assignIsEarnUpdate" },
    ASSIGN_SOURCE_ACCOUNT: { actions: "assignSourceAccount" },
    ASSIGN_SOURCE_WALLET: { actions: "assignSourceWallet" },
    ASSIGN_STAKE_ID: { actions: "assignStakeId" },
    ASSIGN_RECEIVER_WALLET: { actions: "assignReceiverWallet" },
    ASSIGN_SELECTED_FT: { actions: "assignSelectedFT" },
    ASSIGN_SELECTED_DAPP: { actions: "assignSelectedDapp" },
    ASSIGN_WITHDRAW_BALANCE: { actions: "assignWithdrawBalance" },
    ASSIGN_OPEN_CRYPTOPAY_PARAMS: { actions: "assignOpenCryptopayParams" },
    ASSIGN_SELECTED_TARGET_FT: { actions: "assignSelectedTargetFT" },
    ASSIGN_SELECTED_NFT: { actions: "assignSelectedNFTId" },
    ASSIGN_AMOUNT: { actions: "assignAmount" },
    ASSIGN_VAULTS: { actions: "assignIsVault" },
    HIDE: { target: "#TransferMachine.Hidden" },
    ASSIGN_ERROR: { actions: "assignError" },
    ASSIGN_TOKEN_STANDARD: { actions: "assignTokenStandard" },
  },
  states: {
    Hidden: {
      on: {
        SHOW: { target: "#TransferMachine.TransferModal" },
      },
    },
    TransferModal: {
      always: [
        { target: "SendMachine", guard: "isSendMachine" },
        { target: "ReceiveMachine", guard: "isReceiveMachine" },
        { target: "SwapMachine", guard: "isSwapMachine" },
        { target: "ConvertMachine", guard: "isConvertMachine" },
        { target: "StakeMachine", guard: "isStakeMachine" },
        { target: "RedeemMachine", guard: "isRedeemMachine" },
        { target: "BridgeMachine", guard: "isBridgeMachine" },
        { target: "EarnMachine", guard: "isEarnMachine" },
        { target: "WithdrawMachine", guard: "isWithdrawMachine" },
        { target: "PayMachine", guard: "isPayMachine" },
        { target: "PromoteMachine", guard: "isPromoteMachine" },
      ],
    },
    ReceiveMachine: {},
    SwapMachine: {},
    ConvertMachine: {},
    BridgeMachine: {},
    EarnMachine: {},
    WithdrawMachine: {},
    PayMachine: {},
    PromoteMachine: {},
    StakeMachine: {},
    RedeemMachine: {},
    SendMachine: {
      id: "SendMachine",
      initial: "CheckSendType",
      states: {
        CheckSendType: {
          always: [
            { target: "#SendMachine.SendFT", guard: "isSendFungible" },
            { target: "#SendMachine.SendNFT" },
          ],
        },
        SendFT: {
          on: {
            ON_TRANSFER: {
              target: "#TransferMachine.TransferSuccess",
              actions: "assignTransferObject",
            },
          },
        },
        SendNFT: {
          on: {
            ON_TRANSFER: {
              target: "#TransferMachine.TransferSuccess",
              actions: "assignTransferObject",
            },
          },
        },
      },
    },
    TransferSuccess: {
      on: { HIDE: "Hidden" },
    },
    SwapSuccess: {
      on: { HIDE: "Hidden" },
    },
  },
}

const transferMachineOptions = {
  guards: {
    isSendMachine: ({ context }: { context: TransferMachineContext }) =>
      context.direction === "send",
    isSendFungible: ({ context }: { context: TransferMachineContext }) =>
      context.tokenType === "ft",
    isReceiveMachine: ({ context }: { context: TransferMachineContext }) =>
      context.direction === "receive",
    isSwapMachine: ({ context }: { context: TransferMachineContext }) =>
      context.direction === "swap",
    isConvertMachine: ({ context }: { context: TransferMachineContext }) =>
      context.direction === "convert",
    isBridgeMachine: ({ context }: { context: TransferMachineContext }) =>
      context.direction === "bridge",
    isEarnMachine: ({ context }: { context: TransferMachineContext }) =>
      context.direction === "earn",
    isWithdrawMachine: ({ context }: { context: TransferMachineContext }) =>
      context.direction === "withdraw",
    isPayMachine: ({ context }: { context: TransferMachineContext }) =>
      context.direction === "pay",
    isPromoteMachine: ({ context }: { context: TransferMachineContext }) =>
      context.direction === "promote",
    isStakeMachine: ({ context }: { context: TransferMachineContext }) =>
      context.direction === "stake",
    isRedeemMachine: ({ context }: { context: TransferMachineContext }) =>
      context.direction === "redeem",
  },
  actions: {
    assignTokenType: assign(({ event }: { event: any }) => ({
      tokenType: event?.data,
    })),
    assignDirection: assign(({ event }: { event: any }) => ({
      direction: event?.data,
    })),
    assignAmount: assign(({ event }: { event: any }) => ({
      amount: event?.data,
    })),
    assignSourceAccount: assign(({ event }: { event: any }) => ({
      sourceAccount: event?.data,
    })),
    assignIsEarnUpdate: assign(({ event }: { event: any }) => ({
      isEarnUpdate: event?.data,
    })),
    assignSourceWallet: assign(({ event }: { event: any }) => ({
      sourceWalletAddress: event?.data,
    })),
    assignReceiverWallet: assign(({ event }: { event: any }) => ({
      receiverWallet: event?.data,
    })),
    assignSelectedFT: assign(({ event }: { event: any }) => ({
      selectedFT: event?.data,
    })),
    assignSelectedDapp: assign(({ event }: { event: any }) => ({
      selectedDapp: event?.data,
    })),
    assignWithdrawBalance: assign(({ event }: { event: any }) => ({
      withdrawBalance: event?.data,
    })),
    assignOpenCryptopayParams: assign(({ event }: { event: any }) => ({
      openCryptoPayParams: event?.data,
      openCryptoPayPreselect: event?.preselect,
    })),
    assignSelectedTargetFT: assign(({ event }: { event: any }) => ({
      selectedTargetFT: event?.data,
    })),
    assignSelectedNFTId: assign(({ event }: { event: any }) => ({
      selectedNFTId: event?.data,
    })),
    assignTransferObject: assign(({ event }: { event: any }) => ({
      transferObject: event?.data,
    })),
    assignTokenStandard: assign(({ event }: { event: any }) => ({
      tokenStandard: event?.data,
    })),
    assignStakeId: assign(({ event }: { event: any }) => ({
      stakeId: event?.data,
    })),
    assignIsVault: assign(({ event }: { event: any }) => ({
      isOpenedFromVaults: event?.data,
    })),
    assignError: assign(({ event }: { event: any }) => ({
      error: event.data,
    })),
  },
  actors: {},
}

export const transferMachine = createMachine(
  transferMachineConfig,
  transferMachineOptions,
)

export type TransferMachineActor = ActorRefFrom<typeof transferMachine>
