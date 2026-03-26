import { getExpirationDelay } from "packages/integration/src/lib/authentication/get-expiration"
import {
  assign,
  createMachine,
  fromCallback,
  fromPromise,
  stateIn,
} from "xstate"

import { ONE_DAY_IN_MS } from "@nfid/config"
import { Application, authState, Chain } from "@nfid/integration"

import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"
import { debugWarn } from "frontend/utils/nfid-debug"

import { ApproveIcGetDelegationSdkResponse } from "../authentication/3rd-party/choose-account/types"
import AuthenticationMachine, {
  AuthenticationContext,
} from "../authentication/root/root-machine"
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
  RPCReceiverV2,
  RPCResponse,
  RPC_BASE,
} from "./services/rpc-receiver"

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

const rpcReceiverLogic = fromCallback(({ sendBack }) => {
  const inner = RPCReceiverV2()
  return inner((event) => sendBack(event))
})

const sessionExpiryLogic = fromCallback(({ sendBack }) => {
  const { delegationIdentity } = authState.get()
  if (!delegationIdentity) {
    sendBack({ type: "SESSION_EXPIRED" })
    return () => {}
  }

  const expiresIn = getExpirationDelay(delegationIdentity)
  const timeoutIn = expiresIn * 0.8
  const now = Date.now()

  debugWarn("NFIDEmbedMachineV2 delegation expires at", {
    expiresAt: new Date(now + expiresIn),
    timeoutAt: new Date(now + timeoutIn),
  })

  const timeout = setTimeout(
    () => {
      debugWarn("NFIDEmbedMachineV2 delegation expired")
      sendBack({ type: "SESSION_EXPIRED" })
    },
    timeoutIn > ONE_DAY_IN_MS ? ONE_DAY_IN_MS : timeoutIn,
  )

  return () => clearTimeout(timeout)
})

