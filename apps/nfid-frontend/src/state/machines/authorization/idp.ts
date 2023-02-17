import { ActorRefFrom, assign, createMachine } from "xstate"

import { isWebAuthNSupported } from "frontend/integration/device"
import {
  getAppMeta,
  handshake,
  postDelegation,
  checkIsIframe,
  checkIsIframeAllowed,
} from "frontend/integration/windows/services"
import { AuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
  ThirdPartyAuthSession,
} from "frontend/state/authorization"
import AuthenticationMachine from "frontend/state/machines/authentication/authentication"
import AuthorizationMachine from "frontend/state/machines/authorization/authorization"

import TrustDeviceMachine from "../authentication/trust-device"



export interface IDPMachineContext {
  authRequest?: {
    maxTimeToLive: bigint
    sessionPublicKey: Uint8Array
    hostname: string
    derivationOrigin?: string
  }
  thirdPartyAuthoSession?: ThirdPartyAuthSession
  appMeta?: AuthorizingAppMeta
  error?: Error
  isIframe: boolean
}

export type IDPMachineEvents =
  | { type: "done.invoke.handshake"; data: AuthorizationRequest }
  | { type: "error.platform.handshake"; data: Error }
  | { type: "done.invoke.getAppMeta"; data: AuthorizingAppMeta }
  | { type: "done.invoke.checkIsIframe"; data: boolean }
  | { type: "done.invoke.checkIsIframeAllowed"; data: boolean }
  | { type: "error.platform.checkRuntime"; data: Error }
  | { type: "done.invoke.authenticate"; data: AuthSession }
  | { type: "done.invoke.authorize"; data: ThirdPartyAuthSession }
  | { type: "done.invoke.postDelegation"; data: void }
  | { type: "RETRY" }

