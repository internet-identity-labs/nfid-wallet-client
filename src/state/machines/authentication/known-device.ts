import { eventNames } from "process"
import { ActorRefFrom, assign, createMachine } from "xstate"

import { fetchAccountLimitService } from "frontend/integration/app-config/services"
import { Device } from "frontend/integration/internet-identity"
import { fetchAuthenticatorDevicesService } from "frontend/integration/internet-identity/services"
import { AuthSession } from "frontend/state/authentication"
import { AuthorizationRequest } from "frontend/state/authorization"

export interface Context {
  isNFID: boolean
  anchor: number
  authRequest: AuthorizationRequest
  isSingleAccountApplication?: boolean
  authSession?: AuthSession
  devices?: Device[]
}

export type Events =
  | { type: "UNLOCK" }
  | { type: "done.invoke.login"; data: AuthSession }
  | { type: "done.invoke.fetchAccountLimit"; data: number }
  | { type: "done.invoke.fetchAuthenticatorDevicesService"; data: Device[] }

export interface Schema {
  events: Events
  context: Context
}

const KnownDeviceMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGkB2B7A7qgImAbgJYDGYAsgIbEAWhqYAdAMoAuFATiwwGJgs14ipWDz40AxBHT0GdfOgDWjAGZjqgknESgADuliEWhadpAAPRABYAzACYGANgCsD204CcADku2A7NYAGAEYnABoQAE9EWwcAhncErz93B09nd0sAX0zwtCxcAk1KGjpGVg4uXn5qAEFiYnQAV1QWABlCAFtDUWrJaUY5RRU1Oobmts7DUz0DIxMkc0QnAPsAteCA63cgkKDfcKiEZaD4xN93J09Pa1Sg7NyMbA1SYtoZcs4+mVg2FkY8p6FF5UN5lNicab6QzGVCmCwIdy2OJBWyWDKWHyeS6Ig6IayXBjrNa+IJXfwxLI5EAAgpCcgg0oMGqNFjUMAtEgUP7iACqADlWgB5ADCyEhsxhcKWtlxCKClgYaLOQWsvk8vls92pj1pRQZMla6CgdC+A1Q8iUDAANka6OLofNQPCnDLIogUQF3KcElsnH6Ar41dkqRgIFoFjTnvSSu9wZU1FGRFUaPa5rCFvCgitZajPN73L4HDtUQXPJqqZGgdHQcw4z0BFWRDh+qnJRnEK5fAwkdYUb4AyrtmE3Qg-AqlV4XJ53KqfFrK3TXoyPvHqonW47Fgg1bK9k584inL3-CT5zqo0vYxV67V6k0Wu0uquUwsZg70073dmR5Y1YT1iqQSpD21hnvkF76mC17JreYwPpMXDNvQG4flu-jWIq8oBA4gRASqTj7COTghIqiRlpYngBOqDiUg84FVpeUGcDeoz3hMT4oVK26eLKlgBAqiSlt4-Y7JYThgYCi6QbWFSce2RyWLumz-us07LAWOG0dq9FSTGjDMqy7JGMQXJgHJn4IFm1gYRRNi9kB-HysOhz4qsRIET4v5YhJurAnpDCGsaqFvmmXFAXmISuKiDg0RqaIOLKVz2IJaSib4ljyj5EH+QAoqgEDmVuQTuHEZabDEewOOlZaEYcHoYSlVxom4FFZQxkGFfCtg8SOgTBpkQA */
  createMachine(
    {
      tsTypes: {} as import("./known-device.typegen").Typegen0,
      schema: { events: {}, context: {} } as Schema,
      id: "KnownDeviceMachine",
      initial: "Start",
      states: {
        Start: {
          type: "parallel",
          states: {
            FetchDevices: {
              initial: "Fetch",
              states: {
                Fetch: {
                  invoke: {
                    src: "fetchAuthenticatorDevicesService",
                    id: "fetchAuthenticatorDevicesService",
                    onDone: [
                      {
                        actions: "assignDevices",
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
            FetchAccountLimit: {
              initial: "Fetch",
              states: {
                Fetch: {
                  invoke: {
                    src: "fetchAccountLimitService",
                    id: "fetchAccountLimitService",
                    onDone: [
                      {
                        actions: "assignAccountLimit",
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
            target: "Authenticate",
          },
        },
        Authenticate: {
          on: {
            UNLOCK: {
              target: "Login",
            },
          },
        },
        Login: {
          invoke: {
            src: "login",
            id: "login",
            onDone: [
              {
                target: "End",
              },
            ],
          },
        },
        End: {
          type: "final",
        },
      },
    },
    {
      services: {
        fetchAuthenticatorDevicesService,
        fetchAccountLimitService,
      },
      actions: {
        assignDevices: assign({ devices: (_, event) => event.data }),
        assignAccountLimit: assign({
          isSingleAccountApplication: (_context, event) => event.data === 1,
        }),
      },
    },
  )

export type KnownDeviceActor = ActorRefFrom<typeof KnownDeviceMachine>

export default KnownDeviceMachine