export const NFIDEmbedMachineV2 = createMachine(
  {
    id: "NFIDEmbedMachineV2",
    type: "parallel",
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
              input: ({ context: ctx }) => ctx as AuthenticationContext,
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
              src: "sessionExpiry",
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
              input: ({ context: ctx, event }) => ({
                context: {
                  rpcMessage: ctx.rpcMessage,
                  authSession: ctx.authSession,
                },
                event: event as Events,
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
  },
  {
    actions: {
      assignAppMeta: assign(({ context, event }) => {
        const app = (event as unknown as { output: Application }).output
        return {
          appMeta: {
            logo: app?.logo,
            name: app?.name,
            url: new URL(app?.domain ?? "https://localhost").host,
          },
          authRequest: { ...context.authRequest, hostname: app?.domain },
        }
      }),
      assignProcedure: assign(({ context, event }) => {
        const e = event as ProcedureCallEvent
        return {
          rpcMessage: {
            ...e.data.rpcMessage,
            origin: e.data.origin,
          },
          authRequest: {
            ...context.authRequest,
            sessionPublicKey: e.data.rpcMessage.params[0].sessionPublicKey,
            derivationOrigin: e.data.rpcMessage.params[0].derivationOrigin,
            maxTimeToLive: e.data.rpcMessage.params[0].maxTimeToLive,
            targets: e.data.rpcMessage.params[0].targets,
          },
        }
      }),
      updateProcedure: assign(({ context }) => {
        const { messageQueue } = context
        return {
          rpcMessage: messageQueue[0],
          messageQueue: messageQueue.slice(1, messageQueue.length),
        }
      }),
      assignAuthSession: assign(({ event }) => {
        const out = (
          event as unknown as {
            output: AuthenticationContext | { authSession: AuthSession }
          }
        ).output
        const authSession =
          out && "authSession" in out ? out.authSession : undefined

        debugWarn("[NFIDEmbedMachineV2] assignAuthSession", {
          hasOutput: !!out,
          authSessionPresent: !!authSession,
          // Avoid logging the whole session object; it can be large.
          authSessionKeys: authSession
            ? Object.keys(authSession as Record<string, unknown>)
            : [],
        })

        return {
          authSession: authSession as AuthSession | undefined,
        }
      }),
      queueRequest: assign(({ context, event }) => {
        const e = event as ProcedureCallEvent
        return {
          messageQueue: [...context.messageQueue, e.data.rpcMessage],
        }
      }),
      assignError: assign(({ event }) => ({
        error: (event as unknown as { error: Error }).error,
      })),
      nfid_ready: () => {
        const requesterDomain = window.location.ancestorOrigins
          ? window.location.ancestorOrigins[0]
          : window.document.referrer
        debugWarn("nfid_ready", { origin: requesterDomain })
        window.parent.postMessage({ type: "nfid_ready" }, requesterDomain)
      },
      nfid_authenticated: () => {
        const requesterDomain = window.location.ancestorOrigins
          ? window.location.ancestorOrigins[0]
          : window.document.referrer
        debugWarn("nfid_authenticated", { origin: requesterDomain })
        window.parent.postMessage(
          { type: "nfid_authenticated" },
          requesterDomain,
        )
      },
      nfid_unauthenticated: ({ context }) => {
        const { rpcMessage } = context
        if (!rpcMessage?.origin)
          throw new Error("nfid_unauthenticated: missing requestOrigin")
        debugWarn("nfid_unauthenticated", { origin: rpcMessage.origin })
        window.parent.postMessage(
          { type: "nfid_unauthenticated" },
          rpcMessage.origin,
        )
      },
      sendRPCResponse: ({ event }) => {
        const data = (
          event as unknown as {
            output: RPCResponse & { origin: string }
          }
        ).output
        const { origin, ...rpcMessage } = data as RPCResponse & {
          origin: string
        }
        debugWarn("[NFIDEmbedMachineV2] sendRPCResponse", {
          origin,
          rpcMessageId: (rpcMessage as RPCResponse).id,
          rpcMessageError: (rpcMessage as RPCResponse).error,
          rpcMessageHasResult: !!(rpcMessage as RPCResponse).result,
          rpcMessageKeys: Object.keys(rpcMessage as Record<string, unknown>),
        })
        window.parent.postMessage(rpcMessage, origin)
      },
      sendRPCCancelResponse: ({ context }) => {
        const { rpcMessage } = context
        if (!rpcMessage?.origin)
          throw new Error("nfid_unauthenticated: missing requestOrigin")
        if (!rpcMessage?.id)
          throw new Error("sendRPCCancelResponse: missing rpcMessage.id")

        window.parent.postMessage(
          {
            ...RPC_BASE,
            id: rpcMessage.id,
            error: { code: -1, message: "User canceled request" },
          },
          rpcMessage.origin,
        )
      },
    },
    guards: {
      hasProcedure: ({ context }) => !!context.rpcMessage,
      isReady: stateIn({ HANDLE_PROCEDURE: "READY" }),
      isAutoApprovable: ({ context }) => {
        const isAuthoApprovable = ["ic_renewDelegation"].includes(
          context.rpcMessage?.method ?? "",
        )
        debugWarn("NFIDEmbedMachineV2 isAutoApprovable", {
          isAuthoApprovable,
          method: context.rpcMessage?.method,
        })
        return ["ic_renewDelegation"].includes(context.rpcMessage?.method ?? "")
      },
    },
    actors: {
      CheckApplicationMeta: fromPromise(() => CheckApplicationMeta()),
      CheckAuthState: fromPromise(() => CheckAuthState()),
      AuthenticationMachine,
      RPCReceiver: rpcReceiverLogic,
      sessionExpiry: sessionExpiryLogic,
      ExecuteProcedureService: fromPromise(async ({ input }) => {
        const { context, event } = input as {
          context: { rpcMessage?: RPCMessage; authSession?: AuthSession }
          event: Events | { type?: string }
        }
        const procedureEvent =
          event && "type" in event && event.type
            ? event
            : ({ type: "" } as const)
        return ExecuteProcedureService(context, procedureEvent as never)
      }),
    },
  },
)
