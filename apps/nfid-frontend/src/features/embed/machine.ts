import { getExpirationDelay } from "packages/integration/src/lib/authentication/get-expiration"
import { setup, fromPromise, fromCallback, assign } from "xstate"

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

type Events =
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

const sessionExpiryActor = fromCallback<Events>(({ sendBack }) => {
  const { delegationIdentity } = authState.get()
  if (!delegationIdentity) {
    sendBack({ type: "SESSION_EXPIRED" })
    return () => {}
  }

  const expiresIn = getExpirationDelay(delegationIdentity)
  const timeoutIn = expiresIn * 0.8

  const now = Date.now()
  console.debug("NFIDEmbedMachine delegation expires at", {
    expiresAt: new Date(now + expiresIn),
    timeoutAt: new Date(now + timeoutIn),
  })

  const timeout = setTimeout(
    () => {
      console.debug("NFIDEmbedMachine delegation expired")
      sendBack({ type: "SESSION_EXPIRED" })
    },
    timeoutIn > ONE_DAY_IN_MS ? ONE_DAY_IN_MS : timeoutIn,
  )

  return () => clearTimeout(timeout)
})

export const NFIDEmbedMachine = setup({
  types: {} as {
    context: NFIDEmbedMachineContext
    events: Events
  },
  actors: {
    RPCReceiver: fromCallback<Events>(({ sendBack }) => {
      const cleanup = RPCReceiver()((event) => sendBack(event))
      return cleanup
    }),
    CheckApplicationMeta: fromPromise(
      async (): Promise<Application> => CheckApplicationMeta(),
    ),
    CheckAuthState: fromPromise(
      async (): Promise<{ authSession: AuthSession }> => CheckAuthState(),
    ),
    ExecuteProcedureService: fromPromise(
      async ({
        input,
      }: {
        input: { context: NFIDEmbedMachineContext; event: Events }
      }): Promise<RPCResponse> =>
        executeProcedureServiceImpl(input.context as any, input.event as any),
    ),
    AuthenticationMachine,
    sessionExpiryActor,
  },
  guards: {
    hasProcedure: ({ context }: { context: NFIDEmbedMachineContext }) =>
      !!context.rpcMessage,
    isReady: ({ context }: { context: NFIDEmbedMachineContext }) =>
      !context.rpcMessage,
    isAutoApprovable: ({ context }: { context: NFIDEmbedMachineContext }) => {
      const isAutoApprovable = ["ic_renewDelegation"].includes(
        context.rpcMessage?.method ?? "",
      )
      console.debug("NFIDEmbedMachine", { isAutoApprovable, context })
      return isAutoApprovable
    },
  },
  actions: {
    assignAppMeta: assign(
      ({
        context,
        event,
      }: {
        context: NFIDEmbedMachineContext
        event: any
      }) => ({
        appMeta: {
          logo: event.output?.logo,
          name: event.output?.name,
          url: new URL(event.output?.domain).host,
        },
        authRequest: { ...context.authRequest, hostname: event.output?.domain },
      }),
    ),
    assignProcedure: assign(
      ({
        context,
        event,
      }: {
        context: NFIDEmbedMachineContext
        event: any
      }) => ({
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
      }),
    ),
    updateProcedure: assign(
      ({ context }: { context: NFIDEmbedMachineContext }) => ({
        rpcMessage: context.messageQueue[0],
        messageQueue: context.messageQueue.slice(1),
      }),
    ),
    assignAuthSession: assign(({ event }: { event: any }) => {
      console.debug("assignAuthSession", { event })
      return { authSession: event.output?.authSession }
    }),
    queueRequest: assign(
      ({
        context,
        event,
      }: {
        context: NFIDEmbedMachineContext
        event: any
      }) => ({
        messageQueue: [...context.messageQueue, event.data.rpcMessage],
      }),
    ),
    assignError: assign({
      error: ({ event }: { event: any }) => event.error,
    }),
    nfid_ready: () => nfidReady(),
    nfid_authenticated: () => nfidAuthenticated(),
    nfid_unauthenticated: ({ context }: { context: NFIDEmbedMachineContext }) =>
      nfidUnauthenticated(context),
    sendRPCResponse: ({ event }: any) =>
      sendRPCResponseEffect(null as any, { data: event.output }),
    sendRPCCancelResponse: ({
      context,
    }: {
      context: NFIDEmbedMachineContext
    }) => sendRPCCancelResponseEffect(context),
  },
}).createMachine({
  id: "NFIDEmbedMachine",
  type: "parallel" as const,
  context: {
    messageQueue: [],
    appMeta: {},
    authRequest: {},
  } as NFIDEmbedMachineContext,
  states: {
    RPC_RECEIVER: {
      invoke: {
        src: "RPCReceiver",
      },
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
        RESET: ".CheckAppMeta",
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
            src: "sessionExpiryActor",
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
        RESET: ".READY",
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
            input: ({
              context,
              event,
            }: {
              context: NFIDEmbedMachineContext
              event: Events
            }) => ({
              context,
              event,
            }),
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
})
