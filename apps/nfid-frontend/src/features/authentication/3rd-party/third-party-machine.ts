import { ActorRefFrom, assign, fromPromise, setup } from "xstate"

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
  | { type: "done.invoke.handshake"; output: AuthorizationRequest }
  | { type: "error.platform.handshake"; error: Error }
  | { type: "done.invoke.getAppMeta"; output: AuthorizingAppMeta }
  | { type: "error.platform.checkRuntime"; error: Error }
  | { type: "done.invoke.AuthenticationMachine"; output: AuthSession }
  | { type: "done.invoke.postDelegation"; output: void }
  | { type: "RETRY" }
  | { type: "CHOOSE_ACCOUNT"; data: ApproveIcGetDelegationSdkResponse }
  | { type: "RESET" }

const ThirdPartyAuthMachineConfig = {
  /** @xstate-layout N4IgpgJg5mDOIC5QEsIAcB0BlALgQwCccBiCAewDswNZ8drVNdCcBtABgF1FQ0zZkOZJR4gAHogCM7SQGYMs2QDYAHAFYVK9rOkB2ACwAaEAE9EOjLqX6VATmkAmG5JWyHSgL4fjjbPiIYABJ4FBCwABZ4ANbUAGJgOADG4aSUDBQAbmQxGJGhEdFgHNxIIHwCQiKlEgiytiqWurrsag4qSrpqui5qxma1Thitsvr6StqdTbZePuh+LEEhYZE58UkpYAQEZAQYaAA2eDgAZjsAtrlLBTHFouWCwhSiNZL6khhK0qq23eMtKg4+ogHK8hi1JM1XLoHA52FYZiBfMwAsF8itqABRLY7YgAJQxABVcQBNW6le6VJ7VYG2NRDBwjWSdIEIfTsWxg9hcuQuJTjFQIpH+HAYADiCQAgmg0ABZBJ4DBrZKpKgYZCZbLUGA4KWy+Vk3j8B5VUA1BkODD-BmdKEdWyA0yIfkYFRjMaSWEObqjQVzCUAVxw4TAFCEiSOjxleGS6rAKvSWRyeEDwdDyHD9ANZSNlOeiHq+iG+jUY00APYbVsLMktnkLn0uldWh+2grvswAaDO2QAC8I5QozGqPG1Rqkynuz2ilw7jnHnmEHY6y52OpNKM2boWSNdBh9LYDyXrB79CN2xhO+FJ-2KIPwrGR+rE9Rk12CL2ipISoaKvPqQgPTsIY7DZVw+XZCEWQbDk+UkD0uhPX5zwJAh-VoAARMAMnTONyFVJ9NQwHBUIwrCcLvWMswpP9TXzEs9xbNpdHsZR7BZDR3i5NQSzaJRFBLaYEQoMgIDgURGFnX8TXERAAFpZHYJQPnGNQT0kJRzRaFlZO4yxZFUlpTxGBs7HPZEcEk40qVohBZIcDRlPBJx1M03pHVqDk1HBJkVFeWQAQcWx9DM4VFjRQpLNzf87OkBRVPcV1PlaXR9OrL1LW8tRbHZH59IcEKFlRZZCkVBJkkimiZIAitty5DKuRkHR2n5AqUSudEMCxbYCAq6Salkly4o9VR3WS1L3IU+R7O5V5iyZTxvEROZzLC4qcnQtJeusqqNF3FxvXUoLFKC7dRksfcfldOpmuCxahQWcUdWlOV8C2hcYvYRz4reDS3C09zWneEZjysMYvT41qRUe3UXoVJVwje6LBvA76XL+tz+mdRL3U9b1btmJhQuh575QwDaqERmybELVROlpOoxg0+yWT4zjbGsEZAu4lQUshjAAGFg0SKIAElYBF44CDwM4wEpqqPqGhLRq9cb+mbBiDx+JQvNUdxz0vEMwxvCiKfJOc+sQTQlIU2lRl8n6bBZdQXVGT5fpcjp8aWjsJ3fPtKRN2Wzak7aajsDla1dMabAx4EZEsPiGX0L1WjGQSCYwFC0JwTDsMSIOfyshdNDpJpXTeaEtCcWPWQsVdujkVmmjhc8MVCOWantXcuniiDvmsFnVEsH4gvUdmazUVvsR64Oi+i+yGn04bEskMaa70Bp7HYU96lUGsBS8DwgA */
  id: "idp",
  initial: "Start",
  context: { appMeta: {}, isIframe: false } as ThirdPartyAuthMachineContext,
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
        onDone: {
          actions: "assignAuthSession",
          target: "Authorization",
        },
        input: ({ context }: { context: ThirdPartyAuthMachineContext }) => ({
          appMeta: context.appMeta,
          authRequest: context.authRequest,
          authSession: context.authSession,
        }),
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
    handshake: fromPromise(async () => handshake()),
    getAppMeta: fromPromise(async () => getAppMeta()),
    postDelegation: fromPromise(
      async ({ input }: { input: ThirdPartyAuthMachineContext }) =>
        postDelegation(input as any),
    ),
    AuthenticationMachine,
  },
  actions: {
    assignAuthRequest: assign(({ event }: any) => ({
      authRequest: event.output,
    })),
    assignAppMeta: assign(({ event }: any) => ({
      appMeta: event.output,
    })),
    assignAuthoSession: assign({
      thirdPartyAuthSession: (_: ThirdPartyAuthMachineContext, event: any) =>
        event.data,
    }),

    assignAuthSession: assign({
      authSession: (_: ThirdPartyAuthMachineContext, event: any) =>
        event.output,
    }),

    assignError: assign({
      error: (_: ThirdPartyAuthMachineContext, event: any) => event.error,
    }),
  },
  guards: {},
}

const ThirdPartyAuthMachine = setup({
  types: {} as {
    context: ThirdPartyAuthMachineContext
    events: any
  },
  ...ThirdPartyAuthMachineOptions,
} as any).createMachine(ThirdPartyAuthMachineConfig as any)

export type IDPActor = ActorRefFrom<typeof ThirdPartyAuthMachine>
export type ThirdPartyAuthMachineType = typeof ThirdPartyAuthMachine

export default ThirdPartyAuthMachine
