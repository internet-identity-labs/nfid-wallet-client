import { assign, createMachine } from "xstate"

import { ONE_DAY_IN_MS } from "@nfid/config"
import { getExpirationDelay } from "@nfid/integration"
import { Application, authState, Chain } from "@nfid/integration"

import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import { ApproveIcGetDelegationSdkResponse } from "../authentication/3rd-party/choose-account/types"
import AuthenticationMachine from "../authentication/root/root-machine"
import { IRequestTransferResponse } from "../sdk/request-transfer/types"

import { CheckApplicationMeta } from "./services/check-app-meta"
import { CheckAuthState } from "./services/check-auth-state"
import {
  ExecuteProcedureService,
  ApproveSignatureEvent,
} from "./services/execute-procedure"
import {
  ProcedureCallEvent,
  RPCMessage,
  RPCReceiverV2 as RPCReceiver,
  RPCResponse,
  RPC_BASE,
} from "./services/rpc-receiver"

type InvokationErrors = {
  type: "error.platform.NFIDEmbedMachineV2.HANDLE_PROCEDURE.EXECUTE_PROCEDURE:invocation[0]"
  data: Error
}

type Events =
  | InvokationErrors
  | ProcedureCallEvent
  | { type: "SESSION_EXPIRED" }
  | {
      type: "APPROVE"
      data?: ApproveSignatureEvent
    }
  | {
      type: "APPROVE_IC_GET_DELEGATION"
      data: ApproveIcGetDelegationSdkResponse
    }
  | { type: "APPROVE_IC_REQUEST_TRANSFER"; data: IRequestTransferResponse }
  | { type: "CANCEL" }
  | { type: "CANCEL_ERROR" }
  | { type: "RETRY" }
  | { type: "RESET" }

type Services = {
  RPCReceiver: {
    data: null
  }
  CheckAuthState: {
    data: { authSession: AuthSession }
  }
  AuthenticationMachine: {
    data: { authSession: AuthSession }
  }
  ExecuteProcedureService: {
    data: RPCResponse
  }
  CheckApplicationMeta: {
    data: Application
  }
}

type NFIDEmbedMachineContext = {
  appMeta: AuthorizingAppMeta
  authRequest: {
    maxTimeToLive?: bigint
    sessionPublicKey?: Uint8Array
    hostname?: string
    derivationOrigin?: string
    targets?: string[]
    chain?: Chain
  }
  authSession?: AuthSession
  rpcMessage?: RPCMessage
  error?: Error
  messageQueue: Array<RPCMessage>
}

