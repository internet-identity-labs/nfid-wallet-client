import { assign, fromPromise, setup } from "xstate"

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
                    actions: ["debugAuthMachineDone"],
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
    debugAuthMachineDone: ({ event }: any) => {
      try {
        // eslint-disable-next-line no-console
        console.debug("[/rpc] AuthenticationMachine done", {
          type: event?.type,
          hasOutput: event?.output != null,
          outputKeys: event?.output ? Object.keys(event.output) : null,
        })
      } catch (_e) {
        // ignore
      }
    },
    assignRequest: assign(({ context, event }: any) => ({
      requestsQueue: [...context.requestsQueue, event.data],
    })),
    assignRequestMetadata: assign(({ event }: any) => ({
      activeRequestMetadata: event.data,
    })),
    moveQueue: assign(({ context }: any) => ({
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
    assignComponentData: assign(({ event }: any) => ({
      componentData: event.data,
    })),
    assignError: assign(({ event }: any) => ({
      error: event.data,
    })),
    prepareFailedResponse: prepareFailedResponseEffect,
  },
  services: {
    RPCReceiverV3: ((...args: any[]) => (RPCReceiverV3 as any)(...args)) as any,
    AuthenticationMachine,
  },
}

export const IdentityKitRPCMachine = setup({
  types: {} as {
    context: IdentityKitRPCMachineContext
    events: any
  },
  guards: machineServices.guards,
  actions: machineServices.actions,
  actors: {
    RPCReceiverV3: machineServices.services.RPCReceiverV3 as any,
    validateRequest: fromPromise(
      async ({ input }: { input: IdentityKitRPCMachineContext }) =>
        validateRequest(input),
    ),
    executeSilentMethod: fromPromise(
      async ({ input }: { input: IdentityKitRPCMachineContext }) =>
        executeSilentMethod(input),
    ),
    getInteractiveMethodData: fromPromise(
      async ({ input }: { input: IdentityKitRPCMachineContext }) =>
        getInteractiveMethodData(input),
    ),
    executeInteractiveMethod: fromPromise(
      async ({
        input,
      }: {
        input: { context: IdentityKitRPCMachineContext; event: any }
      }) => executeInteractiveMethod(input.context, input.event),
    ),
    checkAuthenticationStatus: fromPromise(async () =>
      checkAuthenticationStatus(),
    ),
    AuthenticationMachine,
    prepareCancelResponse: fromPromise(
      async ({ input }: { input: IdentityKitRPCMachineContext }) =>
        prepareCancelResponseEffect(input),
    ),
    sendResponse: fromPromise(
      async ({ input }: { input: { context: any; event: any } }) => {
        const { context, event } = input
        if (event.output instanceof NoActionError) return
        await sendResponseEffect(context, event)
      },
    ),
  },
} as any).createMachine({
  ...machineConfig,
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
            input: (args: any) => args.context,
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
                id: "AuthenticationMachine",
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
                input: (args: any) => args.context,
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
                input: (args: any) => args.context,
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
                input: (args: any) => ({
                  context: args.context,
                  event: args.event,
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
            input: (args: any) => args.context,
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
            input: (args: any) => ({
              context: args.context,
              event: args.event,
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
} as any)
