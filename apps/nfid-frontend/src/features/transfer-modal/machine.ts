import { setup, assign, ActorRefFrom } from "xstate"

import { Events, TransferMachineContext } from "./types"

export const transferMachine = setup({
  types: {} as {
    context: TransferMachineContext
    events: Events
  },
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
    assignTokenType: assign({
      tokenType: ({ event }: { event: any }) => event?.data,
    }),
    assignDirection: assign({
      direction: ({ event }: { event: any }) => event?.data,
    }),
    assignAmount: assign({
      amount: ({ event }: { event: any }) => event?.data,
    }),
    assignSourceAccount: assign({
      sourceAccount: ({ event }: { event: any }) => event?.data,
    }),
    assignIsEarnUpdate: assign({
      isEarnUpdate: ({ event }: { event: any }) => event?.data,
    }),
    assignSourceWallet: assign({
      sourceWalletAddress: ({ event }: { event: any }) => event?.data,
    }),
    assignReceiverWallet: assign({
      receiverWallet: ({ event }: { event: any }) => event?.data,
    }),
    assignSelectedFT: assign({
      selectedFT: ({ event }: { event: any }) => event?.data,
    }),
    assignSelectedDapp: assign({
      selectedDapp: ({ event }: { event: any }) => event?.data,
    }),
    assignWithdrawBalance: assign({
      withdrawBalance: ({ event }: { event: any }) => event?.data,
    }),
    assignOpenCryptopayParams: assign(({ event }: { event: any }) => ({
      openCryptoPayParams: event?.data,
      openCryptoPayPreselect: event?.preselect,
    })),
    assignSelectedTargetFT: assign({
      selectedTargetFT: ({ event }: { event: any }) => event?.data,
    }),
    assignSelectedNFTId: assign({
      selectedNFTId: ({ event }: { event: any }) => event?.data,
    }),
    assignTransferObject: assign({
      transferObject: ({ event }: { event: any }) => event?.data,
    }),
    assignTokenStandard: assign({
      tokenStandard: ({ event }: { event: any }) => event?.data,
    }),
    assignStakeId: assign({
      stakeId: ({ event }: { event: any }) => event?.data,
    }),
    assignIsVault: assign({
      isOpenedFromVaults: ({ event }: { event: any }) => event?.data,
    }),
    assignError: assign({ error: ({ event }: { event: any }) => event?.data }),
  },
}).createMachine({
  id: "TransferMachine",
  context: {} as TransferMachineContext,
  initial: "Hidden",
  on: {
    CHANGE_TOKEN_TYPE: {
      target: "#SendMachine.CheckSendType",
      actions: "assignTokenType",
    },
    CHANGE_DIRECTION: {
      target: "#TransferMachine.TransferModal",
      actions: "assignDirection",
    },
    ASSIGN_IS_EARN_UPDATE: {
      actions: "assignIsEarnUpdate",
    },
    ASSIGN_SOURCE_ACCOUNT: {
      actions: "assignSourceAccount",
    },
    ASSIGN_SOURCE_WALLET: {
      actions: "assignSourceWallet",
    },
    ASSIGN_STAKE_ID: {
      actions: "assignStakeId",
    },
    ASSIGN_RECEIVER_WALLET: {
      actions: "assignReceiverWallet",
    },
    ASSIGN_SELECTED_FT: {
      actions: "assignSelectedFT",
    },
    ASSIGN_SELECTED_DAPP: {
      actions: "assignSelectedDapp",
    },
    ASSIGN_WITHDRAW_BALANCE: {
      actions: "assignWithdrawBalance",
    },
    ASSIGN_OPEN_CRYPTOPAY_PARAMS: {
      actions: "assignOpenCryptopayParams",
    },
    ASSIGN_SELECTED_TARGET_FT: {
      actions: "assignSelectedTargetFT",
    },
    ASSIGN_SELECTED_NFT: {
      actions: "assignSelectedNFTId",
    },
    ASSIGN_AMOUNT: {
      actions: "assignAmount",
    },
    ASSIGN_VAULTS: {
      actions: "assignIsVault",
    },
    HIDE: {
      target: "#TransferMachine.Hidden",
    },
    ASSIGN_ERROR: {
      actions: "assignError",
    },
    ASSIGN_TOKEN_STANDARD: {
      actions: "assignTokenStandard",
    },
  },
  states: {
    Hidden: {
      on: {
        SHOW: {
          target: "#TransferMachine.TransferModal",
        },
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
      on: {
        HIDE: "Hidden",
      },
    },
    SwapSuccess: {
      on: {
        HIDE: "Hidden",
      },
    },
  },
})

export type TransferMachineActor = ActorRefFrom<typeof transferMachine>
