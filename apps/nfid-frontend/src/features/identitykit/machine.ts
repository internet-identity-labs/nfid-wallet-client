import { assign, fromCallback, fromPromise, setup } from "xstate"

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

type IdentityKitRPCMachineTypes = {
  context: IdentityKitRPCMachineContext
  // Full event typing here is possible but large; keep it permissive while removing @ts-nocheck.
  events: any
  output: unknown
}

const act = <T extends string>(type: T) => ({ type }) as const
const grd = <T extends string>(type: T) => ({ type }) as const

const machineServices = {
  guards: {
    isSilentRequest: ({
      context,
      event,
    }: {
      context: IdentityKitRPCMachineContext
      event: any
    }) => {
      const meta = event?.output ?? event?.data
      if (typeof meta === "object" && meta !== null && "isSilent" in meta)
        return !!(meta as { isSilent: boolean }).isSilent

      return !!context.activeRequestMetadata?.isSilent
    },
    shouldAuthenticate: ({
      event,
    }: {
      context: IdentityKitRPCMachineContext
      event: any
    }) => {
      const meta = event?.output ?? event?.data
      return !!meta?.requiresAuthentication
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
    assignRequest: assign(({ context, event }: any) => ({
      requestsQueue: [...context.requestsQueue, event.data],
    })),
    assignRequestMetadata: assign(({ event }: any) => ({
      activeRequestMetadata: event?.output ?? event?.data,
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
      componentData: event?.output ?? event?.data,
    })),
    assignError: assign(({ event }: any) => ({
      error: event?.error ?? event?.data,
    })),
    prepareFailedResponse: prepareFailedResponseEffect,
  },
}

export const IdentityKitRPCMachine = setup({
  types: {} as IdentityKitRPCMachineTypes,
  guards: machineServices.guards as any,
  actions: machineServices.actions as any,
  actors: {
    RPCReceiverV3: fromCallback(({ sendBack }) => {
      const cleanup = (
        RPCReceiverV3 as unknown as () => (
          send: (evt: unknown) => void,
        ) => unknown
      )()((evt: unknown) => sendBack(evt as any)) as void | (() => void)
      return () => cleanup?.()
    }),
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
        const resolved = event?.output ?? event?.data
        if (resolved instanceof NoActionError) return
        await sendResponseEffect(context, event)
      },
    ),
  },
}).createMachine({
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
        src: "RPCReceiverV3" as const,
      },
      on: {
        ON_REQUEST: [
          {
            guard: grd("isRequestProcessing"),
            actions: [act("assignRequest")],
          },
          {
            actions: [act("assignRequest"), act("moveQueue")],
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
              guard: grd("hasActiveRequest"),
            },
          ],
        },
        ValidateRequest: {
          invoke: {
            src: "validateRequest" as const,
            input: ({ context }: { context: IdentityKitRPCMachineContext }) =>
              context,
            onDone: [
              {
                actions: [act("assignRequestMetadata")],
                guard: grd("shouldAuthenticate"),
                target: "Authentication",
              },
              {
                actions: [act("assignRequestMetadata")],
                guard: grd("isSilentRequest"),
                target: "ExecuteSilentRequest",
              },
              {
                actions: [act("assignRequestMetadata")],
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
                src: "checkAuthenticationStatus" as const,
                onDone: [
                  {
                    target: "#IdentityKitRPCMachine.Main.ExecuteSilentRequest",
                    guard: grd("isSilentRequest"),
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
                src: "AuthenticationMachine" as const,
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
                src: "getInteractiveMethodData" as const,
                input: ({
                  context,
                }: {
                  context: IdentityKitRPCMachineContext
                }) => context,
                onDone: {
                  target: "PromptInteractiveRequest",
                  actions: [act("assignComponentData")],
                },
                onError: {
                  target: "Error",
                  actions: [act("assignError")],
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
                src: "prepareCancelResponse" as const,
                input: ({
                  context,
                }: {
                  context: IdentityKitRPCMachineContext
                }) => context,
                onDone: "#IdentityKitRPCMachine.Main.SendResponse",
                onError: {
                  target: "Error",
                  actions: [act("assignError")],
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
  } as any,
})
