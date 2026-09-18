import { setup, fromPromise, fromCallback, assign } from "xstate"

import AuthenticationMachine from "../authentication/root/root-machine"
import { RPCReceiverV3 } from "./helpers/rpc-receiver"
import { checkAuthenticationStatus } from "./service/authentication.service"
import { NoActionError } from "./service/exception-handler.service"
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

type Events =
  | { type: "ON_REQUEST"; data: any }
  | { type: "ON_CANCEL" }
  | { type: "ON_APPROVE" }
  | { type: "ON_BACK" }
  | { type: "TRY_AGAIN" }

export const IdentityKitRPCMachine = setup({
  types: {} as {
    context: IdentityKitRPCMachineContext
    events: Events
  },
  actors: {
    RPCReceiverV3: fromCallback<Events>(({ sendBack }) => {
      const cleanup = RPCReceiverV3()((event) => sendBack(event))
      return cleanup
    }),
    executeSilentMethod: fromPromise(
      async ({ input }: { input: IdentityKitRPCMachineContext }) =>
        executeSilentMethod(input as any),
    ),
    validateRequest: fromPromise(
      async ({ input }: { input: IdentityKitRPCMachineContext }) =>
        validateRequest(input as any),
    ),
    getInteractiveMethodData: fromPromise(
      async ({ input }: { input: IdentityKitRPCMachineContext }) =>
        getInteractiveMethodData(input as any),
    ),
    executeInteractiveMethod: fromPromise(
      async ({
        input,
      }: {
        input: { context: IdentityKitRPCMachineContext; event: any }
      }) => executeInteractiveMethod(input.context as any, input.event),
    ),
    checkAuthenticationStatus: fromPromise(async () =>
      checkAuthenticationStatus(),
    ),
    AuthenticationMachine,
    prepareCancelResponse: fromPromise(
      async ({ input }: { input: IdentityKitRPCMachineContext }) =>
        prepareCancelResponseEffect(input as any),
    ),
    sendResponse: fromPromise(
      async ({
        input,
      }: {
        input: { context: IdentityKitRPCMachineContext; event: any }
      }) => {
        if (input.event?.output instanceof NoActionError) {
          return
        }
        await sendResponseEffect(input.context as any, input.event)
      },
    ),
  },
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
    shouldAuthenticate: ({ event }: { event: any }) =>
      !!event.output?.requiresAuthentication,
    isRequestProcessing: ({
      context,
    }: {
      context: IdentityKitRPCMachineContext
    }) => !!context.activeRequest,
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
    assignRequestMetadata: assign({
      activeRequestMetadata: ({ event }: { event: any }) => event.output,
    }),
    moveQueue: assign(
      ({ context }: { context: IdentityKitRPCMachineContext }) => ({
        requestsQueue:
          context.requestsQueue.length > 1
            ? context.requestsQueue.slice(1)
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
    })),
    assignComponentData: assign({
      componentData: ({ event }: { event: any }) => event.output,
    }),
    assignError: assign({
      error: ({ event }: { event: any }) => event.error,
    }),
    prepareFailedResponse: ({
      context,
    }: {
      context: IdentityKitRPCMachineContext
    }) => prepareFailedResponseEffect(context as any),
  },
}).createMachine({
  id: "IdentityKitRPCMachine",
  type: "parallel" as const,
  context: {
    requestsQueue: [],
    activeRequest: undefined,
    activeRequestMetadata: undefined,
    componentData: {},
    error: undefined,
  } as IdentityKitRPCMachineContext,
  states: {
    RPCReceiverV3: {
      invoke: {
        src: "RPCReceiverV3",
      },
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
            input: ({ context }) => context,
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
                input: ({ context }) => context,
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
                id: "AuthenticationMachine",
                input: ({
                  context,
                }: {
                  context: IdentityKitRPCMachineContext
                }) => ({
                  authRequest: {
                    hostname: context.activeRequest?.origin,
                  },
                  appMeta: {
                    url: context.activeRequest?.origin,
                  },
                }),
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
                input: ({ context }) => context,
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
                input: ({ context }) => context,
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
                input: ({ context, event }) => ({ context, event }),
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
            input: ({ context }) => context,
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
              context,
              event,
            }: {
              context: IdentityKitRPCMachineContext
              event: any
            }) => ({
              context,
              event,
            }),
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
})
