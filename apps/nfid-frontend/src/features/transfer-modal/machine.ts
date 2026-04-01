import { ActorRefFrom, assign, setup } from "xstate"

import type { Events, Services, TransferMachineContext } from "./types"

type TransferMachineTypes = {
  context: TransferMachineContext
  events: Events
  services: Services
}

const transferMachineOptions = {
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
    isStakeMachine: (context: TransferMachineContext) =>
      context.direction === "stake",
    isRedeemMachine: (context: TransferMachineContext) =>
      context.direction === "redeem",
  },
  actions: {
    assignTokenType: assign(({ event }: any) => ({
      tokenType: event?.data,
    })),
    assignDirection: assign(({ event }: any) => ({
      direction: event?.data,
    })),
    assignAmount: assign(({ event }: any) => ({
      amount: event?.data,
    })),
    assignSourceAccount: assign(({ event }: any) => ({
      sourceAccount: event?.data,
    })),
    assignSourceWallet: assign(({ event }: any) => ({
      sourceWalletAddress: event?.data,
    })),
    assignReceiverWallet: assign(({ event }: any) => ({
      receiverWallet: event?.data,
    })),
    assignSelectedFT: assign(({ event }: any) => ({
      selectedFT: event?.data,
    })),
    assignSelectedTargetFT: assign(({ event }: any) => ({
      selectedTargetFT: event?.data,
    })),
    assignSelectedNFTId: assign(({ event }: any) => ({
      selectedNFTId: event?.data,
    })),
    assignTransferObject: assign(({ event }: any) => ({
      transferObject: event?.data,
    })),
    assignTokenStandard: assign(({ event }: any) => ({
      tokenStandard: event?.data,
    })),
    assignStakeId: assign(({ event }: any) => ({
      stakeId: event?.data,
    })),
    assignIsVault: assign(({ event }: any) => ({
      isOpenedFromVaults: event?.data,
    })),
    assignError: assign({
      // @ts-ignore
      error: (_: TransferMachineContext, event: { data: unknown }) =>
        event.data,
    }),
  },
}

export const transferMachine = setup({
  types: {} as TransferMachineTypes,
  ...transferMachineOptions,
} as any).createMachine({
  id: "TransferMachine",
  initial: "Hidden",
  context: {} as TransferMachineContext,
  on: {
    CHANGE_TOKEN_TYPE: {
      target: "#SendMachine.CheckSendType",
      actions: "assignTokenType",
    },
    CHANGE_DIRECTION: {
      target: ".TransferModal",
      actions: "assignDirection",
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
          guard: "isSendMachine",
        },
        {
          target: "ReceiveMachine",
          guard: "isReceiveMachine",
        },
        {
          target: "SwapMachine",
          guard: "isSwapMachine",
        },
        {
          target: "ConvertMachine",
          guard: "isConvertMachine",
        },
        {
          target: "StakeMachine",
          guard: "isStakeMachine",
        },
        {
          target: "RedeemMachine",
          guard: "isRedeemMachine",
        },
      ],
    },
    ReceiveMachine: {},
    SwapMachine: {},
    ConvertMachine: {},
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
              guard: "isSendFungible",
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
        HIDE: "#TransferMachine.Hidden",
      },
    },
    SwapSuccess: {
      on: {
        HIDE: "#TransferMachine.Hidden",
      },
    },
  },
} as any)

export type TransferMachineActor = ActorRefFrom<typeof transferMachine>
