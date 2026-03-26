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

import AuthenticationMachine, {
  AuthenticationContext,
  AuthenticationContext as RootAuthenticationContext,
} from "../root/root-machine"
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

const ThirdPartyAuthMachine = createMachine(
  {
    id: "idp",
    initial: "Start",
    context: {
      isIframe: false,
      appMeta: {} as AuthorizingAppMeta,
    } as ThirdPartyAuthMachineContext,
    states: {
      Start: {
        type: "parallel",
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
                type: "final",
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
                type: "final",
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
          input: ({ context: ctx }) => ({
            appMeta: ctx.appMeta,
            authRequest: ctx.authRequest,
            authSession: ctx.authSession,
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
          input: ({ context: ctx }) => ctx,
        },
        type: "final",
      },
      Error: {
        type: "final",
      },
    },
  },
  {
    actors: {
      handshake: fromPromise(() => handshake()),
      getAppMeta: fromPromise(() => getAppMeta()),
      postDelegation: fromPromise(({ input }) =>
        postDelegation(input as AuthenticationContext),
      ),
      AuthenticationMachine,
    },
    actions: {
      assignAuthRequest: assign(({ event }) => ({
        authRequest: (event as unknown as { output: AuthorizationRequest })
          .output,
      })),
      assignAppMeta: assign(({ event }) => ({
        appMeta: (event as unknown as { output: AuthorizingAppMeta }).output,
      })),
      assignAuthoSession: assign(({ event }) => ({
        thirdPartyAuthSession: (
          event as unknown as { data: ApproveIcGetDelegationSdkResponse }
        ).data,
      })),

      assignAuthSession: assign(({ event }) => ({
        authSession: (event as unknown as { output: RootAuthenticationContext })
          .output.authSession as AuthSession,
      })),

      assignError: assign(({ event }) => ({
        error: (event as unknown as { error: Error }).error,
      })),
    },
    guards: {},
  },
)

export type IDPActor = ActorRefFrom<typeof ThirdPartyAuthMachine>
export type ThirdPartyAuthMachineType = typeof ThirdPartyAuthMachine

export default ThirdPartyAuthMachine
