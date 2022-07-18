import { ActorRefFrom, assign, createMachine } from "xstate"

import { fetchAccountLimitService } from "frontend/integration/app-config/services"
import { Device } from "frontend/integration/internet-identity"
import {
  fetchAuthenticatorDevicesService,
  loginService,
} from "frontend/integration/internet-identity/services"
import {
  AuthSession,
  LocalDeviceAuthSession,
} from "frontend/state/authentication"
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
  | { type: "done.invoke.loginService"; data: LocalDeviceAuthSession }
  | { type: "done.invoke.fetchAccountLimit"; data: number }
  | { type: "done.invoke.fetchAuthenticatorDevicesService"; data: Device[] }

export interface Schema {
  events: Events
  context: Context
}

const KnownDeviceMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGkB2B7A7qgImAbgJYDGYAsgIbEAWhqYAdAMoAuFATiwwGJgs14ipWDz40AxBHT0GdfOgDWjAGZjqAQQCuLamFQsSFFunaCScJmHZCwiUAAd0sQgel2QAD0QBWAAwBmBn8ARgAmABZQkP9fcIAObwBOAHYAGhAAT0RQ5MDwxILkgDYI0Ljg4NiAXyr0tCxcAnNKGjpGVg4uXn4NYmJ0TX0AGUIAWxdRHslpRjlFFTV1PoHhsZdLa3N3R2dXVHcvBG8Qhm9vBNDfXzCrxND0rKPfUNOr6-9QxITgov8imrqGGwZlILVoMg6nGmMlgbBYjHqwKaoKo4PabE42ycLkIbiQnkQlWSyQY4X8CWS4V8lKKsX8D0Q-nOrzewT8oRyZP+tRAiMaNjBbQYWh0egMxCMYHEAFUAHJDADyAGFkFjdrj9vjDt57plEIlguFSQVCsF-Mk4slQgDeUD+c1UUKhugoHRobNUPIlAwADYuuhqnF40Da3WPG6JBgmxL+RJnPzEuI1HkYCBwdx8kHkR0QjFdNRZkTdGiBvYHQnPBkICJxKMm4oVCIpOLWnmZ5HZ1q5zqTAQdkQ4GaljXlhBxc0MXxFcLeZJXXL5ZLeKtlIrGgrlYr+cL5cI29sCnPonvF6iF4fBgkIC1V4JLuuFGe-Nm+RJ7tt2rOC7ucXu9fqDCwIzjPmPQXpqIYVmGiDhBak6siERQtgE-j7p+Hbfsev6nksAGrCBDCDvQ4GjuOJJTjOc7UtuKTLnqRxsiy1xxOUBrePEaENF+R7MHmf64SsQFrCwJFaogN70VS3jwVc5rHNOSTvoCXEYTxkIifiOxBhBV7sbezwPikMRmnEsRhJxSKHl2jAiro+iGPComQQgYRIacwR3Mc45MkUvlVkywSGV8lIeWcrbKZZDrWQwzqujpWllmJLluWyJQRL5sFNkUVYsS80ZxEUFSweEhoWfaKLRQAoqgEBOVeHm+AwyEfIVxSUi2aT0TcgT5Sx+ShOxSYfipVlonVhxlCukbRskhrTpRnzJlUQA */
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
            src: "loginService",
            id: "loginService",
            onDone: [
              {
                target: "End",
              },
            ],
          },
        },
        End: {
          type: "final",
          data: (context, event: { data: AuthSession }) => event.data,
        },
      },
    },
    {
      services: {
        fetchAuthenticatorDevicesService,
        fetchAccountLimitService,
        loginService,
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
