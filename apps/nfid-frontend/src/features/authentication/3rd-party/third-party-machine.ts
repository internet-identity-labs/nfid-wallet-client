import { ActorRefFrom, assign, createMachine, fromPromise } from "xstate"

import {
  getAppMeta,
  handshake,
  postDelegation,
} from "frontend/integration/windows/services"
import { AbstractAuthSession, AuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

import AuthenticationMachine from "../root/root-machine"
import { ApproveIcGetDelegationSdkResponse } from "./choose-account/types"

export interface ThirdPartyAuthMachineContext {
  authRequest?: {
    maxTimeToLive: bigint
    sessionPublicKey: Uint8Array
    hostname: string
    derivationOrigin?: string
  }
  authSession?: AbstractAuthSession
  thirdPartyAuthSession?: ApproveIcGetDelegationSdkResponse
  appMeta: AuthorizingAppMeta
  error?: Error
  isIframe: boolean
}

export type ThirdPartyAuthMachineEvents =
  | { type: "RETRY" }
  | { type: "CHOOSE_ACCOUNT"; data: ApproveIcGetDelegationSdkResponse }
  | { type: "RESET" }

const ThirdPartyAuthMachineConfig = {
  id: "idp",
  context: {
    isIframe: false,
    appMeta: {},
  } as ThirdPartyAuthMachineContext,
  initial: "Start",
  states: {
    Start: {
      type: "parallel" as const,
      states: {
        Handshake: {
          initial: "Fetch",
          states: {
            Fetch: {
              invoke: {
                src: "handshake",
                id: "handshake",
                onDone: [
                  {
                    actions: "assignAuthRequest",
                    target: "Done",
                  },
                ],
                onError: {
                  target: "Error",
                  actions: "assignError",
                },
              },
            },
            Error: {
              on: { RETRY: "Fetch" },
            },
            Done: {
              type: "final" as const,
            },
          },
        },
        GetAppMeta: {
          initial: "Fetch",
          states: {
            Fetch: {
              invoke: {
                src: "getAppMeta",
                id: "getAppMeta",
                onDone: [
                  {
                    actions: "assignAppMeta",
                    target: "Done",
                  },
                ],
              },
            },
            Done: {
              type: "final" as const,
            },
          },
        },
      },
      onDone: {
        target: "AuthenticationMachine",
      },
    },
    AuthenticationMachine: {
      invoke: {
        src: "AuthenticationMachine",
        id: "AuthenticationMachine",
        input: ({ context }: { context: ThirdPartyAuthMachineContext }) => ({
          appMeta: context.appMeta,
          authRequest: context.authRequest,
          authSession: context.authSession,
        }),
        onDone: {
          actions: "assignAuthSession",
          target: "Authorization",
        },
      },
    },
    Authorization: {
      on: {
        CHOOSE_ACCOUNT: {
          actions: "assignAuthoSession",
          target: "End",
        },
        RESET: "Start",
      },
    },
    End: {
      invoke: {
        src: "postDelegation",
        id: "postDelegation",
        input: ({ context }: { context: ThirdPartyAuthMachineContext }) =>
          context,
      },
      type: "final" as const,
    },
    Error: {
      type: "final" as const,
    },
  },
}

const ThirdPartyAuthMachineOptions = {
  actors: {
    handshake: fromPromise(() => handshake()),
    getAppMeta: fromPromise(() => getAppMeta()),
    postDelegation: fromPromise(
      ({ input }: { input: ThirdPartyAuthMachineContext }) =>
        postDelegation(input as any),
    ),
    AuthenticationMachine,
  },
  actions: {
    assignAuthRequest: assign(({ event }: { event: any }) => ({
      authRequest: event.output,
    })),
    assignAppMeta: assign(({ event }: { event: any }) => ({
      appMeta: event.output,
    })),
    assignAuthoSession: assign(({ event }: { event: any }) => ({
      thirdPartyAuthSession: event.data,
    })),
    assignAuthSession: assign(({ event }: { event: any }) => ({
      authSession: event.output,
    })),
    assignError: assign(({ event }: { event: any }) => ({
      error: event.error,
    })),
  },
  guards: {},
}

const ThirdPartyAuthMachine = createMachine(
  ThirdPartyAuthMachineConfig,
  ThirdPartyAuthMachineOptions,
)

export type IDPActor = ActorRefFrom<typeof ThirdPartyAuthMachine>
export type ThirdPartyAuthMachineType = typeof ThirdPartyAuthMachine

export default ThirdPartyAuthMachine
