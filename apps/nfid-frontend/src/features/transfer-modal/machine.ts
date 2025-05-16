import { ActorRefFrom, assign, createMachine } from "xstate"

import { Events, Services, TransferMachineContext } from "./types"

export const transferMachine = createMachine(
  {
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
            target: "StakeMachine",
            cond: "isStakeMachine",
          },
          {
            target: "RedeemMachine",
            cond: "isRedeemMachine",
          },
        ],
      },
      ReceiveMachine: {},
      SwapMachine: {},
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
  },
  {
    guards: {
      isSendMachine: (context) => context.direction === "send",
      isSendFungible: (context) => context.tokenType === "ft",
      isReceiveMachine: (context) => context.direction === "receive",
      isSwapMachine: (context) => context.direction === "swap",
      isStakeMachine: (context) => context.direction === "stake",
      isRedeemMachine: (context) => context.direction === "redeem",
    },
    actions: {
      assignTokenType: assign((_, event) => ({
        tokenType: event?.data,
      })),
      assignDirection: assign((_, event) => ({
        direction: event?.data,
      })),
      assignAmount: assign((_, event) => ({
        amount: event?.data,
      })),
      assignSourceAccount: assign((_, event) => ({
        sourceAccount: event?.data,
      })),
      assignSourceWallet: assign((_, event) => ({
        sourceWalletAddress: event?.data,
      })),
      assignReceiverWallet: assign((_, event) => ({
        receiverWallet: event?.data,
      })),
      assignSelectedFT: assign((_, event) => ({
        selectedFT: event?.data,
      })),
      assignSelectedNFTId: assign((_, event) => ({
        selectedNFTId: event?.data,
      })),
      assignTransferObject: assign((_, event) => ({
        transferObject: event?.data,
      })),
      assignTokenStandard: assign((_, event) => ({
        tokenStandard: event?.data,
      })),
      assignStakeId: assign((_, event) => ({
        stakeId: event?.data,
      })),
      assignIsVault: assign((_, event) => ({
        isOpenedFromVaults: event?.data,
      })),
      assignError: assign({
        // @ts-ignore
        error: (_, event) => event.data,
      }),
    },
    services: {},
  },
)

export type TransferMachineActor = ActorRefFrom<typeof transferMachine>
