import { TokenConfig } from "src/ui/connnector/types"
import { ActorRefFrom, assign, createMachine } from "xstate"

import { TokenStandards } from "@nfid/integration/token/types"

import { Wallet } from "frontend/integration/wallet/hooks/use-all-wallets"

import { UserNonFungibleToken } from "../non-fungable-token/types"

export type TransferMachineContext = {
  direction: "send" | "receive"
  tokenType: "ft" | "nft"
  sourceWalletAddress: string
  sourceAccount?: Wallet
  selectedFT?: TokenConfig
  selectedNFT?: UserNonFungibleToken
  receiverWallet: string
  amount: string
  successMessage: string
  error?: Error
  tokenStandard: string
  tokenCurrency: string
}

export type ErrorEvents =
  | {
      type: "error.platform.transferFT"
      data: Error
    }
  | {
      type: "error.platform.transferNFT"
      data: Error
    }

export type Events =
  | { type: "SHOW" }
  | { type: "HIDE" }
  | { type: "CHANGE_TOKEN_TYPE"; data: "ft" | "nft" }
  | { type: "CHANGE_DIRECTION"; data: "send" | "receive" }
  | { type: "ASSIGN_SOURCE_ACCOUNT"; data: Wallet }
  | { type: "ASSIGN_SOURCE_WALLET"; data: string }
  | { type: "ASSIGN_AMOUNT"; data: string }
  | { type: "ASSIGN_RECEIVER_WALLET"; data: string }
  | { type: "ASSIGN_SELECTED_FT"; data: TokenConfig }
  | { type: "ASSIGN_SELECTED_NFT"; data: UserNonFungibleToken }
  | { type: "ASSIGN_ERROR"; data: string }
  | { type: "ASSIGN_TOKEN_STANDARD"; data: string }
  | { type: "ON_SUCCESS"; data: string }

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
      successMessage: "",
      tokenStandard: TokenStandards.ICP,
      tokenCurrency: TokenStandards.ICP,
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
        actions: "assignSelectedNFT",
      },
      ASSIGN_AMOUNT: {
        actions: "assignAmount",
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
          },
        ],
      },

      ReceiveMachine: {},
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
              ON_SUCCESS: {
                target: "#TransferMachine.Success",
                actions: "assignSuccessMessage",
              },
            },
          },
          SendNFT: {
            on: {
              ON_SUCCESS: {
                target: "#TransferMachine.Success",
                actions: "assignSuccessMessage",
              },
            },
          },
        },
      },

      Success: {
        after: {
          5000: "Hidden",
        },
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
      assignSelectedNFT: assign((_, event) => ({
        selectedNFT: event?.data,
      })),
      assignSuccessMessage: assign((_, event) => ({
        successMessage: event?.data,
      })),
      assignTokenStandard: assign((_, event) => ({
        tokenStandard: event?.data,
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
