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

const machineConfig = {
  id: "IdentityKitRPCMachine",
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
            guard: "isRequestProcessing",
            actions: ["receiveRequest"],
          },
          {
            actions: ["receiveRequest"],
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
                input: ({
                  context: ctx,
                  event,
                }: {
                  context: IdentityKitRPCMachineContext
                  event: unknown
                }) => ({
                  context: ctx,
                  event,
                }),
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
            input: ({ context }: { context: IdentityKitRPCMachineContext }) =>
              context,
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
            input: ({
              context: ctx,
              event,
            }: {
              context: IdentityKitRPCMachineContext
              event: unknown
            }) => ({ context: ctx, event }),
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
      event: unknown
    }) => {
      const ev = event as unknown as {
        output?: { isSilent?: boolean }
        data?: unknown
      }
      const out = ev.output ?? ev.data
      if (typeof out === "object" && out && "isSilent" in out)
        return !!(out as { isSilent: boolean }).isSilent

      return !!context.activeRequestMetadata?.isSilent
    },
    shouldAuthenticate: ({ event }: { event: unknown }) => {
      const ev = event as unknown as {
        output?: { requiresAuthentication?: boolean }
        data?: { requiresAuthentication?: boolean }
      }
      const out = ev.output ?? ev.data
      return !!out?.requiresAuthentication
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
    receiveRequest: assign(({ context, event }) => {
      const req = (event as unknown as { data: unknown }).data

      // In XState v5, multiple `assign` actions in one transition do not
      // reliably see each other's updates. Make request activation atomic.
      if (context.activeRequest) {
        return {
          requestsQueue: [...context.requestsQueue, req],
        }
      }

      return {
        activeRequest: req,
      }
    }),
    assignRequestMetadata: assign(({ event }) => ({
      activeRequestMetadata:
        (event as { output?: unknown; data?: unknown }).output ??
        (event as { data?: unknown }).data,
    })),
    moveQueue: assign(({ context }) => ({
      requestsQueue:
        context.requestsQueue.length > 1
          ? context.requestsQueue.slice(1, context.requestsQueue.length)
          : [],
      activeRequest:
        context.requestsQueue.length > 0 ? context.requestsQueue[0] : undefined,
      activeRequestMetadata: undefined,
    })),
    resetActiveRequest: assign(() => ({
      activeRequest: undefined,
      activeRequestMetadata: undefined,
    })),
    assignComponentData: assign(({ event }) => ({
      componentData:
        (event as { output?: unknown; data?: unknown }).output ??
        (event as { data?: unknown }).data,
    })),
    assignError: assign(({ event }) => ({
      error:
        (event as { error?: Error; data?: unknown }).error ??
        (event as { data?: unknown }).data,
    })),
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
  actors: {
    RPCReceiverV3: fromCallback(({ sendBack }) => {
      const inner = RPCReceiverV3()
      return inner((event) => sendBack(event))
    }),
    validateRequest: fromPromise(({ input }) =>
      validateRequest(input as IdentityKitRPCMachineContext),
    ),
    executeSilentMethod: fromPromise(({ input }) =>
      executeSilentMethod(input as IdentityKitRPCMachineContext),
    ),
    getInteractiveMethodData: fromPromise(({ input }) =>
      getInteractiveMethodData(input as IdentityKitRPCMachineContext),
    ),
    executeInteractiveMethod: fromPromise(({ input }) => {
      const { context, event } = input as {
        context: IdentityKitRPCMachineContext
        event: { type: string; data?: unknown }
      }
      return executeInteractiveMethod(context, event)
    }),
    checkAuthenticationStatus: fromPromise(() => checkAuthenticationStatus()),
    AuthenticationMachine,
    prepareCancelResponse: fromPromise(async ({ input }) => {
      const context = input as IdentityKitRPCMachineContext
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
    }),
    sendResponse: fromPromise(async ({ input }) => {
      const { context, event } = input as {
        context: IdentityKitRPCMachineContext
        event: { data?: unknown }
      }
      const request = context.activeRequest
      const parent = window.opener || window.parent

      if (!request) return

      if (event.data instanceof NoActionError) {
        return
      }

      if (event.data instanceof Error || event.data instanceof GenericError) {
        parent.postMessage(
          {
            origin: context.activeRequest!.origin,
            jsonrpc: context.activeRequest!.data.jsonrpc,
            id: context.activeRequest!.data.id,
            error: {
              code: 3001,
              message: (event.data as Error)?.message ?? "Unknown error",
            },
          },
          request.origin,
        )
      } else {
        parent.postMessage(event.data, request.origin)
      }
    }),
  },
}

export const IdentityKitRPCMachine = createMachine(
  {
    ...machineConfig,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- XState v5 inference for this machine is overly strict vs. v4-style config
  machineServices as any,
)
