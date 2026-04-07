import type { DoneActorEvent, ErrorActorEvent } from "xstate"
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
  | { type: "RETRY" }
  | { type: "CHOOSE_ACCOUNT"; data: ApproveIcGetDelegationSdkResponse }
  | { type: "RESET" }
  | DoneActorEvent<AuthorizationRequest, "handshake">
  | ErrorActorEvent<unknown, "handshake">
  | DoneActorEvent<AuthorizingAppMeta, "getAppMeta">
  | DoneActorEvent<AuthSession, "AuthenticationMachine">
  | DoneActorEvent<void, "postDelegation">

type ThirdPartyAuthMachineTypes = {
  context: ThirdPartyAuthMachineContext
  events: ThirdPartyAuthMachineEvents
}

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
                src: "handshake" as const,
                id: "handshake",
                onDone: [
                  {
                    actions: { type: "assignAuthRequest" } as const,
                    target: "Done",
                  },
                ],
                onError: {
                  target: "Error",
                  actions: { type: "assignError" } as const,
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
                src: "getAppMeta" as const,
                id: "getAppMeta",
                onDone: [
                  {
                    actions: { type: "assignAppMeta" } as const,
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
        src: "AuthenticationMachine" as const,
        id: "AuthenticationMachine",
        onDone: {
          actions: { type: "assignAuthSession" } as const,
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
          actions: { type: "assignAuthoSession" } as const,
          target: "End",
        },
        RESET: "Start",
      },
    },
    End: {
      invoke: {
        src: "postDelegation" as const,
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
    handshake: fromPromise(async () => handshake()),
    getAppMeta: fromPromise(async () => getAppMeta()),
    postDelegation: fromPromise(
      async ({ input }: { input: ThirdPartyAuthMachineContext }) =>
        postDelegation(input),
    ),
    AuthenticationMachine,
  },
  actions: {
    assignAuthRequest: assign<
      ThirdPartyAuthMachineContext,
      ThirdPartyAuthMachineEvents,
      undefined,
      ThirdPartyAuthMachineEvents,
      any
    >(({ event }) => ({
      authRequest: (event as DoneActorEvent<AuthorizationRequest, "handshake">)
        .output,
    })),
    assignAppMeta: assign<
      ThirdPartyAuthMachineContext,
      ThirdPartyAuthMachineEvents,
      undefined,
      ThirdPartyAuthMachineEvents,
      any
    >(({ event }) => ({
      appMeta: (event as DoneActorEvent<AuthorizingAppMeta, "getAppMeta">)
        .output,
    })),
    assignAuthoSession: assign<
      ThirdPartyAuthMachineContext,
      ThirdPartyAuthMachineEvents,
      undefined,
      ThirdPartyAuthMachineEvents,
      any
    >(({ event }: { event: ThirdPartyAuthMachineEvents }) => ({
      thirdPartyAuthSession: (
        event as Extract<
          ThirdPartyAuthMachineEvents,
          { type: "CHOOSE_ACCOUNT" }
        >
      ).data,
    })),

    assignAuthSession: assign<
      ThirdPartyAuthMachineContext,
      ThirdPartyAuthMachineEvents,
      undefined,
      ThirdPartyAuthMachineEvents,
      any
    >(({ event }: { event: ThirdPartyAuthMachineEvents }) => ({
      authSession: (
        event as DoneActorEvent<AuthSession, "AuthenticationMachine">
      ).output,
    })),

    assignError: assign<
      ThirdPartyAuthMachineContext,
      ThirdPartyAuthMachineEvents,
      undefined,
      ThirdPartyAuthMachineEvents,
      any
    >(({ event }: { event: ThirdPartyAuthMachineEvents }) => ({
      error: (event as ErrorActorEvent<unknown, "handshake">).error as Error,
    })),
  },
  guards: {},
}

const ThirdPartyAuthMachine = setup({
  types: {} as ThirdPartyAuthMachineTypes,
  ...ThirdPartyAuthMachineOptions,
}).createMachine(ThirdPartyAuthMachineConfig)

export type IDPActor = ActorRefFrom<typeof ThirdPartyAuthMachine>
export type ThirdPartyAuthMachineType = typeof ThirdPartyAuthMachine

export default ThirdPartyAuthMachine
