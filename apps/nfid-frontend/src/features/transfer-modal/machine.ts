import { ActorRefFrom, assign, createMachine } from "xstate"

import { TokenStandards } from "@nfid/integration/token/types"

import { Wallet } from "frontend/integration/wallet/hooks/use-all-wallets"

import { ITransferSuccess } from "./components/success"
import { ISwapSuccess } from "./components/swap-success"

export type TransferMachineContext = {
  direction: "send" | "receive" | "swap"
  tokenType: "ft" | "nft"
  sourceWalletAddress: string
  sourceAccount?: Wallet
  selectedFT?: string
  selectedNFTId?: string
  receiverWallet: string
  amount: string
  transferObject?: ITransferSuccess
  swapObject?: ISwapSuccess
  error?: Error
  tokenStandard: string
  isOpenedFromVaults: boolean
}

export type Events =
  | { type: "SHOW" }
  | { type: "HIDE" }
  | { type: "CHANGE_TOKEN_TYPE"; data: "ft" | "nft" }
  | { type: "CHANGE_DIRECTION"; data: "send" | "receive" | "swap" }
  | { type: "ASSIGN_SOURCE_ACCOUNT"; data: Wallet }
  | { type: "ASSIGN_SOURCE_WALLET"; data: string }
  | { type: "ASSIGN_AMOUNT"; data: string }
  | { type: "ASSIGN_RECEIVER_WALLET"; data: string }
  | { type: "ASSIGN_SELECTED_FT"; data: string }
  | { type: "ASSIGN_SELECTED_NFT"; data: string }
  | { type: "ASSIGN_ERROR"; data: string }
  | { type: "ASSIGN_TOKEN_STANDARD"; data: string }
  | { type: "ON_TRANSFER_PROMISE"; data: ITransferSuccess }
  | { type: "ON_SWAP_PROMISE"; data: ISwapSuccess }
  | { type: "ASSIGN_VAULTS"; data: boolean }

type Services = {
  transferFT: {
    data: any
  }
  transferNFT: {
    data: any
  }
}

export const transferMachine = createMachine(
  {
    tsTypes: {} as import("./machine.typegen").Typegen0,
    schema: {
      events: {} as Events,
      context: {} as TransferMachineContext,
      services: {} as Services,
    },
    context: {
      direction: "send",
      tokenType: "ft",
      sourceWalletAddress: "",
      receiverWallet: "",
      amount: "",
      transferObject: undefined,
      tokenStandard: TokenStandards.ICP,
      isOpenedFromVaults: false,
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
        ],
      },
      ReceiveMachine: {},
      SwapMachine: {
        on: {
          ON_SWAP_PROMISE: {
            target: "#TransferMachine.SwapSuccess",
            actions: "assignSwapObject",
          },
        },
      },
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
              ON_TRANSFER_PROMISE: {
                target: "#TransferMachine.Success",
                actions: "assignTransferObject",
              },
            },
          },
          SendNFT: {
            on: {
              ON_TRANSFER_PROMISE: {
                target: "#TransferMachine.Success",
                actions: "assignTransferObject",
              },
            },
          },
        },
      },
      Success: {
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
      assignSwapObject: assign((_, event) => ({
        swapObject: event?.data,
      })),
      assignTokenStandard: assign((_, event) => ({
        tokenStandard: event?.data,
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
