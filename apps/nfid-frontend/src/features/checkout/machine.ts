import { ActorRefFrom, createMachine, assign } from "xstate"

import { PreparedSignatureResponse } from "@nfid/integration"

import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import { RPCMessage, RPCResponse } from "../embed/rpc-service"
import { sendTransactionService } from "../embed/services/send-transaction"
import { decodeRequest, prepareSignature } from "./services"

export type CheckoutMachineContext = {
  authSession: AuthSession
  appMeta?: AuthorizingAppMeta
  rpcMessage?: RPCMessage
  rpcResponse?: RPCResponse
  preparedSignature?: PreparedSignatureResponse
  decodedData?: any
}

type Events =
  | { type: "SHOW_TRANSACTION_DETAILS" }
  | { type: "done.invoke.prepareSignature"; data: PreparedSignatureResponse }
  | { type: "done.invoke.sendTransactionService"; data: RPCResponse }
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
      initial: "DecodeRequest",
      states: {
        DecodeRequest: {
          invoke: {
            src: "decodeRequest",
            id: "decodeRequest",
            onDone: { target: "Preloader", actions: "assignDecodedData" },
          },
        },
        Preloader: {
          invoke: {
            src: "prepareSignature",
            id: "prepareSignature",
            onDone: { target: "Checkout", actions: "assignPreparedSignature" },
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
            onDone: { target: "Success", actions: "assignRpcResponse" },
            onError: "Checkout",
          },
        },
        Success: {
          on: {
            CLOSE: "End",
          },
        },

        End: {
          type: "final",
          data: (context) => context.rpcResponse,
        },
      },
    },
    {
      actions: {
        assignPreparedSignature: assign({
          preparedSignature: (_, event) => event.data,
        }),
        assignRpcResponse: assign({
          rpcResponse: (_, event) => event.data,
        }),
        assignDecodedData: assign({
          decodedData: (_, event) => event.data,
        }),
      },
      guards: {},
      services: {
        prepareSignature,
        sendTransactionService,
        decodeRequest,
      },
    },
  )

export type CheckoutMachineActor = ActorRefFrom<typeof CheckoutMachine>

export default CheckoutMachine
