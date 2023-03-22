import { DecodeResponse } from "packages/integration-ethereum/src/lib/constant"
import { assign, createMachine } from "xstate"

import { isDelegationExpired } from "@nfid/integration"

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
  rpcMessage?: RPCMessage
  rpcMessageDecoded?: DecodeResponse
  error?: any
  messageQueue: Array<RPCMessage>
}

export const NFIDEmbedMachineV2 = createMachine(
  {
    /** @xstate-layout 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 */
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
              CANCEL: "SEND_RPC_CANCEL_RESPONSE",
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
            },
          },

          SEND_RPC_CANCEL_RESPONSE: {},
        },
      },
    },
  },
  {
    actions: {
      assignProcedure: assign((_, event) => ({
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
      nfid_unauthenticated: () => {
        console.debug("nfid_authenticated")
        window.parent.postMessage(
          { type: "nfid_unauthenticated" },
          "http://localhost:3000",
        )
      },
      sendRPCResponse: (_, event) => {
        console.debug("sendRPCResponse", { event })
        // TODO: make origin dynamic
        window.parent.postMessage(event.data, "http://localhost:3000")
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
