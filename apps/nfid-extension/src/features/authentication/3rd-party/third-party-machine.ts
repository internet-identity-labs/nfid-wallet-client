import { ActorRefFrom, assign, createMachine } from "xstate"

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
  | { type: "done.invoke.handshake"; data: AuthorizationRequest }
  | { type: "error.platform.handshake"; data: Error }
  | { type: "done.invoke.getAppMeta"; data: AuthorizingAppMeta }
  | { type: "error.platform.checkRuntime"; data: Error }
  | { type: "done.invoke.AuthenticationMachine"; data: AuthSession }
  | { type: "done.invoke.postDelegation"; data: void }
  | { type: "RETRY" }
  | { type: "CHOOSE_ACCOUNT"; data: ApproveIcGetDelegationSdkResponse }
  | { type: "RESET" }

interface Schema {
  context: ThirdPartyAuthMachineContext
  events: ThirdPartyAuthMachineEvents
}
const ThirdPartyAuthMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEsIAcB0BlALgQwCccBiCAewDswNZ8drVNdCcBtABgF1FQ0zZkOZJR4gAHogCM7SQGYMs2QDYAHAFYVK9rOkB2ACwAaEAE9EOjLqX6VATmkAmG5JWyHSgL4fjjbPiIYABJ4FBCwABZ4ANbUAGJgOADG4aSUDBQAbmQxGJGhEdFgHNxIIHwCQiKlEgiytiqWurrsag4qSrpqui5qxma1Thitsvr6StqdTbZePuh+LEEhYZE58UkpYAQEZAQYaAA2eDgAZjsAtrlLBTHFouWCwhSiNZL6khhK0qq23eMtKg4+ogHK8hi1JM1XLoHA52FYZiBfMwAsF8itqABRLY7YgAJQxABVcQBNW6le6VJ7VYG2NRDBwjWSdIEIfTsWxg9hcuQuJTjFQIpH+HAYADiCQAgmg0ABZBJ4DBrZKpKgYZCZbLUGA4KWy+Vk3j8B5VUA1BkODD-BmdKEdWyA0yIfkYFRjMaSWEObqjQVzCUAVxw4TAFCEiSOjxleGS6rAKvSWRyeEDwdDyHD9ANZSNlOeiHq+iG+jUY00APYbVsLMktnkLn0uldWh+2grvswAaDO2QAC8I5QozGqPG1Rqkynuz2ilw7jnHnmEHY6y52OpNKM2boWSNdBh9LYDyXrB79CN2xhO+FJ-2KIPwrGR+rE9Rk12CL2ipISoaKvPqQgPTsIY7DZVw+XZCEWQbDk+UkD0uhPX5zwJAh-VoAARMAMnTONyFVJ9NQwHBUIwrCcLvWMswpP9TXzEs9xbNpdHsZR7BZDR3i5NQSzaJRFBLaYEQoMgIDgURGFnX8TXERAAFpZHYJQPnGNQT0kJRzRaFlZO4yxZFUlpTxGBs7HPZEcEk40qVohBZIcDRlPBJx1M03pHVqDk1HBJkVFeWQAQcWx9DM4VFjRQpLNzf87OkBRVPcV1PlaXR9OrL1LW8tRbHZH59IcEKFlRZZCkVBJkkimiZIAitty5DKuRkHR2n5AqUSudEMCxbYCAq6Salkly4o9VR3WS1L3IU+R7O5V5iyZTxvEROZzLC4qcnQtJeusqqNF3FxvXUoLFKC7dRksfcfldOpmuCxahQWcUdWlOV8C2hcYvYRz4reDS3C09zWneEZjysMYvT41qRUe3UXoVJVwje6LBvA76XL+tz+mdRL3U9b1btmJhQuh575QwDaqERmybELVROlpOoxg0+yWT4zjbGsEZAu4lQUshjAAGFg0SKIAElYBF44CDwM4wEpqqPqGhLRq9cb+mbBiDx+JQvNUdxz0vEMwxvCiKfJOc+sQTQlIU2lRl8n6bBZdQXVGT5fpcjp8aWjsJ3fPtKRN2Wzak7aajsDla1dMabAx4EZEsPiGX0L1WjGQSCYwFC0JwTDsMSIOfyshdNDpJpXTeaEtCcWPWQsVdujkVmmjhc8MVCOWantXcuniiDvmsFnVEsH4gvUdmazUVvsR64Oi+i+yGn04bEskMaa70Bp7HYU96lUGsBS8DwgA */
  createMachine(
    {
      tsTypes: {} as import("./third-party-machine.typegen").Typegen0,
      schema: { events: {}, context: { isIframe: false } } as Schema,
      id: "idp",
      initial: "Start",
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
            onDone: {
              actions: "assignAuthSession",
              target: "Authorization",
            },
            data: (context) => ({
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
          type: "final",
        },
        Error: {
          type: "final",
        },
      },
    },
    {
      services: {
        handshake,
        getAppMeta,
        postDelegation,
        AuthenticationMachine,
      },
      actions: {
        assignAuthRequest: assign((_, event) => ({
          authRequest: event.data,
        })),
        assignAppMeta: assign((_, event) => ({
          appMeta: event.data,
        })),
        assignAuthoSession: assign({
          thirdPartyAuthSession: (_, event) => event.data,
        }),

        assignAuthSession: assign({
          authSession: (_, event) => event.data,
        }),

        assignError: assign({ error: (_, event) => event.data }),
      },
      guards: {},
    },
  )

export type IDPActor = ActorRefFrom<typeof ThirdPartyAuthMachine>
export type ThirdPartyAuthMachineType = typeof ThirdPartyAuthMachine

export default ThirdPartyAuthMachine