export const NFIDEmbedMachineV2 = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QDkBiBJAIgUQLYCNIBZAQwGMALASwDswA1AJgDoAlABQGEB9V7T7OnrZWAYnasA8gMwBVPt04BBADIqA2gAYAuolAAHAPawqAFyqGaekAA9EAZgAsLRgDZXAdjeuAnIwCs-h72HgA0IACeDgAcrsya9rEesY4+Ho7urgC+WeFoWHiEEKSUtAwsHDx8AkIi4lIy8tiKqhoAjLpIIEYm5pbWdgj2w8z2Pm2Ompnjmv4+-uFRCI7RPqOMIYyrHpo+4045eRg4BMTk1HRMzEqyACoAEsycFGBkANZKAK6mLzTmZCQ+jRRFpOgZjGYLFYuoNGH5mGkfLtovY2sEPB5XItEG1US5NClXG4Mm0EocQPkTkUShdytc7o9nq8Pt9fv9AVCQR1rD1If0YQ4EsxVvZNG1XP5XKlktiEG1-ELGJNXG1GIw2hNieTKYUzqVLiwbg9rqywH8qADTGBRBBLGBmLQAG6GN72nWnYrnMpXI2PL4-M3sq0IJ2GS1Q0GgnkQoEDRDRBXMBWJJzRHZuNqyiYeNb+CZi0XzRjJHza466z36um+5i3ABOn1gpkwYEdFuttroDpoztdzHd1K9BvpxvrjebrfbIZ7YY5lkjOmjvShcblgRY8o8-kcmP8SvsSqzCpY8xR-lW0Wl6TLBQ9NO9hoZJoD5stkFEAGVsB+P+hJMhuGwAANdh0D4TAoy6XlYwFBAiX8BEfEcIJoi2TQMi3LN7H8exmDVUV7HcMUMMcG8qT1WkrnuJRkEwFRmgkaRsDkPg2GwJRMAATRBRcoJjFdYLaNJmAyJE8ycCV0VlS9cMcRIVkcSYcw8eUyIre9h2o2j6O4RjGlYpQAHUlHQW5dIaZimm4JR2EY+hVFEGy7OwSDwWXflQEGaIhOYLd1U0YICWwnxpMcNpmDaaIE3QvMpQlRg1LvIc6S0uiGIsljsGuYzTPMpjMus2ypHslRRGUZABA0Xi3L5aFPMQVIEIVCUnCVHc5icWUfEIkTutcEIJkRPNEsHKsqJotK8v0rLgP4O50vypobTtbtezdcskrGlhUp0vTLNY2bOHmqb9uwadnXDecdFc7p+I82wcQSRxmHcYIfCind0gCrrkgReLUVxfDUJGiiH2YHaFum5hDuOvbMtEMA6zrQw62YfQABtAQAMxR3B+w20bKO2ibdoyppoaAubbkh07ztnIEFzBW73Lqh65TC8Lok0LY0zcJwfBVUKWBUkJZhzeVsI8EHKyJ8GSZpzLodYKQxD4W5WE4m7oIE+q5Q2NZUUIrwDz2NJGFlYJnrC4ZSTGeYFVLXIKQJ0HNPlk7FZEFWypozgdK9yRWC1u7WcGeUpTw1V3GGHZJXNyJHuEwIhMSVYVhCHInZoQwIDgawB1d8ol1q1cAFolSTXZtw2bynASTME4QOFoiTRJPB3LYo4Sp2C5lsHKl4fhBGEVhi5g3XRSTUk9lrrd0QJWUOdGS8MT8XFUhWaWNOrBkx51tmNl6mLMUiiUBZCxvVQrnZYkCbnvPPfwt+Sn0nyZd5-TZC051Z7X7sGFSR9kIn1vufI8mhNCIVmGmfqao8zdyOLeQmYMayf0DN-K0e9-4NS5i9ISzgxhixVA3JYExAijAlNuIkaYcKxGfltEcjwxxNhbG2MgYAsGhxxJFJqiQ-ABACgqNMWZkIIUItud6sw77oXobLVBppXyAkgJw1ckVUijFPsMTwUp5giPIeIqhWwtxt1kWDCGHsmgqNggEeIYxXquHQmmNEujG5xQRIDbqOZiwqkdog8ifc3baQVuTPgHFOJWN1sEWxAttGOJUtEUK4VIor1xKKOS4pTGBMmnDcmRkTJmRyQoJyxVVARLZmFOIhEtgHgSMmdIWJG6XiSVFBUyFxQZD3JklK7tCkzUpkdamFi+BlLDgkDcKoO7vUUkSaSaIXofRzGmYIGw2hdPGkEoZM1laBxGTiLwHgIrt0IkiXcYRGlhQigs1J6FUTZEzkAA */
    id: "NFIDEmbedMachineV2",
    preserveActionOrder: true,
    tsTypes: {} as import("./machine-v2.typegen").Typegen0,
    type: "parallel",
    schema: {
      context: {} as NFIDEmbedMachineContext,
      events: {} as Events,
      services: {} as Services,
    },
    context: {
      messageQueue: [],
      appMeta: {},
      authRequest: {},
    },
    states: {
      RPC_RECEIVER: {
        invoke: {
          src: "RPCReceiver",
        },
        order: 1,
        entry: ["nfid_ready"],
        on: {
          RPC_MESSAGE: [
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
        initial: "CheckAppMeta",
        on: {
          RESET: "AUTH.CheckAppMeta",
        },
        states: {
          CheckAppMeta: {
            invoke: {
              src: "CheckApplicationMeta",
              onDone: {
                target: "CheckAuthentication",
                actions: "assignAppMeta",
              },
            },
          },
          CheckAuthentication: {
            invoke: {
              src: "CheckAuthState",
              onDone: {
                target: "Authenticated",
                actions: ["assignAuthSession", "nfid_authenticated"],
              },
              onError: "Authenticate",
            },
          },
          Authenticate: {
            invoke: {
              src: "AuthenticationMachine",
              data: (context) => context,
              onDone: [
                {
                  target: "Authenticated",
                  actions: "assignAuthSession",
                },
              ],
            },
          },
          Authenticated: {
            entry: "nfid_authenticated",
            invoke: {
              src: () => (send) => {
                const { delegationIdentity } = authState.get()
                if (!delegationIdentity) return send("SESSION_EXPIRED")

                const expiresIn = getExpirationDelay(delegationIdentity)
                const timeoutIn = expiresIn * 0.8

                const now = Date.now()

                console.debug("NFIDEmbedMachineV2 delegation expires at", {
                  expiresAt: new Date(now + expiresIn),
                  timeoutAt: new Date(now + timeoutIn),
                })

                const timeout = setTimeout(
                  () => {
                    console.debug("NFIDEmbedMachineV2 delegation expired")
                    send("SESSION_EXPIRED")
                  },
                  timeoutIn > ONE_DAY_IN_MS ? ONE_DAY_IN_MS : timeoutIn,
                )

                return () => clearTimeout(timeout)
              },
              onError: {
                target: "Authenticate",
                actions: "nfid_unauthenticated",
              },
            },
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
        on: {
          RESET: "HANDLE_PROCEDURE.READY",
        },
        states: {
          READY: {
            always: [
              {
                target: "EXECUTE_PROCEDURE",
                cond: "isAutoApprovable",
              },
              {
                target: "AWAIT_PROCEDURE_APPROVAL",
                cond: "hasProcedure",
              },
            ],
          },

          AWAIT_PROCEDURE_APPROVAL: {
            on: {
              APPROVE: "EXECUTE_PROCEDURE",
              APPROVE_IC_GET_DELEGATION: "EXECUTE_PROCEDURE",
              APPROVE_IC_REQUEST_TRANSFER: "EXECUTE_PROCEDURE",
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
              onError: { target: "ERROR", actions: "assignError" },
            },
          },

          ERROR: {
            on: {
              RETRY: "AWAIT_PROCEDURE_APPROVAL",
              CANCEL_ERROR: {
                target: "READY",
                actions: ["sendRPCCancelResponse", "updateProcedure"],
              },
            },
          },
        },
      },
    },
  },
  {
    actions: {
      assignAppMeta: assign((context, event) => ({
        appMeta: {
          logo: event.data?.logo,
          name: event?.data?.name,
          url: new URL(event?.data?.domain).host,
        },
        authRequest: { ...context.authRequest, hostname: event?.data?.domain },
      })),
      assignProcedure: assign((context, event) => ({
        rpcMessage: {
          ...event.data.rpcMessage,
          origin: event.data.origin,
        },
        authRequest: {
          ...context.authRequest,
          sessionPublicKey: event.data.rpcMessage.params[0].sessionPublicKey,
          derivationOrigin: event.data.rpcMessage.params[0].derivationOrigin,
          maxTimeToLive: event.data.rpcMessage.params[0].maxTimeToLive,
          targets: event.data.rpcMessage.params[0].targets,
        },
      })),
      updateProcedure: assign(({ messageQueue }, _event) => {
        return {
          rpcMessage: messageQueue[0],
          messageQueue: messageQueue.slice(1, messageQueue.length),
        }
      }),
      assignAuthSession: assign((_, event) => {
        console.debug("assignAuthSession", { event })
        return { authSession: event.data.authSession }
      }),
      queueRequest: assign((context, event) => ({
        messageQueue: [...context.messageQueue, event.data.rpcMessage],
      })),
      assignError: assign((_context, event) => ({
        error: event.data,
      })),
      nfid_ready: () => {
        const requesterDomain = window.location.ancestorOrigins
          ? window.location.ancestorOrigins[0]
          : window.document.referrer
        console.debug("nfid_ready", {
          origin: requesterDomain,
        })
        window.parent.postMessage({ type: "nfid_ready" }, requesterDomain)
      },
      nfid_authenticated: () => {
        const requesterDomain = window.location.ancestorOrigins
          ? window.location.ancestorOrigins[0]
          : window.document.referrer
        console.debug("nfid_authenticated", {
          origin: requesterDomain,
        })
        window.parent.postMessage(
          { type: "nfid_authenticated" },
          requesterDomain,
        )
      },
      nfid_unauthenticated: ({ rpcMessage }) => {
        if (!rpcMessage?.origin)
          throw new Error("nfid_unauthenticated: missing requestOrigin")

        console.debug("nfid_authenticated")
        window.parent.postMessage(
          { type: "nfid_unauthenticated" },
          rpcMessage.origin,
        )
      },
      sendRPCResponse: (_, { data }) => {
        const { origin, ...rpcMessage } = data

        console.debug("sendRPCResponse", { rpcMessage })
        window.parent.postMessage(rpcMessage, origin)
      },
      sendRPCCancelResponse: ({ rpcMessage }) => {
        if (!rpcMessage?.origin)
          throw new Error("nfid_unauthenticated: missing requestOrigin")
        if (!rpcMessage?.id)
          throw new Error("sendRPCCancelResponse: missing rpcMessage.id")

        window.parent.postMessage(
          {
            ...RPC_BASE,
            id: rpcMessage.id,
            // FIXME: find correct error code
            error: { code: -1, message: "User canceled request" },
          },
          rpcMessage.origin,
        )
      },
    },
    guards: {
      hasProcedure: (context: NFIDEmbedMachineContext) => !!context.rpcMessage,
      isReady: (_: NFIDEmbedMachineContext, __: Events, { state }: any) =>
        state.matches("HANDLE_PROCEDURE.READY"),
      isAutoApprovable: (context: NFIDEmbedMachineContext) => {
        const isAuthoApprovable = ["ic_renewDelegation"].includes(
          context.rpcMessage?.method ?? "",
        )
        console.debug("NFIDEmbedMachineV2", {
          isAuthoApprovable,
          context,
        })
        return ["ic_renewDelegation"].includes(context.rpcMessage?.method ?? "")
      },
    },
    services: {
      CheckApplicationMeta,
      ExecuteProcedureService,
      AuthenticationMachine,
      RPCReceiver,
      CheckAuthState,
    },
  },
)
