import { ActorRefFrom, assign, setup } from "xstate"

import type { Events, Services, TransferMachineContext } from "./types"

type TransferMachineTypes = {
  context: TransferMachineContext
  events: Events
  services: Services
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
    isStakeMachine: ({ context }: { context: TransferMachineContext }) =>
      context.direction === "stake",
    isRedeemMachine: ({ context }: { context: TransferMachineContext }) =>
      context.direction === "redeem",
  },
  actions: {
    assignTokenType: assign<
      TransferMachineContext,
      Events,
      undefined,
      Events,
      never
    >(({ event }) =>
      event.type === "CHANGE_TOKEN_TYPE" ? { tokenType: event.data } : {},
    ),
    assignDirection: assign<
      TransferMachineContext,
      Events,
      undefined,
      Events,
      never
    >(({ event }) =>
      event.type === "CHANGE_DIRECTION" ? { direction: event.data } : {},
    ),
    assignAmount: assign<
      TransferMachineContext,
      Events,
      undefined,
      Events,
      never
    >(({ event }) =>
      event.type === "ASSIGN_AMOUNT" ? { amount: event.data } : {},
    ),
    assignSourceAccount: assign<
      TransferMachineContext,
      Events,
      undefined,
      Events,
      never
    >(({ event }) =>
      event.type === "ASSIGN_SOURCE_ACCOUNT"
        ? { sourceAccount: event.data }
        : {},
    ),
    assignSourceWallet: assign<
      TransferMachineContext,
      Events,
      undefined,
      Events,
      never
    >(({ event }) =>
      event.type === "ASSIGN_SOURCE_WALLET"
        ? { sourceWalletAddress: event.data }
        : {},
    ),
    assignReceiverWallet: assign<
      TransferMachineContext,
      Events,
      undefined,
      Events,
      never
    >(({ event }) =>
      event.type === "ASSIGN_RECEIVER_WALLET"
        ? { receiverWallet: event.data }
        : {},
    ),
    assignSelectedFT: assign<
      TransferMachineContext,
      Events,
      undefined,
      Events,
      never
    >(({ event }) =>
      event.type === "ASSIGN_SELECTED_FT" ? { selectedFT: event.data } : {},
    ),
    assignSelectedTargetFT: assign<
      TransferMachineContext,
      Events,
      undefined,
      Events,
      never
    >(({ event }) =>
      event.type === "ASSIGN_SELECTED_TARGET_FT"
        ? { selectedTargetFT: event.data }
        : {},
    ),
    assignSelectedNFTId: assign<
      TransferMachineContext,
      Events,
      undefined,
      Events,
      never
    >(({ event }) =>
      event.type === "ASSIGN_SELECTED_NFT" ? { selectedNFTId: event.data } : {},
    ),
    assignTransferObject: assign<
      TransferMachineContext,
      Events,
      undefined,
      Events,
      never
    >(({ event }) =>
      event.type === "ON_TRANSFER" ? { transferObject: event.data } : {},
    ),
    assignTokenStandard: assign<
      TransferMachineContext,
      Events,
      undefined,
      Events,
      never
    >(({ event }) =>
      event.type === "ASSIGN_TOKEN_STANDARD"
        ? { tokenStandard: event.data }
        : {},
    ),
    assignStakeId: assign<
      TransferMachineContext,
      Events,
      undefined,
      Events,
      never
    >(({ event }) =>
      event.type === "ASSIGN_STAKE_ID" ? { stakeId: event.data } : {},
    ),
    assignIsVault: assign<
      TransferMachineContext,
      Events,
      undefined,
      Events,
      never
    >(({ event }) =>
      event.type === "ASSIGN_VAULTS" ? { isOpenedFromVaults: event.data } : {},
    ),
    assignError: assign<
      TransferMachineContext,
      Events,
      undefined,
      Events,
      never
    >(({ event }) =>
      event.type === "ASSIGN_ERROR" ? { error: new Error(event.data) } : {},
    ),
  },
}

export const transferMachine = setup({
  types: {} as TransferMachineTypes,
  ...transferMachineOptions,
}).createMachine({
  id: "TransferMachine",
  initial: "Hidden",
  context: {
    direction: null,
    tokenType: "ft",
    sourceWalletAddress: "",
    receiverWallet: "",
    amount: "",
    tokenStandard: "",
    isOpenedFromVaults: false,
  } as TransferMachineContext,
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
})

export type TransferMachineActor = ActorRefFrom<typeof transferMachine>
