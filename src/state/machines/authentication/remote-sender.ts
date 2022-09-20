import { ActorRefFrom, assign, createMachine } from "xstate"

import { getDataFromPath } from "frontend/apps/inter-device/services"
import { postRemoteDelegationService } from "frontend/integration/identity/services"
import { getAppMeta } from "frontend/integration/windows/services"
import { AuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
  ThirdPartyAuthSession,
} from "frontend/state/authorization"

import AuthenticationMachine from "./authentication"

interface Context {
  pubsubChannel?: string
  authSession?: AuthSession
  appMeta?: AuthorizingAppMeta
  authRequest?: AuthorizationRequest
}

type Events =
  | { type: "done.invoke.known-device"; data: AuthSession }
  | {
      type: "done.invoke.getDataFromPath"
      data: { authRequest: AuthorizationRequest; pubsubChannel: string }
    }
  | { type: "done.invoke.getAppMeta"; data: AuthorizingAppMeta }
  | { type: "done.invoke.authenticate"; data: AuthSession }
  | { type: "done.invoke.authorize"; data: ThirdPartyAuthSession }
  | { type: "done.invoke.postRemoteDelegationService"; data: void }

const RemoteSenderMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWgE5gFsB7dMbWMAOwjFwDoBldZXdOgcTHQEENMAlMAEdUcNgDEuAY0wBiCEUpg6AS0oA3IgGtlMdABFkzcbiIEACkcyJQAByKwV6FYpsgAHogAsATgBMdABsAIzBPj4A7MGBfoEArKGBADQgAJ6IsQAMdD6ZEXGBmV5hfl5xPgC+FSloWHiEJGQU1LSMzKwcXNy2tgCyXMh0kugy8orKapo6dHrdfQNu9o7Orkge3qV0CX4+ABzRexEAzH5xKekIXrs+dLuZmXc+wZlHEfuBgVU1fPXEpORUGj0JgsdBjJR0WDMUh0Wo4fB-JqA1og1iLBxOFyUNyeBC5G5+WKBJ5vOJ+XYxc6II5lW6BXZXI67a4RLwRQIRL4gOG-RoAlr0XhYKjOKRGLG9ZAyNRgcETDTaZRwkUqMWkdHLLE4xDBLx+YJ0I5HQpeF4RcJPKkIGlxOm7OL3D6BPVRTnVbk-BF85pAuhCzBEXAqABe4sUkulSjlqgV0zhgZDYA1mNWoFxeoCupOET8eUKudOVtyAVzRVyRz2gQrfiq7soRBo8DWPK9-x9KPabE4PD4ghEYiG0msayWKexa1xzz8VtKuxyuryrNNfhOK65LYabeRwM7nR7WD7oihdH042TK3HacQrromSepWCxuCcS8TJnrMN1yOcQdwXtr9iddPU3JEBTaUE939Q8xHPLUJ2vXYrWCfIchdY0mReLxnRrd0N0RflfVRLsuh6fpmEHEZhzsDEL21BApytNkIluPITntfVX3iIC6lbUDCN3bs5jIwZTyUWDU3WBAQi8VCiUyZ0Cn1CIrQdI46HJU4cxfKtmTibj4RAgiOwgwTSIWEcaLgq8EDeRiiluY1MlzXYV2QmJ9N5LcwKI8TL0kl8kKcnIogrOITiKQpPlw4D8PbQU+BVNUJSlTAZV8uipwCbTwleQonjiZS0mpXVPx8I4It0op8g83ijPirAE1DC8I1SsSLM1CTcQKq1dgibIc0fQoTiee4vBqwy4roABRah0vghByn60oXmucJcxOHq4jnHMngUo0q2fcbYu3ObrPKq1ytve5MhfLICquWsKiAA */
  createMachine(
    {
      tsTypes: {} as import("./remote-sender.typegen").Typegen0,
      schema: { events: {} as Events, context: {} as Context },
      id: "auth-remote-sender",
      initial: "Start",
      states: {
        Start: {
          type: "parallel",
          states: {
            GetAuthRequest: {
              initial: "Fetch",
              states: {
                Fetch: {
                  invoke: {
                    src: "getDataFromPath",
                    id: "getDataFromPath",
                    onDone: [
                      {
                        actions: "assignAuthRequest",
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
            onDone: { target: "PostDelegation", actions: "assignAuthSession" },
            data: (context) => ({
              appMeta: context.appMeta,
              authRequest: context.authRequest,
            }),
          },
        },
        PostDelegation: {
          invoke: {
            src: "postRemoteDelegationService",
            id: "postRemoteDelegationService",
            onDone: "End",
            data: (context) => {
              return {
                appMeta: context.appMeta,
                authRequest: context.authRequest,
                auhtSession: context.authSession,
              }
            },
          },
        },
        End: {
          type: "final",
        },
      },
    },
    {
      guards: {},
      services: {
        AuthenticationMachine,
        postRemoteDelegationService,
        getAppMeta,
        getDataFromPath,
      },
      actions: {
        assignAppMeta: assign((context, event) => ({
          appMeta: event.data,
        })),
        assignAuthRequest: assign((context, event) => ({
          authRequest: event.data.authRequest,
          pubsubChannel: event.data.pubsubChannel,
        })),
        assignAuthSession: assign((context, event) => {
          console.debug("RemoteSenderMachine assignAuthSession", {
            authSession: event.data,
          })
          return {
            authSession: event.data,
          }
        }),
      },
    },
  )

export type RemoteSenderActor = ActorRefFrom<typeof RemoteSenderMachine>
export type RemoteSenderMachineType = typeof RemoteSenderMachine

export default RemoteSenderMachine
