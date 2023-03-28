import { ActorRefFrom, assign, createMachine } from "xstate"

import { Wallet } from "frontend/integration/wallet/hooks/use-all-wallets"

import { TokenConfig } from "../fungable-token/use-all-token"
import { UserNonFungibleToken } from "../non-fungable-token/types"
import { transferFT } from "./services/transfer-ft"
import { transferNFT } from "./services/transfer-nft"

export type TransferMachineContext = {
  direction: "send" | "receive"
  tokenType: "ft" | "nft"
  sourceWalletAddress?: string
  sourceAccount?: Wallet
  selectedFT?: TokenConfig
  selectedNFT?: UserNonFungibleToken
  receiverWallet: string
  amount: string
  successMessage: string
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
  | { type: "ON_SUBMIT" }

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
    },
    id: "TransferMachine",
    initial: "TransferModal",
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
              ON_SUBMIT: {
                target: "#TransferMachine.TransferFT",
              },
            },
          },
          SendNFT: {
            on: {
              ON_SUBMIT: {
                target: "#TransferMachine.TransferNFT",
              },
            },
          },
        },
      },

      TransferFT: {
        invoke: {
          src: "transferFT",
          onDone: { target: "Success", actions: "assignSuccessMessage" },
        },
      },
      TransferNFT: {
        invoke: {
          src: "transferNFT",
          onDone: { target: "Success", actions: "assignSuccessMessage" },
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
    },
    services: {
      transferFT,
      transferNFT,
    },
  },
)

export type TransferMachineActor = ActorRefFrom<typeof transferMachine>
