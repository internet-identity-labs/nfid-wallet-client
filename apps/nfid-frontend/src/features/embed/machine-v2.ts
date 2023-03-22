import { assign, createMachine } from "xstate"

import { isDelegationExpired } from "@nfid/integration"
import { FunctionCall } from "@nfid/integration-ethereum"

import { AuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"
import AuthenticationMachine from "frontend/state/machines/authentication/authentication"
import TrustDeviceMachine from "frontend/state/machines/authentication/trust-device"

import { ExecuteProcedureService } from "./services/execute-procedure"
import {
  ProcedureCallEvent,
  RPCMessage,
  RPCReceiverV2 as RPCReceiver,
  RPCResponse,
  RPC_BASE,
} from "./services/rpc-receiver"

type Events =
  | ProcedureCallEvent
  | { type: "SESSION_EXPIRED" }
  | { type: "APPROVE"; data?: { hostname: string; accountId: string } }
  | { type: "CANCEL" }
  | { type: "RETRY" }

type Services = {
  RPCReceiver: {
    data: null
  }
  AuthenticationMachine: {
    data: AuthSession
  }
  ExecuteProcedureService: {
    data: RPCResponse
  }
}

type NFIDEmbedMachineContext = {
  appMeta: AuthorizingAppMeta
  authRequest: {
    hostname: string
  }
  authSession?: AuthSession
  requestOrigin?: string
  rpcMessage?: RPCMessage
  rpcMessageDecoded?: FunctionCall
  error?: any
  messageQueue: Array<RPCMessage>
}

export const NFIDEmbedMachineV2 = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QDkBiBJAIgUQLYCNIBZAQwGMALASwDswA1AJgDoAlABQGEB9V7T7OnrZWAYnasA8gMwBVPt04BBADIqA2gAYAuolAAHAPawqAFyqGaekAA9EAZgAsLRgDZXAdjeuAnIwCs-h72HgA0IACeDgAcrsya9rEesY4+Ho7urgC+WeFoWHiEEKSUtAwsHDx8AkIi4lIy8tiKqhoAjLpIIEYm5pbWdgj2w8z2Pm2Ompnjmv4+-uFRCI7RPqOMIYyrHpo+4045eRg4BMTk1HRMzEqyACoAEsycFGBkANZKAK6mLzTmZCQ+jRRFpOgZjGYLFYuoNGH5mGkfLtovY2sEPB5XItEG1US5NClXG4Mm0EocQPkTkUShdytc7o9nq8Pt9fv9AVCQR1rD1If0YQ4EsxVvZNG1XP5XKlktiEG1-ELGJNXG1GIw2hNieTKYUzqVLiwbg9rqywH8qADTGBRBBLGBmLQAG6GN72nWnYrnMpXI2PL4-M3sq0IJ2GS1Q0GgnkQoEDRDRBXMBWJJzRHZuNqyiYeNb+CZi0XzRjJHza466z36um+5i3ABOn1gpkwYEdFuttroDpoztdzHd1K9BvpxvrjebrfbIZ7YY5lkjOmjvShcblgRY8o8-kcmP8SvsSqzCpY8xR-lW0Wl6TLBQ9NO9hoZJoD5stkFEAGVsB+P+hJMhuGwAANdh0D4TAoy6XlYwFBAiX8BEfEcIJoi2TQMi3LN7H8exmDVUV7HcMUMMcG8qT1WkrnuJRkEwFRmgkaRsDkPg2GwJRMAATRBRcoJjFdYLaNJmAyJE8ycCV0VlS9cMcRIVkcSYcw8eUyIre9h2o2j6O4RjGlYpQAHUlHQW5dIaZimm4JR2EY+hVFEGy7OwSDwWXflQEGaIhOYLd1U0YICWwnxpMcNpmDaaIE3QvMpQlRg1LvIc6S0uiGIsljsGuYzTPMpjMus2ypHslRRGUZABA0Xi3L5aFPMQVIEIVCUnCVHc5icWUfEIkTutcEIJkRPNEsHKsqJotK8v0rLgP4O50vypobTtbtezdcskrGlhUp0vTLNY2bOHmqb9uwadnXDecdFc7p+I82wcQSRxmHcYIfCind0gCrrkgReLUVxfDUJGiiH2YHaFum5hDuOvbMtEMA6zrQw62YfQABtAQAMxR3B+w20bKO2ibdoyppoaAubbkh07ztnIEFzBW73Lqh65TC8Lok0LY0zcJwfBVUKWBUkJZhzeVsI8EHKyJ8GSZpzLodYKQxD4W5WE4m7oIE+q5Q2NZUUIrwDz2NJGFlYJnrC4ZSTGeYFVLXIKQJ0HNPlk7FZEFWypozgdK9yRWC1u7WcGeUpTw1V3GGHZJXNyJHuEwIhMSVYVhCHInZoQwIDgawB1d8ol1q1cAFolSTXZtw2bynASTME4QOFoiTRJPB3LYo4Sp2C5lsHKl4fhBGEVhi5g3XRSTUk9lrrd0QJWUOdGS8MT8XFUhWaWNOrBkx51tmNl6mLMUiiUBZCxvVQrnZYkCbnvPPfwt+Sn0nyZd5-TZC051Z7X7sGFSR9kIn1vufI8mhNCIVmGmfqao8zdyOLeQmYMayf0DN-K0e9-4NS5i9ISzgxhixVA3JYExAijAlNuIkaYcKxGfltEcjwxxNhbG2MgYAsGhxxJFJqiQ-ABACgqNMWZkIIUItud6sw77oXobLVBppXyAkgJw1ckVUijFPsMTwUp5giPIeIqhWwtxt1kWDCGHsmgqNggEeIYxXquHQmmNEujG5xQRIDbqOZiwqkdog8ifc3baQVuTPgHFOJWN1sEWxAttGOJUtEUK4VIor1xKKOS4pTGBMmnDcmRkTJmRyQoJyxVVARLZmFOIhEtgHgSMmdIWJG6XiSVFBUyFxQZD3JklK7tCkzUpkdamFi+BlLDgkDcKoO7vUUkSaSaIXofRzGmYIGw2hdPGkEoZM1laBxGTiLwHgIrt0IkiXcYRGlhQigs1J6FUTZEzkAA */
    id: "NFIDEmbedMachineV2",
    tsTypes: {} as import("./machine-v2.typegen").Typegen0,
    type: "parallel",
    schema: {
      context: {} as NFIDEmbedMachineContext,
      events: {} as Events,
      services: {} as Services,
    },
    context: {
      messageQueue: [],
      appMeta: {
        name: "Rarible SDK Example",
        logo: "https://app.rarible.com/favicon.ico",
        url: "rarible.com",
      },
      authRequest: {
        hostname: "http://localhost:3000",
      } as AuthorizationRequest,
    },
    states: {
      RPC_RECEIVER: {
        invoke: {
          src: "RPCReceiver",
        },
        on: {
          PROCEDURE_CALL: [
            {
              target: "RPC_RECEIVER",
              actions: "assignProcedure",
              cond: "isReady",
            },
            {
              target: "RPC_RECEIVER",
              actions: "queueRequest",
            },
          ],
        },
      },

      AUTH: {
        initial: "CheckAuthentication",
        states: {
          CheckAuthentication: {
            always: [
              {
                target: "Authenticated",
                cond: "isAuthenticated",
              },
              {
                target: "Authenticate",
              },
            ],
          },
          Authenticate: {
            invoke: {
              src: "AuthenticationMachine",
              data: (context) => context,
              onDone: [
                {
                  target: "TrustDevice",
                  actions: "assignAuthSession",
                },
              ],
            },
          },
          TrustDevice: {
            invoke: {
              src: "TrustDeviceMachine",
              onDone: [
                {
                  target: "Authenticated",
                },
              ],
            },
          },
          Authenticated: {
            entry: "nfid_authenticated",
            on: {
              SESSION_EXPIRED: {
                target: "Authenticate",
                actions: "nfid_unauthenticated",
              },
            },
          },
        },
      },

      HANDLE_PROCEDURE: {
        initial: "READY",
        states: {
          READY: {
            always: {
              target: "AWAIT_PROCEDURE_APPROVAL",
              cond: "hasProcedure",
            },
          },

          AWAIT_PROCEDURE_APPROVAL: {
            on: {
              APPROVE: "EXECUTE_PROCEDURE",
              CANCEL: {
                target: "READY",
                actions: ["sendRPCCancelResponse", "updateProcedure"],
              },
            },
          },

          EXECUTE_PROCEDURE: {
            invoke: {
              src: "ExecuteProcedureService",
              onDone: {
                actions: ["sendRPCResponse", "updateProcedure"],
                target: "READY",
              },
              onError: "ERROR",
            },
          },

          ERROR: {
            on: {
              RETRY: "AWAIT_PROCEDURE_APPROVAL",
              // CANCEL_ERROR: "READY",
            },
          },
        },
      },
    },
  },
  {
    actions: {
      assignProcedure: assign((_, event) => ({
        requestOrigin: event.data.origin,
        rpcMessage: event.data.rpcMessage,
        rpcMessageDecoded: event.data.rpcMessageDecoded,
      })),
      updateProcedure: assign(({ messageQueue }, event) => {
        return {
          rpcMessage: messageQueue[0],
          messageQueue: messageQueue.slice(1, messageQueue.length),
        }
      }),
      assignAuthSession: assign((_, event) => {
        console.debug("assignAuthSession", { event })
        return { authSession: event.data }
      }),
      queueRequest: assign((context, event) => ({
        messageQueue: [...context.messageQueue, event.data.rpcMessage],
      })),
      nfid_authenticated: () => {
        console.debug("nfid_authenticated")
        window.parent.postMessage(
          { type: "nfid_authenticated" },
          "http://localhost:3000",
        )
      },
      nfid_unauthenticated: ({ requestOrigin }) => {
        if (!requestOrigin)
          throw new Error("nfid_unauthenticated: missing requestOrigin")

        console.debug("nfid_authenticated")
        window.parent.postMessage(
          { type: "nfid_unauthenticated" },
          requestOrigin,
        )
      },
      sendRPCResponse: ({ requestOrigin }, event) => {
        if (!requestOrigin)
          throw new Error("nfid_unauthenticated: missing requestOrigin")

        console.debug("sendRPCResponse", { event })
        // TODO: make origin dynamic
        window.parent.postMessage(event.data, requestOrigin)
      },
      sendRPCCancelResponse: ({ rpcMessage, requestOrigin }) => {
        if (!requestOrigin)
          throw new Error("nfid_unauthenticated: missing requestOrigin")
        if (!rpcMessage?.id)
          throw new Error("sendRPCCancelResponse: missing rpcMessage.id")

        window.parent.postMessage(
          {
            ...RPC_BASE,
            id: rpcMessage.id,
            // FIXME: find correct error code
            error: { code: -1, message: "NFID: user canceled request" },
          },
          requestOrigin,
        )
      },
    },
    guards: {
      hasProcedure: (context: NFIDEmbedMachineContext) => !!context.rpcMessage,
      isAuthenticated: (context: NFIDEmbedMachineContext) =>
        !isDelegationExpired(context.authSession?.delegationIdentity),
      isReady: (_: NFIDEmbedMachineContext, __: Events, { state }: any) =>
        state.matches("HANDLE_PROCEDURE.READY"),
    },
    services: {
      // @ts-ignore
      ExecuteProcedureService,
      AuthenticationMachine,
      TrustDeviceMachine,
      RPCReceiver,
    },
  },
)
