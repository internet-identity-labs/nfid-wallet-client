import { DelegationIdentity } from "@dfinity/identity"
import { getExpirationDelay } from "packages/integration/src/lib/authentication/get-expiration"
import { assign, fromCallback, fromPromise, setup, stateIn } from "xstate"

import { ONE_DAY_IN_MS } from "@nfid/config"
import { Application, authState, Chain } from "@nfid/integration"

import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import { ApproveIcGetDelegationSdkResponse } from "../authentication/3rd-party/choose-account/types"
import AuthenticationMachine from "../authentication/root/root-machine"
import { IRequestTransferResponse } from "../sdk/request-transfer/types"
import { CheckApplicationMeta } from "./services/check-app-meta"
import { CheckAuthState } from "./services/check-auth-state"
import {
  ExecuteProcedureService as executeProcedureServiceImpl,
  ApproveSignatureEvent,
} from "./services/execute-procedure"
import {
  ProcedureCallEvent,
  RPCMessage,
  RPCReceiverV2 as RPCReceiver,
  RPCResponse,
} from "./services/rpc-receiver"
import {
  nfidReady,
  nfidAuthenticated,
  nfidUnauthenticated,
  sendRPCResponseEffect,
  sendRPCCancelResponseEffect,
} from "./effects"

type InvokationErrors = {
  type: "error.platform.NFIDEmbedMachine.HANDLE_PROCEDURE.EXECUTE_PROCEDURE:invocation[0]"
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

export type Services = {
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

export type NFIDEmbedMachineContext = {
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

type NFIDEmbedMachineTypes = {
  context: NFIDEmbedMachineContext
  events: Events
  output: unknown
}

const nfidEmbedMachineConfig = {
  /** @xstate-layout N4IgpgJg5mDOIC5QDkBiBJAIgUQLYCNIBZAQwGMALASwDswA1AJgDoAlABQGEB9V7T7OnrZWAYnasA8gMwBVPt04BBADIqA2gAYAuolAAHAPawqAFyqGaekAA9EAZgAsLRgDZXAdjeuAnIwCs-h72HgA0IACeDgAcrsya9rEesY4+Ho7urgC+WeFoWHiEEKSUtAwsHDx8AkIi4lIy8tiKqhoAjLpIIEYm5pbWdgj2w8z2Pm2Ompnjmv4+-uFRCI7RPqOMIYyrHpo+4045eRg4BMTk1HRMzEqyACoAEsycFGBkANZKAK6mLzTmZCQ+jRRFpOgZjGYLFYuoNGH5mGkfLtovY2sEPB5XItEG1US5NClXG4Mm0EocQPkTkUShdytc7o9nq8Pt9fv9AVCQR1rD1If0YQ4EsxVvZNG1XP5XKlktiEG1-ELGJNXG1GIw2hNieTKYUzqVLiwbg9rqywH8qADTGBRBBLGBmLQAG6GN72nWnYrnMpXI2PL4-M3sq0IJ2GS1Q0GgnkQoEDRDRBXMBWJJzRHZuNqyiYeNb+CZi0XzRjJHza466z36um+5i3ABOn1gpkwYEdFuttroDpoztdzHd1K9BvpxvrjebrfbIZ7YY5lkjOmjvShcblgRY8o8-kcmP8SvsSqzCpY8xR-lW0Wl6TLBQ9NO9hoZJoD5stkFEAGVsB+P+hJMhuGwAANdh0D4TAoy6XlYwFBAiX8BEfEcIJoi2TQMi3LN7H8exmDVUV7HcMUMMcG8qT1WkrnuJRkEwFRmgkaRsDkPg2GwJRMAATRBRcoJjFdYLaNJmAyJE8ycCV0VlS9cMcRIVkcSYcw8eUyIre9h2o2j6O4RjGlYpQAHUlHQW5dIaZimm4JR2EY+hVFEGy7OwSDwWXflQEGaIhOYLd1U0YICWwnxpMcNpmDaaIE3QvMpQlRg1LvIc6S0uiGIsljsGuYzTPMpjMus2ypHslRRGUZABA0Xi3L5aFPMQVIEIVCUnCVHc5icWUfEIkTutcEIJkRPNEsHKsqJotK8v0rLgP4O50vypobTtbtezdcskrGlhUp0vTLNY2bOHmqb9uwadnXDecdFc7p+I82wcQSRxmHcYIfCind0gCrrkgReLUVxfDUJGiiH2YHaFum5hDuOvbMtEMA6zrQw62YfQABtAQAMxR3B+w20bKO2ibdoyppoaAubbkh07ztnIEFzBW73Lqh65TC8Lok0LY0zcJwfBVUKWBUkJZhzeVsI8EHKyJ8GSZpzLodYKQxD4W5WE4m7oIE+q5Q2NZUUIrwDz2NJGFlYJnrC4ZSTGeYFVLXIKQJ0HNPlk7FZEFWypozgdK9yRWC1u7WcGeUpTw1V3GGHZJXNyJHuEwIhMSVYVhCHInZoQwIDgawB1d8ol1q1cAFolSTXZtw2bynASTME4QOFoiTRJPB3LYo4Sp2C5lsHKl4fhBGEVhi5g3XRSTUk9lrrd0QJWUOdGS8MT8XFUhWaWNOrBkx51tmNl6mLMUiiUBZCxvVQrnZYkCbnvPPfwt+Sn0nyZd5-TZC051Z7X7sGFSR9kIn1vufI8mhNCIVmGmfqao8zdyOLeQmYMayf0DN-K0e9-4NS5i9ISzgxhixVA3JYExAijAlNuIkaYcKxGfltEcjwxxNhbG2MgYAsGhxxJFJqiQ-ABACgqNMWZkIIUItud6sw77oXobLVBppXyAkgJw1ckVUijFPsMTwUp5giPIeIqhWwtxt1kWDCGHsmgqNggEeIYxXquHQmmNEujG5xQRIDbqOZiwqkdog8ifc3baQVuTPgHFOJWN1sEWxAttGOJUtEUK4VIor1xKKOS4pTGBMmnDcmRkTJmRyQoJyxVVARLZmFOIhEtgHgSMmdIWJG6XiSVFBUyFxQZD3JklK7tCkzUpkdamFi+BlLDgkDcKoO7vUUkSaSaIXofRzGmYIGw2hdPGkEoZM1laBxGTiLwHgIrt0IkiXcYRGlhQigs1J6FUTZEzkAA */
  id: "NFIDEmbedMachine",
  preserveActionOrder: true,
  type: "parallel" as const,
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
            guard: "isReady",
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
            id: "AuthenticationMachine",
            input: ({ context }: { context: NFIDEmbedMachineContext }) =>
              context,
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
            src: "sessionExpiryWatcher",
            input: ({ context }: { context: NFIDEmbedMachineContext }) =>
              context,
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
              guard: "isAutoApprovable",
            },
            {
              target: "AWAIT_PROCEDURE_APPROVAL",
              guard: "hasProcedure",
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
}

const nfidEmbedMachineOptions = {
  actions: {
    assignAppMeta: assign(({ context, event }: any) => ({
      appMeta: {
        logo: event.data?.logo,
        name: event?.data?.name,
        url: (() => {
          const domain = event?.data?.domain
          try {
            if (!domain) return ""
            const normalized =
              typeof domain === "string" && !domain.includes("://")
                ? `https://${domain}`
                : domain
            return new URL(normalized).host
          } catch (e) {
            return ""
          }
        })(),
      },
      authRequest: { ...context.authRequest, hostname: event?.data?.domain },
    })),
    assignProcedure: assign(({ context, event }: any) => ({
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
    updateProcedure: assign(
      ({ context }: { context: NFIDEmbedMachineContext }) => {
        const messageQueue = context.messageQueue ?? []
        return {
          rpcMessage: messageQueue[0],
          messageQueue: messageQueue.slice(1),
        }
      },
    ),
    assignAuthSession: assign(({ event }: any) => {
      const authSession = event?.output?.authSession ?? event?.output
      return { authSession }
    }),
    queueRequest: assign(({ context, event }: any) => ({
      messageQueue: [...context.messageQueue, event.data.rpcMessage],
    })),
    assignError: assign(({ event }: any) => ({
      error: event.data,
    })),
    nfid_ready: nfidReady,
    nfid_authenticated: nfidAuthenticated,
    nfid_unauthenticated: nfidUnauthenticated,
    sendRPCResponse: sendRPCResponseEffect,
    sendRPCCancelResponse: sendRPCCancelResponseEffect,
  },
  guards: {
    hasProcedure: ({ context }: { context: NFIDEmbedMachineContext }) =>
      !!context.rpcMessage,
    isReady: stateIn({ HANDLE_PROCEDURE: "READY" }),
    isAutoApprovable: ({ context }: { context: NFIDEmbedMachineContext }) => {
      return ["ic_renewDelegation"].includes(context.rpcMessage?.method ?? "")
    },
  },
}

export const NFIDEmbedMachine = setup({
  types: {} as NFIDEmbedMachineTypes,
  actions: nfidEmbedMachineOptions.actions as any,
  guards: nfidEmbedMachineOptions.guards as any,
  actors: {
    AuthenticationMachine,
    RPCReceiver: fromCallback(({ sendBack }) => {
      const cleanup = (
        RPCReceiver as unknown as () => (
          send: (evt: unknown) => void,
        ) => unknown
      )()((evt: unknown) => sendBack(evt as any)) as void | (() => void)
      return () => cleanup?.()
    }),
    CheckAuthState: fromPromise(
      async ({ input }: { input: NFIDEmbedMachineContext }) =>
        (CheckAuthState as any)(input),
    ),
    CheckApplicationMeta: fromPromise(async () =>
      (CheckApplicationMeta as any)(),
    ),
    ExecuteProcedureService: fromPromise(
      async ({ input }: { input: { context: any; event: any } }) =>
        executeProcedureServiceImpl(input.context as any, input.event as any),
    ),
    sessionExpiryWatcher: fromCallback(({ sendBack, input }) => {
      const embedContext = input as NFIDEmbedMachineContext | undefined

      const resolveDelegation = (): DelegationIdentity | undefined =>
        authState.get().delegationIdentity ??
        embedContext?.authSession?.delegationIdentity

      let expiryTimer: ReturnType<typeof setTimeout> | undefined
      let pollInterval: ReturnType<typeof setInterval> | undefined
      let cancelled = false

      const clearExpiryTimer = () => {
        if (expiryTimer !== undefined) {
          clearTimeout(expiryTimer)
          expiryTimer = undefined
        }
      }

      const startExpiryTimer = (delegationIdentity: DelegationIdentity) => {
        const expiresIn = getExpirationDelay(delegationIdentity)
        const timeoutIn = expiresIn * 0.8

        expiryTimer = setTimeout(
          () => {
            sendBack({ type: "SESSION_EXPIRED" })
          },
          timeoutIn > ONE_DAY_IN_MS ? ONE_DAY_IN_MS : timeoutIn,
        )
      }

      const tryStart = () => {
        const d = resolveDelegation()
        if (!d) return false
        startExpiryTimer(d)
        return true
      }

      if (tryStart()) {
        return () => {
          cancelled = true
          clearExpiryTimer()
        }
      }
      queueMicrotask(() => {
        if (cancelled) return
        if (tryStart()) return

        let ticks = 0
        const maxTicks = 40
        pollInterval = setInterval(() => {
          if (cancelled) return
          ticks += 1
          if (tryStart()) {
            if (pollInterval !== undefined) clearInterval(pollInterval)
            pollInterval = undefined
            return
          }
          if (ticks >= maxTicks) {
            if (pollInterval !== undefined) clearInterval(pollInterval)
            pollInterval = undefined
            sendBack({ type: "SESSION_EXPIRED" })
          }
        }, 50)
      })

      return () => {
        cancelled = true
        clearExpiryTimer()
        if (pollInterval !== undefined) clearInterval(pollInterval)
      }
    }),
  },
}).createMachine({
  ...nfidEmbedMachineConfig,
  states: {
    ...nfidEmbedMachineConfig.states,
    AUTH: {
      ...nfidEmbedMachineConfig.states.AUTH,
      states: {
        ...nfidEmbedMachineConfig.states.AUTH.states,
        CheckAppMeta: {
          ...nfidEmbedMachineConfig.states.AUTH.states.CheckAppMeta,
          invoke: {
            src: "CheckApplicationMeta",
            onDone: {
              target: "CheckAuthentication",
              actions: "assignAppMeta",
            },
          },
        },
        CheckAuthentication: {
          ...nfidEmbedMachineConfig.states.AUTH.states.CheckAuthentication,
          invoke: {
            src: "CheckAuthState",
            input: (args: any) => args.context,
            onDone: {
              target: "Authenticated",
              actions: ["assignAuthSession", "nfid_authenticated"],
            },
            onError: "Authenticate",
          },
        },
        Authenticate: {
          ...nfidEmbedMachineConfig.states.AUTH.states.Authenticate,
          invoke: {
            ...nfidEmbedMachineConfig.states.AUTH.states.Authenticate.invoke,
            onDone: [
              {
                target: "Authenticated",
                actions: ["assignAuthSession"],
              },
            ],
          },
        },
      },
    },
    HANDLE_PROCEDURE: {
      ...nfidEmbedMachineConfig.states.HANDLE_PROCEDURE,
      states: {
        ...nfidEmbedMachineConfig.states.HANDLE_PROCEDURE.states,
        EXECUTE_PROCEDURE: {
          ...nfidEmbedMachineConfig.states.HANDLE_PROCEDURE.states
            .EXECUTE_PROCEDURE,
          invoke: {
            src: "ExecuteProcedureService",
            input: (args: any) => ({
              context: args.context,
              event: args.event,
            }),
            onDone: {
              actions: ["sendRPCResponse", "updateProcedure"],
              target: "READY",
            },
            onError: { target: "ERROR", actions: "assignError" },
          },
        },
      },
    },
  },
} as any)
