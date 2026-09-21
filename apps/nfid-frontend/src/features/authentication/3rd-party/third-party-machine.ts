import { setup, fromPromise, assign, ActorRefFrom } from "xstate"

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

const ThirdPartyAuthMachine = setup({
  types: {} as {
    context: ThirdPartyAuthMachineContext
    events: ThirdPartyAuthMachineEvents
  },
  actors: {
    handshake: fromPromise(
      async (): Promise<AuthorizationRequest> => handshake(),
    ),
    getAppMeta: fromPromise(
      async (): Promise<AuthorizingAppMeta> => getAppMeta(),
    ),
    postDelegation: fromPromise(
      async ({
        input,
      }: {
        input: ThirdPartyAuthMachineContext
      }): Promise<void> => postDelegation(input as any),
    ),
    AuthenticationMachine,
  },
  actions: {
    assignAuthRequest: assign({
      authRequest: ({ event }: { event: any }) => event.output,
    }),
    assignAppMeta: assign({
      appMeta: ({ event }: { event: any }) => event.output,
    }),
    assignAuthoSession: assign({
      thirdPartyAuthSession: ({ event }: { event: any }) => event.data,
    }),
    assignAuthSession: assign({
      authSession: ({ event }: { event: any }) =>
        event.output?.authSession as AbstractAuthSession,
    }),
    assignError: assign({
      error: ({ event }: { event: any }) => event.error,
    }),
  },
}).createMachine({
  id: "idp",
  context: {
    appMeta: {},
    isIframe: false,
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
        input: ({ context }) => context,
      },
      type: "final" as const,
    },
    Error: {
      type: "final" as const,
    },
  },
})

export type IDPActor = ActorRefFrom<typeof ThirdPartyAuthMachine>
export type ThirdPartyAuthMachineType = typeof ThirdPartyAuthMachine

export default ThirdPartyAuthMachine
