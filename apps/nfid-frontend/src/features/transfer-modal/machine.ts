import { ActorRefFrom, assign, createMachine } from "xstate"

import { Events, TransferMachineContext } from "./types"

export const transferMachine = createMachine(
  {
    id: "TransferMachine",
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
          HIDE: "Hidden",
        },
      },
      SwapSuccess: {
        on: {
          HIDE: "Hidden",
        },
      },
    },
  },
  {
    guards: {
      isSendMachine: ({ context }) => context.direction === "send",
      isSendFungible: ({ context }) => context.tokenType === "ft",
      isReceiveMachine: ({ context }) => context.direction === "receive",
      isSwapMachine: ({ context }) => context.direction === "swap",
      isConvertMachine: ({ context }) => context.direction === "convert",
      isStakeMachine: ({ context }) => context.direction === "stake",
      isRedeemMachine: ({ context }) => context.direction === "redeem",
    },
    actions: {
      assignTokenType: assign(({ event }) => ({
        tokenType: (event as Extract<Events, { type: "CHANGE_TOKEN_TYPE" }>)
          .data,
      })),
      assignDirection: assign(({ event }) => ({
        direction: (event as Extract<Events, { type: "CHANGE_DIRECTION" }>)
          .data,
      })),
      assignAmount: assign(({ event }) => ({
        amount: (event as Extract<Events, { type: "ASSIGN_AMOUNT" }>).data,
      })),
      assignSourceAccount: assign(({ event }) => ({
        sourceAccount: (
          event as Extract<Events, { type: "ASSIGN_SOURCE_ACCOUNT" }>
        ).data,
      })),
      assignSourceWallet: assign(({ event }) => ({
        sourceWalletAddress: (
          event as Extract<Events, { type: "ASSIGN_SOURCE_WALLET" }>
        ).data,
      })),
      assignReceiverWallet: assign(({ event }) => ({
        receiverWallet: (
          event as Extract<Events, { type: "ASSIGN_RECEIVER_WALLET" }>
        ).data,
      })),
      assignSelectedFT: assign(({ event }) => ({
        selectedFT: (event as Extract<Events, { type: "ASSIGN_SELECTED_FT" }>)
          .data,
      })),
      assignSelectedTargetFT: assign(({ event }) => ({
        selectedTargetFT: (
          event as Extract<Events, { type: "ASSIGN_SELECTED_TARGET_FT" }>
        ).data,
      })),
      assignSelectedNFTId: assign(({ event }) => ({
        selectedNFTId: (
          event as Extract<Events, { type: "ASSIGN_SELECTED_NFT" }>
        ).data,
      })),
      assignTransferObject: assign(({ event }) => ({
        transferObject: (event as Extract<Events, { type: "ON_TRANSFER" }>)
          .data,
      })),
      assignTokenStandard: assign(({ event }) => ({
        tokenStandard: (
          event as Extract<Events, { type: "ASSIGN_TOKEN_STANDARD" }>
        ).data,
      })),
      assignStakeId: assign(({ event }) => ({
        stakeId: (event as Extract<Events, { type: "ASSIGN_STAKE_ID" }>).data,
      })),
      assignIsVault: assign(({ event }) => ({
        isOpenedFromVaults: (
          event as Extract<Events, { type: "ASSIGN_VAULTS" }>
        ).data,
      })),
      assignError: assign(({ event }) => ({
        error: (event as Extract<Events, { type: "ASSIGN_ERROR" }>)
          .data as unknown as TransferMachineContext["error"],
      })),
    },
    actors: {},
  },
)

export type TransferMachineActor = ActorRefFrom<typeof transferMachine>
