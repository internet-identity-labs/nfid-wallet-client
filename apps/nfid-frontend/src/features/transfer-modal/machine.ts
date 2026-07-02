import { ActorRefFrom, assign, createMachine } from "xstate"

import { Events, Services, TransferMachineContext } from "./types"

const transferMachineConfig = {
  predictableActionArguments: true,
  tsTypes: {} as import("./machine.typegen").Typegen0,
  schema: {
    events: {} as Events,
    context: {} as TransferMachineContext,
    services: {} as Services,
  },
  id: "TransferMachine",
  initial: "Hidden",
  on: {
    CHANGE_TOKEN_TYPE: {
      target: "#SendMachine.CheckSendType",
      actions: "assignTokenType",
    },
    CHANGE_DIRECTION: {
      target: "TransferModal",
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
        {
          target: "SendMachine",
          cond: "isSendMachine",
        },
        {
          target: "ReceiveMachine",
          cond: "isReceiveMachine",
        },
        {
          target: "SwapMachine",
          cond: "isSwapMachine",
        },
        {
          target: "ConvertMachine",
          cond: "isConvertMachine",
        },
        {
          target: "StakeMachine",
          cond: "isStakeMachine",
        },
        {
          target: "RedeemMachine",
          cond: "isRedeemMachine",
        },
        {
          target: "BridgeMachine",
          cond: "isBridgeMachine",
        },
        {
          target: "EarnMachine",
          cond: "isEarnMachine",
        },
        {
          target: "WithdrawMachine",
          cond: "isWithdrawMachine",
        },
        {
          target: "PayMachine",
          cond: "isPayMachine",
        },
        {
          target: "PromoteMachine",
          cond: "isPromoteMachine",
        },
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
            {
              target: "#SendMachine.SendFT",
              cond: "isSendFungible",
            },
            {
              target: "#SendMachine.SendNFT",
            },
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
}

const transferMachineOptions: Parameters<
  typeof createMachine<TransferMachineContext, Events, any>
>[1] = {
  guards: {
    isSendMachine: (context: TransferMachineContext) =>
      context.direction === "send",
    isSendFungible: (context: TransferMachineContext) =>
      context.tokenType === "ft",
    isReceiveMachine: (context: TransferMachineContext) =>
      context.direction === "receive",
    isSwapMachine: (context: TransferMachineContext) =>
      context.direction === "swap",
    isConvertMachine: (context: TransferMachineContext) =>
      context.direction === "convert",
    isBridgeMachine: (context: TransferMachineContext) =>
      context.direction === "bridge",
    isEarnMachine: (context: TransferMachineContext) =>
      context.direction === "earn",
    isWithdrawMachine: (context: TransferMachineContext) =>
      context.direction === "withdraw",
    isPayMachine: (context: TransferMachineContext) =>
      context.direction === "pay",
    isPromoteMachine: (context: TransferMachineContext) =>
      context.direction === "promote",
    isStakeMachine: (context: TransferMachineContext) =>
      context.direction === "stake",
    isRedeemMachine: (context: TransferMachineContext) =>
      context.direction === "redeem",
  },
  actions: {
    assignTokenType: assign((_, event: any) => ({
      tokenType: event?.data,
    })),
    assignDirection: assign((_, event: any) => ({
      direction: event?.data,
    })),
    assignAmount: assign((_, event: any) => ({
      amount: event?.data,
    })),
    assignSourceAccount: assign((_, event: any) => ({
      sourceAccount: event?.data,
    })),
    assignIsEarnUpdate: assign((_, event: any) => ({
      isEarnUpdate: event?.data,
    })),
    assignSourceWallet: assign((_, event: any) => ({
      sourceWalletAddress: event?.data,
    })),
    assignReceiverWallet: assign((_, event: any) => ({
      receiverWallet: event?.data,
    })),
    assignSelectedFT: assign((_, event: any) => ({
      selectedFT: event?.data,
    })),
    assignSelectedDapp: assign((_, event: any) => ({
      selectedDapp: event?.data,
    })),
    assignWithdrawBalance: assign((_, event: any) => ({
      withdrawBalance: event?.data,
    })),
    assignOpenCryptopayParams: assign((_, event: any) => ({
      openCryptoPayParams: event?.data,
      openCryptoPayPreselect: event?.preselect,
    })),
    assignSelectedTargetFT: assign((_, event: any) => ({
      selectedTargetFT: event?.data,
    })),
    assignSelectedNFTId: assign((_, event: any) => ({
      selectedNFTId: event?.data,
    })),
    assignTransferObject: assign((_, event: any) => ({
      transferObject: event?.data,
    })),
    assignTokenStandard: assign((_, event: any) => ({
      tokenStandard: event?.data,
    })),
    assignStakeId: assign((_, event: any) => ({
      stakeId: event?.data,
    })),
    assignIsVault: assign((_, event: any) => ({
      isOpenedFromVaults: event?.data,
    })),
    assignError: assign({
      // @ts-ignore
      error: (_: TransferMachineContext, event: { data: unknown }) =>
        event.data,
    }),
  },
  services: {},
}

export const transferMachine = createMachine(
  transferMachineConfig,
  transferMachineOptions,
)

export type TransferMachineActor = ActorRefFrom<typeof transferMachine>
