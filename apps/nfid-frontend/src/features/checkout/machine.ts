import { ActorRefFrom, createMachine } from "xstate"

import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import { RPCMessage } from "../embed/rpc-service"
import { sendTransactionService } from "../embed/services/send-transaction"
import { getPurchaseInfo } from "./services"

enum TransactionStatuses {
  "Verifying balance",
  "Securing connection",
  "Approving transaction",
  "Processing withdrawal",
  "Confirming transaction",
}

type CheckoutMachineContext = {
  authSession: AuthSession
  appMeta?: AuthorizingAppMeta
  rpcMessage?: RPCMessage
  transactionStatus?: TransactionStatuses
}

type Events =
  | { type: "SHOW_TRANSACTION_DETAILS" }
  | { type: "VERIFY"; data?: RPCMessage }
  | { type: "CLOSE" }
  | { type: "BACK" }

export const CheckoutMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGEAWYDGBrA9gVwBcBZAQw1QEsA7MAOgAUAnMAGxxIjEYGIIcba1AG44sdGAXp5G5ErDABJKgDMcAbQAMAXUSgADjlgUCFfrpAAPRACYAnNdoBGACwBmZ3dsB2Zxo1eANlcAGhAAT0QAVg1HWlcNDy9bALtnAA5HAOcAX2zQtExcQlJyajoC7HwCbgBlAAkAeQB1AH0AFQAlAEEAORqu5DaFBp6WgBEAUTauhQAZGs0dJBADIxMzZasEZzdaW2cs5K8kx2SQ8MR42zjkjVdMgID7F1dc-PRK4rJKAQqi6oAahMOgoAGIATUW5lWxlMVHMWzSAQ0tB8gQytlskTSXms1lCEQQ2MitDStlckQCpy8GlsGkitjeID+VRKP3KH3+3GQswaNQmUOWMPW8M2iDS-lofmOaVc3hepwJl1ssX8aQlkUcaTs1iZLK+pQEbUYJCosDIIrGYAIJAoLFg3AAQgMANKC-SGWEbUBbZyRLx7aL2exJVyudVKhBPBzU2xItynPEBPWc1nfMq0Gp4DAYOAOnl8gXaaGekUIxCODTapzOGmBeIUyKRuwByKuFJt5yOVx2GK5PIgKg4TjwZb64jpmgltZw8sIAC0j1obdxPZ8ri890ekcrzj2mLjmTO9gyKcKacNdCYrHYnEY069op9iHnWuXG+sa7cm4ezkjPZJdwqwA6waTsNIz0+CdL1occHzLMUiW8WhrE1fxaUPXx8QubYkilDRUPDSJnBPLxIP+NkM2NU1zQwS1rVte14NnRD0lcKVrBiRxrFlNIGWsAId3sWgSMxdUPBVIIkXIi92VoDoSAAWz0ZjvUsRBdi1LxTjbbjNRVbDCU4hwCJ7FVaVAjcyIHcdKIEAEuAoZQwmoKBVKfdSEErZCBP9cNu0iSJP0EnDfGudUgi1TFiO1az3nPA05KzHM83cuc9OuJ4nhxdJrFOLt-zuKV9n8FUSL4ulkxs1NEozCYqAgNLEJVAMvECysAk1HU2v-VCbnJBItQCHFOv7bIgA */
  createMachine(
    {
      tsTypes: {} as import("./machine.typegen").Typegen0,
      schema: {
        events: {} as Events,
        context: {} as CheckoutMachineContext,
      },
      id: "CheckoutMachine",
      initial: "Preloader",
      states: {
        Preloader: {
          invoke: {
            src: "getPurchaseInfo",
            id: "getPurchaseInfo",
            onDone: "Checkout",
          },
        },
        Checkout: {
          on: {
            SHOW_TRANSACTION_DETAILS: "TransactionDetails",
            VERIFY: "Verifying",
            CLOSE: "End",
          },
        },
        TransactionDetails: {
          on: {
            BACK: "Checkout",
          },
        },
        Ramp: {},
        Verifying: {
          invoke: {
            src: "sendTransactionService",
            id: "sendTransactionService",
            onDone: "Success",
          },
        },
        Success: {
          on: {
            CLOSE: "End",
          },
        },

        End: {
          type: "final",
          data: (context, event: { data: CheckoutMachineContext }) =>
            event.data,
        },
      },
    },
    {
      actions: {},
      guards: {},
      services: {
        getPurchaseInfo,
        sendTransactionService,
      },
    },
  )

export type CheckoutMachineActor = ActorRefFrom<typeof CheckoutMachine>

export default CheckoutMachine
