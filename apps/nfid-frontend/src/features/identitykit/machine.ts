import { assign, createMachine } from "xstate"

import AuthenticationMachine, {
  AuthenticationContext,
} from "../authentication/root/root-machine"

import { RPCReceiverV3 } from "./helpers/rpc-receiver"
import { checkAuthenticationStatus } from "./service/authentication.service"
import {
  GenericError,
  NoActionError,
} from "./service/exception-handler.service"
import {
  executeInteractiveMethod,
  executeSilentMethod,
  getInteractiveMethodData,
  validateRequest,
} from "./service/method/method.service"
import { IdentityKitRPCMachineContext, RPCErrorResponse } from "./type"

const machineConfig = {
  id: "IdentityKitRPCMachine",
  initial: "Initializing",
  context: {
    requestsQueue: [],
    activeRequest: undefined,
    activeRequestMetadata: undefined,
    componentData: {},
    error: undefined,
  } as IdentityKitRPCMachineContext,
  type: "parallel" as any,
  states: {
    RPCReceiverV3: {
      invoke: {
        src: "RPCReceiverV3",
      },
      on: {
        ON_REQUEST: [
          {
            cond: "isRequestProcessing",
            actions: ["assignRequest"],
          },
          {
            actions: ["assignRequest", "moveQueue"],
          },
        ],
      },
    },

    Main: {
      initial: "Ready",
      states: {
        Ready: {
          always: [
            {
              target: "ValidateRequest",
              cond: "hasActiveRequest",
            },
          ],
        },

        ValidateRequest: {
          invoke: {
            src: "validateRequest",
            onDone: [
              {
                actions: ["assignRequestMetadata"],
                cond: "shouldAuthenticate",
                target: "Authentication",
              },
              {
                actions: ["assignRequestMetadata"],
                cond: "isSilentRequest",
                target: "ExecuteSilentRequest",
              },
              {
                actions: ["assignRequestMetadata"],
                target: "InteractiveRequest",
              },
            ],
            onError: "SendResponse",
          },
        },

        Authentication: {
          initial: "CheckAuthentication",
          states: {
            CheckAuthentication: {
              invoke: {
                src: "checkAuthenticationStatus",
                onDone: [
                  {
                    target: "#IdentityKitRPCMachine.Main.ExecuteSilentRequest",
                    cond: "isSilentRequest",
                  },
                  {
                    target: "#IdentityKitRPCMachine.Main.InteractiveRequest",
                  },
                ],
                onError: "Authenticate",
              },
            },
            Authenticate: {
              invoke: {
                src: "AuthenticationMachine",
                data: (context: IdentityKitRPCMachineContext) =>
                  ({
                    authRequest: {
                      hostname: context.activeRequest?.origin,
                    },
                    appMeta: {
                      url: context.activeRequest?.origin,
                    },
                  }) as AuthenticationContext,
                onDone: [
                  {
                    target: "CheckAuthentication",
                  },
                ],
              },
            },
          },
        },

        InteractiveRequest: {
          initial: "PrepareComponentData",
          states: {
            PrepareComponentData: {
              invoke: {
                src: "getInteractiveMethodData",
                onDone: {
                  target: "PromptInteractiveRequest",
                  actions: ["assignComponentData"],
                },
                onError: {
                  target: "Error",
                  actions: ["assignError"],
                },
              },
            },
            PromptInteractiveRequest: {
              on: {
                ON_CANCEL: "CancelInteractiveRequest",
                ON_APPROVE: "ExecuteInteractiveRequest",
                ON_BACK: "#IdentityKitRPCMachine.Main.Authentication",
              },
            },
            CancelInteractiveRequest: {
              invoke: {
                src: "prepareCancelResponse",
                onDone: "#IdentityKitRPCMachine.Main.SendResponse",
                onError: {
                  target: "Error",
                  actions: ["assignError"],
                },
              },
            },
            ExecuteInteractiveRequest: {
              invoke: {
                src: "executeInteractiveMethod",
                onDone: "#IdentityKitRPCMachine.Main.SendResponse",
                onError: {
                  target: "Error",
                  actions: ["assignError"],
                },
              },
            },
            Error: {
              on: {
                TRY_AGAIN: {
                  target: "#IdentityKitRPCMachine.Main.Authentication",
                },
                ON_CANCEL: {
                  target: "CancelInteractiveRequest",
                },
              },
            },
          },
        },

        ExecuteSilentRequest: {
          invoke: {
            src: "executeSilentMethod",
            onDone: "SendResponse",
            onError: {
              actions: ["prepareFailedResponse"],
              target: "#IdentityKitRPCMachine.Main.SendResponse",
            },
          },
        },

        SendResponse: {
          invoke: {
            src: "sendResponse",
            onError: {
              target: "Ready",
              actions: ["resetActiveRequest", "moveQueue"],
            },
            onDone: {
              target: "Ready",
              actions: ["resetActiveRequest", "moveQueue"],
            },
          },
        },
      },
    },
  },
}

