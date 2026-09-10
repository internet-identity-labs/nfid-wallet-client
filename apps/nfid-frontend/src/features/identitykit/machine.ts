import { assign, createMachine, fromCallback, fromPromise } from "xstate"

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
import {
  prepareCancelResponseEffect,
  prepareFailedResponseEffect,
  sendResponseEffect,
} from "./effects"

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
  type: "parallel" as const,
  states: {
    RPCReceiverV3: {
      invoke: { src: "RPCReceiverV3" },
      on: {
        ON_REQUEST: [
          {
            guard: "isRequestProcessing",
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
              guard: "hasActiveRequest",
            },
          ],
        },

        ValidateRequest: {
          invoke: {
            src: "validateRequest",
            input: ({ context }: { context: IdentityKitRPCMachineContext }) =>
              context,
            onDone: [
              {
                actions: ["assignRequestMetadata"],
                guard: "shouldAuthenticate",
                target: "Authentication",
              },
              {
                actions: ["assignRequestMetadata"],
                guard: "isSilentRequest",
                target: "ExecuteSilentRequest",
              },
              {
                actions: ["assignRequestMetadata"],
                target: "InteractiveRequest",
              },
            ],
            onError: {
              target: "SendResponse",
              actions: ["assignPendingResponse"],
            },
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
                    guard: "isSilentRequest",
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
                input: ({
                  context,
                }: {
                  context: IdentityKitRPCMachineContext
                }) =>
                  ({
                    authRequest: {
                      hostname: context.activeRequest?.origin,
                    },
                    appMeta: {
                      url: context.activeRequest?.origin,
                    },
                  }) as AuthenticationContext,
                onDone: [{ target: "CheckAuthentication" }],
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
                input: ({
                  context,
                }: {
                  context: IdentityKitRPCMachineContext
                }) => context,
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
                input: ({
                  context,
                }: {
                  context: IdentityKitRPCMachineContext
                }) => context,
                onDone: {
                  target: "#IdentityKitRPCMachine.Main.SendResponse",
                  actions: ["assignPendingResponse"],
                },
                onError: {
                  target: "Error",
                  actions: ["assignError"],
                },
              },
            },
            ExecuteInteractiveRequest: {
              invoke: {
                src: "executeInteractiveMethod",
                input: ({
                  context,
                  event,
                }: {
                  context: IdentityKitRPCMachineContext
                  event: any
                }) => ({ context, event }),
                onDone: {
                  target: "#IdentityKitRPCMachine.Main.SendResponse",
                  actions: ["assignPendingResponse"],
                },
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
            input: ({ context }: { context: IdentityKitRPCMachineContext }) =>
              context,
            onDone: {
              target: "SendResponse",
              actions: ["assignPendingResponse"],
            },
            onError: {
              actions: ["assignPendingResponseFromError"],
              target: "#IdentityKitRPCMachine.Main.SendResponse",
            },
          },
        },

        SendResponse: {
          invoke: {
            src: "sendResponse",
            input: ({ context }: { context: IdentityKitRPCMachineContext }) =>
              context,
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
    isSilentRequest: ({
      context,
      event,
    }: {
      context: IdentityKitRPCMachineContext
      event: any
    }) => {
      if (
        typeof event.output === "object" &&
        event.output &&
        "isSilent" in event.output
      )
        return !!event.output.isSilent

      return !!context.activeRequestMetadata?.isSilent
    },
    shouldAuthenticate: ({ event }: { event: any }) => {
      return !!event.output?.requiresAuthentication
    },
    isRequestProcessing: ({
      context,
    }: {
      context: IdentityKitRPCMachineContext
    }) => {
      return !!context.activeRequest
    },
    hasActiveRequest: ({
      context,
    }: {
      context: IdentityKitRPCMachineContext
    }) => !!context.activeRequest,
  },
  actions: {
    assignRequest: assign(
      ({
        context,
        event,
      }: {
        context: IdentityKitRPCMachineContext
        event: any
      }) => ({
        requestsQueue: [...context.requestsQueue, event.data],
      }),
    ),
    assignRequestMetadata: assign(({ event }: { event: any }) => ({
      activeRequestMetadata: event.output,
    })),
    moveQueue: assign(
      ({ context }: { context: IdentityKitRPCMachineContext }) => ({
        requestsQueue:
          context.requestsQueue.length > 1
            ? context.requestsQueue.slice(1, context.requestsQueue.length)
            : [],
        activeRequest:
          context.requestsQueue.length > 0
            ? context.requestsQueue[0]
            : undefined,
        activeRequestMetadata: undefined,
      }),
    ),
    resetActiveRequest: assign(() => ({
      activeRequest: undefined,
      activeRequestMetadata: undefined,
      pendingResponse: undefined,
    })),
    assignComponentData: assign(({ event }: { event: any }) => ({
      componentData: event.output,
    })),
    assignError: assign(({ event }: { event: any }) => ({
      error: event.error,
    })),
    // Store response payload in context before entering SendResponse
    assignPendingResponse: assign(({ event }: { event: any }) => ({
      pendingResponse: event.output,
    })),
    assignPendingResponseFromError: assign(({ event }: { event: any }) => ({
      pendingResponse: event.error,
    })),
    prepareFailedResponse: assign(
      ({ context }: { context: IdentityKitRPCMachineContext }) => {
        if (!context.activeRequest) return {}
        const response: RPCErrorResponse = {
          origin: context.activeRequest.origin,
          jsonrpc: context.activeRequest.data.jsonrpc,
          id: context.activeRequest.data.id,
          error: { code: 1001, message: "Unknown error" },
        }
        return { pendingResponse: response }
      },
    ),
  },
  actors: {
    RPCReceiverV3: fromCallback(({ send }: { send: (event: any) => void }) =>
      RPCReceiverV3()(send as any),
    ),
    executeSilentMethod: fromPromise(
      ({ input }: { input: IdentityKitRPCMachineContext }) =>
        executeSilentMethod(input),
    ),
    validateRequest: fromPromise(
      ({ input }: { input: IdentityKitRPCMachineContext }) =>
        validateRequest(input),
    ),
    getInteractiveMethodData: fromPromise(
      ({ input }: { input: IdentityKitRPCMachineContext }) =>
        getInteractiveMethodData(input),
    ),
    executeInteractiveMethod: fromPromise(
      ({
        input,
      }: {
        input: { context: IdentityKitRPCMachineContext; event: any }
      }) => executeInteractiveMethod(input.context, input.event),
    ),
    checkAuthenticationStatus: fromPromise(() => checkAuthenticationStatus()),
    AuthenticationMachine,
    prepareCancelResponse: fromPromise(
      ({ input }: { input: IdentityKitRPCMachineContext }) =>
        prepareCancelResponseEffect(input),
    ),
    sendResponse: fromPromise(
      async ({
        input,
      }: {
        input: IdentityKitRPCMachineContext & { pendingResponse?: any }
      }) => {
        const payload = input.pendingResponse
        if (payload instanceof NoActionError) return
        await sendResponseEffect(input, { data: payload })
      },
    ),
  },
}

export const IdentityKitRPCMachine = createMachine(
  machineConfig,
  machineServices,
)
