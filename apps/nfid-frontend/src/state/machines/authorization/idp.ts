import { ActorRefFrom, assign, createMachine } from "xstate"

import { isWebAuthNSupported } from "frontend/integration/device"
import {
  getAppMeta,
  handshake,
  postDelegation,
} from "frontend/integration/windows/services"
import { AuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
  ThirdPartyAuthSession,
} from "frontend/state/authorization"
import AuthenticationMachine, {
  AuthenticationMachineContext,
} from "frontend/state/machines/authentication/authentication"
import AuthorizationMachine, {
  AuthorizationMachineContext,
} from "frontend/state/machines/authorization/authorization"

import TrustDeviceMachine from "../authentication/trust-device"

export interface IDPMachineContext {
  authRequest?: {
    maxTimeToLive: bigint
    sessionPublicKey: Uint8Array
    hostname: string
  }
  thirdPartyAuthoSession?: ThirdPartyAuthSession
  appMeta?: AuthorizingAppMeta
  error?: Error
}

export type IDPMachineEvents =
  | { type: "done.invoke.handshake"; data: AuthorizationRequest }
  | { type: "error.platform.handshake"; data: Error }
  | { type: "done.invoke.getAppMeta"; data: AuthorizingAppMeta }
  | { type: "done.invoke.authenticate"; data: AuthSession }
  | { type: "done.invoke.authorize"; data: ThirdPartyAuthSession }
  | { type: "done.invoke.done"; data: void }
  | { type: "RETRY" }

interface Schema {
  context: IDPMachineContext
  events: IDPMachineEvents
}
const IDPMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEsIAcB0BlALgQwCccBiCAewDswNZ8drVNdCcBtABgF1FQ0zZkOZJR4gAHogCcAZgAcGaZPYBWWQEYATJNVqALABoQATyns1GPbN2azANlntdAXyeHG2fEQwAJPBQiwABZ4ANbUAGJgOADGgaSUDBQAbmRhGMH+QaFgHNxIIHwCQiL5EgiK8gDs1SoasraVypVqssqGJuUauhjKGtK6urbs0o3Vki5u6B4sPn4BwWmRMXFgBARkBBhoADZ4OABmGwC26XNZYbmihYLCFKJleua2auz2ks1DKrIa7Ygaej0VGpKuxZCMNBp2JVbBMQO5mF5fJkFtQAKJrDbEABKqIAKliAJqXfLXYp3Up-bQ9Pq6EZtYyIXTsSSA9hstTSFq2IayWHwzw4DAAcSiAEE0GgALJRPAYJaxeJUDDIZKpagwHDiqUy4m8fg3EqgDpNFmSM1m6HKV7fWyGMq6SS2DDNWSNPlTUUAVxwgTAFCE0T2t0leFiKrAisSKTSeG9vv9yED9F1BX1ZNEHX6lQwDvNDhdkNddsQHMaOa0tgd30U1RhrjhHrjG2QAC8g5QQ2GqJHlaqY02CK2clwrmnbvcS9JbMoMGDXpUK89NL8EFoWbmzfmWoXKu7MF6fc222TO4Fwz2VdHqLHD4OWzk1Hk9UVxxSEBzp7PpPPF2plwzV2UcwN0kLdvlBXd63cXECE9WgABEwCSRMI3IJVLzVDAcFghCkJQ09wxTUlX1AB4pxnaRKJeNlIV6aR6Q6JknXNTcoW3CCXHrCgyAgOBREYUcX0NcREAAWm-J16M0exBjUXpKnoldRN0bMzV0KxuWqNQhkqAY92mIhBINclSLEjRVAUICNBk555MUgDFEBID1GZSjQXsfSEUFJF5myIz0zfUT-nYSzpI0uSNAUhiS0ijA2SAxpHV6SsFM8gVZmRbI5SiWJ-JIkT33YH4HLZOK2XZTl6h5NKZh8840QxAg8uEspRO0jRQus8K7Oi8phgwcz2T0XRlBGOtJiYdK6pRDB4ISZqTIK1RsxaZprFsSQmM2ld+m6XSLSsCpuWcKCpi84UxQlaV8AWicEGUAwAIdDqrXKyLKldazKxqrwRU1K6ZWy5ZbrfF5iuNSpTRYy1rWsn7BT+rVrtlOaqBB0yEFsuK5J0LQdEejohhnV74uUWxrJUk6JowA94wDdsKAItGSTHFqpDkuLWlkTc+neaEdpUnMWLAnd9Npo8GaZsB0YKmRzCUV13kdJc1EkFcHvkb9IZBBSrHqNR9JguCcEQ5DomllmhMWspXRnGzyd6WopxXS0MErKwbG0hwqYbTBUX8GX7W5IX7GUV7Kzsldue6SQXlpUD7FV3lOKAA */
  createMachine(
    {
      tsTypes: {} as import("./idp.typegen").Typegen0,
      schema: { events: {}, context: {} } as Schema,
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
                    onError: "Error",
                  },
                },
                Error: {
                  onEntry: "assignError",
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
            data: (context) =>
              ({
                appMeta: context.appMeta,
                authRequest: context.authRequest,
              } as AuthenticationMachineContext),
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
            data: (context, event: { data: AuthSession }) =>
              ({
                appMeta: context.appMeta,
                authRequest: context.authRequest,
                authSession: event.data,
              } as AuthorizationMachineContext),
          },
        },
        TrustDevice: {
          entry: "assignAuthoSession",
          invoke: {
            src: "TrustDeviceMachine",
            id: "trustDeviceMachine",
            onDone: "End",
          },
        },
        End: {
          invoke: {
            src: "postDelegation",
            id: "done",
          },
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
        AuthorizationMachine,
        TrustDeviceMachine,
      },
      actions: {
        assignAuthRequest: assign((context, event) => ({
          authRequest: event.data,
        })),
        assignAppMeta: assign((context, event) => ({
          appMeta: event.data,
        })),
        assignAuthoSession: assign({
          thirdPartyAuthoSession: (context, event) => event.data,
        }),
        assignError: assign({ error: (context, event) => event.data }),
      },
      guards: {
        isWebAuthNSupported,
      },
    },
  )

export type IDPActor = ActorRefFrom<typeof IDPMachine>
export type IDPMachineType = typeof IDPMachine

export default IDPMachine
