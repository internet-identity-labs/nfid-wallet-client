import { ActorRefFrom, assign, createMachine } from "xstate"

import { Profile } from "@nfid/integration"

import { logUser } from "frontend/features/stats/services"
import { fetchAccountLimitService } from "frontend/integration/app-config/services"
import {
  fetchProfileService,
  getLocalStorageProfileService,
} from "frontend/integration/identity-manager/services"
import { Device } from "frontend/integration/internet-identity"
import {
  fetchAuthenticatorDevicesService,
  loginService,
} from "frontend/integration/internet-identity/services"
import {
  AuthSession,
  LocalDeviceAuthSession,
} from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

export interface KnownDeviceMachineContext {
  isNFID: boolean
  profile: Profile
  authRequest: AuthorizationRequest
  appMeta?: AuthorizingAppMeta
  isSingleAccountApplication?: boolean
  authSession?: AuthSession
  devices?: Device[]
}

export type Events =
  | { type: "UNLOCK" }
  | { type: "done.invoke.loginService"; data: LocalDeviceAuthSession }
  | { type: "done.invoke.getLocalStorageProfileService"; data: Profile }
  | { type: "done.invoke.fetchAccountLimit"; data: number }
  | { type: "done.invoke.fetchAuthenticatorDevicesService"; data: Device[] }
  | { type: "done.invoke.fetchProfileService"; data: Profile }

export interface Schema {
  events: Events
  context: KnownDeviceMachineContext
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
          initial: "LoadProfile",
          states: {
            LoadProfile: {
              invoke: {
                src: "getLocalStorageProfileService",
                id: "getLocalStorageProfileService",
                onDone: [{ actions: "assignProfile", target: "FetchDevices" }],
              },
            },
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
              onDone: "FetchAccountLimit",
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
              onDone: "Done",
            },
            Done: {
              type: "final",
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
                target: "UpdateProfile",
                actions: ["assignAuthSession", "logUserStats"],
              },
            ],
            onError: {
              target: "Authenticate",
            },
          },
        },
        UpdateProfile: {
          invoke: {
            src: "fetchProfileService",
            id: "fetchProfileService",
            onDone: "End",
          },
        },
        End: {
          type: "final",
          data: (context, event) => context.authSession,
        },
      },
    },
    {
      services: {
        fetchAuthenticatorDevicesService,
        fetchAccountLimitService,
        loginService,
        fetchProfileService,
        getLocalStorageProfileService,
      },
      actions: {
        assignAuthSession: assign({ authSession: (_, event) => event.data }),
        assignProfile: assign({ profile: (_, event) => event.data }),
        assignDevices: assign({ devices: (_, event) => event.data }),
        assignAccountLimit: assign({
          isSingleAccountApplication: (_context, event) => event.data === 1,
        }),
        logUserStats: (context) =>
          logUser({ applicationName: context.appMeta?.name }),
      },
    },
  )

export type KnownDeviceActor = ActorRefFrom<typeof KnownDeviceMachine>

export default KnownDeviceMachine