interface Schema {
  context: IDPMachineContext
  events: IDPMachineEvents
}
const IDPMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEsIAcB0BlALgQwCccBiCAewDswNZ8drVNdCcBtABgF1FQ0zZkOZJR4gAHogCM7SQGYMs2QDYAHAFYVK9rOkB2ACwAaEAE9EOjLqX6VATmkAmG5JWyHSgL4fjjbPiIYABJ4FBCwABZ4ANbUAGJgOADG4aSUDBQAbmQxGJGhEdFgHNxIIHwCQiKlEgiytiqWurrsag4qSrpqui5qxma1Thitsvr6StqdTbZePuh+LEEhYZE58UkpYAQEZAQYaAA2eDgAZjsAtrlLBTHFouWCwhSiNZL6khhK0qq23eMtKg4+ogHK8hi1JM1XLoHA52FYZiBfMwAsF8itqABRLY7YgAJQxABVcQBNW6le6VJ7VYG2NRDBwjWSdIEIfTsWxg9hcuQuJTjFQIpH+HAYADiCQAgmg0ABZBJ4DBrZKpKgYZCZbLUGA4KWy+Vk3j8B5VUA1BkODD-BmdKEdWyA0yIfkYFRjMaSWEObqjQVzCUAVxw4TAFCEiSOjxleGS6rAKvSWRyeEDwdDyHD9ANZSNlOeiHq+iG+jUY00APYbVsLMktnkLn0uldWh+2grvswAaDO2QAC8I5QozGqPG1Rqkynuz2ilw7jnHnmEHY6y52OpNKM2boWSNdBh9LYDyXrB79CN2xhO+FJ-2KIPwrGR+rE9Rk12CL2ipISoaKvPqQgPTsIY7DZVw+XZCEWQbDk+UkD0uhPX5zwJAh-VoAARMAMnTONyFVJ9NQwHBUIwrCcLvWMswpP9TXzEs9xbNpdHsZR7BZDR3i5NQSzaJRFBLaYEQoMgIDgURGFnX8TXERAAFpZHYJQPnGNQT0kJRzRaFlZO4yxZFUlpTxGBs7HPZEcEk40qVohBZIcDRlPBJx1M03pHVqDk1HBJkVFeWQAQcWx9DM4VFjRQpLNzf87OkBRVPcV1PlaXR9OrL1LW8tRbHZH59IcEKFlRZZCkVBJkkimiZIAitty5DKuRkHR2n5AqUSudEMCxbYCAq6Salkly4o9VR3WS1L3IU+R7O5V5iyZTxvEROZzLC4qcnQtJeusqqNF3FxvXUoLFKC7dRksfcfldOpmuCxahQWcUdWlOV8C2hcYvYRz4reDS3C09zWneEZjysMYvT41qRUe3UXoVJVwje6LBvA76XL+tz+mdRL3U9b1btmJhQuh575QwDaqERmybELVROlpOoxg0+yWT4zjbGsEZAu4lQUshjAAGFg0SKIAElYBF44CDwM4wEpqqPqGhLRq9cb+mbBiDx+JQvNUdxz0vEMwxvCiKfJOc+sQTQlIU2lRl8n6bBZdQXVGT5fpcjp8aWjsJ3fPtKRN2Wzak7aajsDla1dMabAx4EZEsPiGX0L1WjGQSCYwFC0JwTDsMSIOfyshdNDpJpXTeaEtCcWPWQsVdujkVmmjhc8MVCOWantXcuniiDvmsFnVEsH4gvUdmazUVvsR64Oi+i+yGn04bEskMaa70Bp7HYU96lUGsBS8DwgA */
  createMachine(
    {
      tsTypes: {} as import("./idp.typegen").Typegen0,
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
                        target: "CheckIsIframe",
                      },
                    ],
                    onError: {
                      target: "Error",
                      actions: "assignError",
                    },
                  },
                },
                CheckIsIframe: {
                  invoke: {
                    src: "checkIsIframe",
                    id: "checkIsIframe",
                    onDone: [
                      {
                        actions: "assignIsIframe",
                        target: "CheckIsIframeAllowed",
                        cond: "isTrue",
                      },
                      { target: "#idp.AuthenticationMachine" },
                    ],
                  },
                },
                CheckIsIframeAllowed: {
                  invoke: {
                    src: "checkIsIframeAllowed",
                    id: "checkIsIframeAllowed",
                    onDone: [
                      {
                        target: "#idp.AuthenticationMachine",
                        cond: "isTrue",
                      },
                      {
                        target: "Error",
                        actions: "assignIframeNotAllowedError",
                      },
                    ],
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
            id: "authenticate",
            onDone: "AuthorizationMachine",
            data: (context) => ({
              appMeta: context.appMeta,
              authRequest: context.authRequest,
            }),
          },
        },
        AuthorizationMachine: {
          invoke: {
            src: "AuthorizationMachine",
            id: "authorize",
            onDone: [
              { target: "TrustDevice", cond: "isWebAuthNSupported" },
              { target: "End" },
            ],
            data: (context, event: { data: AuthSession }) => ({
              appMeta: context.appMeta,
              authRequest: context.authRequest,
              authSession: event.data,
            }),
          },
        },
        TrustDevice: {
          entry: "assignAuthoSession",
          invoke: {
            src: "TrustDeviceMachine",
            id: "trustDeviceMachine",
            onDone: "End",
            data: (context) => ({
              isIframe: context.isIframe,
            }),
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
        checkIsIframe,
        checkIsIframeAllowed,
        AuthenticationMachine,
        AuthorizationMachine,
        TrustDeviceMachine,
      },
      actions: {
        assignAuthRequest: assign((_, event) => ({
          authRequest: event.data,
        })),
        assignAppMeta: assign((_, event) => ({
          appMeta: event.data,
        })),
        assignAuthoSession: assign({
          thirdPartyAuthoSession: (_, event) => event.data,
        }),
        assignError: assign({ error: (_, event) => event.data }),
        assignIframeNotAllowedError: assign({
          error: (_) =>
            new Error(
              "NFID Embed is not activated. Please contact Internet Identity Labs at support@identitylabs.ooo to activate this feature.",
            ),
        }),
        assignIsIframe: assign((_, event) => ({
          isIframe: event.data,
        })),
      },
      guards: {
        isWebAuthNSupported,
        isTrue: (_, event) => !!event.data,
      },
    },
  )

export type IDPActor = ActorRefFrom<typeof IDPMachine>
export type IDPMachineType = typeof IDPMachine

export default IDPMachine