const machineServices = {
  guards: {
    isSilentRequest: (context: IdentityKitRPCMachineContext, event: any) => {
      if (typeof event.data === "object" && "isSilent" in event.data)
        return !!event.data.isSilent

      return !!context.activeRequestMetadata?.isSilent
    },
    shouldAuthenticate: (
      _context: IdentityKitRPCMachineContext,
      event: any,
    ) => {
      return !!event.data.requiresAuthentication
    },
    isRequestProcessing: (context: IdentityKitRPCMachineContext) => {
      return !!context.activeRequest
    },
    hasActiveRequest: (context: IdentityKitRPCMachineContext) =>
      !!context.activeRequest,
  },
  actions: {
    assignRequest: assign(
      (context: IdentityKitRPCMachineContext, event: any) => ({
        requestsQueue: [...context.requestsQueue, event.data],
      }),
    ),
    assignRequestMetadata: assign(
      (_context: IdentityKitRPCMachineContext, event: any) => ({
        activeRequestMetadata: event.data,
      }),
    ),
    moveQueue: assign((context: IdentityKitRPCMachineContext, _event: any) => ({
      requestsQueue:
        context.requestsQueue.length > 1
          ? context.requestsQueue.slice(1, context.requestsQueue.length)
          : [],
      activeRequest:
        context.requestsQueue.length > 0 ? context.requestsQueue[0] : undefined,
      activeRequestMetadata: undefined,
    })),
    resetActiveRequest: assign(
      (_context: IdentityKitRPCMachineContext, _event: any) => ({
        activeRequest: undefined,
        activeRequestMetadata: undefined,
      }),
    ),
    assignComponentData: assign(
      (_context: IdentityKitRPCMachineContext, event: any) => ({
        componentData: event.data,
      }),
    ),
    assignError: assign(
      (_context: IdentityKitRPCMachineContext, event: any) => {
        return {
          error: event.data,
        }
      },
    ),
    prepareFailedResponse: async (context: IdentityKitRPCMachineContext) => {
      if (!context.activeRequest) throw new Error("No active request")

      const response: RPCErrorResponse = {
        origin: context.activeRequest.origin,
        jsonrpc: context.activeRequest.data.jsonrpc,
        id: context.activeRequest.data.id,
        error: {
          code: 1001,
          message: "Unknown error",
        },
      }

      return response
    },
  },
  services: {
    RPCReceiverV3,
    executeSilentMethod,
    validateRequest,
    getInteractiveMethodData,
    executeInteractiveMethod,
    checkAuthenticationStatus,
    AuthenticationMachine,
    prepareCancelResponse: async (context: IdentityKitRPCMachineContext) => {
      if (!context.activeRequest) throw new Error("No active request")

      const response: RPCErrorResponse = {
        origin: context.activeRequest.origin,
        jsonrpc: context.activeRequest.data.jsonrpc,
        id: context.activeRequest.data.id,
        error: {
          code: 3001,
          message: "Action aborted",
        },
      }

      return response
    },
    sendResponse: async (context: any, event: any) => {
      const request = context.activeRequest
      const parent = window.opener || window.parent

      if (event.data instanceof NoActionError) {
        return
      }

      if (event.data instanceof Error || event.data instanceof GenericError) {
        parent.postMessage(
          {
            origin: context.activeRequest.origin,
            jsonrpc: context.activeRequest.data.jsonrpc,
            id: context.activeRequest.data.id,
            error: {
              code: 3001,
              message: event.data?.message ?? "Unknown error",
            },
          },
          request.origin,
        )
      } else {
        parent.postMessage(event.data, request.origin)
      }
    },
  },
}

export const IdentityKitRPCMachine = createMachine(
  machineConfig,
  machineServices,
)
