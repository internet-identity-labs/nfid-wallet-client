import { v4 as uuid } from "uuid"
import { ActorRefFrom, createMachine } from "xstate"

import { isMobileWithWebAuthn } from "frontend/integration/device/services"
import { loginWithAnchor } from "frontend/integration/internet-identity/services"
import { GoogleDeviceResult } from "frontend/integration/lambda/google"
import {
  fetchGoogleDevice,
  isExistingGoogleAccount,
  signInWithGoogle,
} from "frontend/integration/lambda/google/services"
import {
  AuthSession,
  GoogleAuthSession,
  LocalDeviceAuthSession,
  RemoteDeviceAuthSession,
} from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

import RegistrationMachine from "./registration"
import RemoteReceiverMachine from "./remote-receiver"

export interface UnknownDeviceContext {
  authRequest: AuthorizationRequest
  appMeta?: AuthorizingAppMeta
}

export type Events =
  | { type: "done.invoke.remote"; data: RemoteDeviceAuthSession }
  | { type: "done.invoke.registration"; data: AuthSession }
  | { type: "done.invoke.registerDevice"; data: AuthSession }
  | { type: "done.invoke.fetchGoogleDevice"; data: GoogleDeviceResult }
  | { type: "done.invoke.signInWithGoogle"; data: GoogleAuthSession }
  | { type: "done.invoke.signInSameDevice"; data: LocalDeviceAuthSession }
  | { type: "done.invoke.isMobileWithWebAuthn"; data: boolean }
  | { type: "AUTH_WITH_GOOGLE"; data: string }
  | { type: "AUTH_WITH_REMOTE" }
  | { type: "AUTH_WITH_OTHER" }
  | {
      type: "AUTH_WITH_EXISTING_ANCHOR"
      data: { anchor: string; withSecurityDevices?: boolean }
    }
  | { type: "END"; data: AuthSession }

export interface Schema {
  events: Events
  context: UnknownDeviceContext
}

const UnknownDeviceMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWlQOwGs8B7Adz2wjADcBLAYzADoBldZAJ3SYGFMx6BHsgAOyAEa0ANrXQBPAMQRieZrTzViBNbACyxSVLAB1WZmNhxAQQyY8iUCOKxZtFQ5AAPRAEYATABsTACcABw+wQDMAAwALJEA7D4ArP6hADQgcoiRkX5MscHBCcGxyQnRoWEBsQC+tZloWLiEJOSUNAzMAEpgULSw6BzI6G54usj0mOpgSipqGlrMHH0DQyNjHk4uo+5IXojxQbEBoaGxftHB5akZWYjJoQlMydFvfjHnVQEJ9Y22LSIZAoVDojCYNiwLDARnouzwCisAFUACoACQA+sYAJLojEAcQA8oT8QAZACiW2crj2oG8CD8jwKiUKyT8fh8sROoWSmWyCFCkWCTDeosiPmiPh5AT8fxATRw+CB7VBXQhtmhsPhiNRmJxeO65N0hJRlP22xp9n29L8sVCzISrPZnO5fj5viuQVeb1eZT8xTqDXlAKVbRBnXBkMwmoE2uReP1mJNaPJ3SpO021sQgXt8Ud12dXNOvPuCASqSYPgC1ceCQCuQqkTlCsBYY6YOYUdMWHxxGIUCMrFoUDw2IRylUTHUmm0TBcI7H3cwvf7RnTlo89Kr7KY9cCAWuCQS4WC7oQwSrItFHMisQStp8zZDrWB7bVXbMK4HzAAYmB0FMcyTtOSxMAAZv+UxfkYAAiEZgOu8KbogVSxC84pSk8d71tWZ48mhRSEYKHwxOKT7NKGr6quCvQALbEOgYBRmAeCjPQGwqEBCwzssYD0YxiGZnSKEfCE0QyskASVD4JSFGeErBF6oq+myAbkYqL4qvBTDkp4azqFAVh4FMxAcDqCa4km6KpoJtIHAypwOk6HJFjyZ6NpW1bVsRcR1gE6mtlR2m6fpeCGcZmCmeZeqWRi5IABrYiwKLYgAcviGJWKlPBooSabmtSSFZmW0T5LEpU8kKMqlSc7nRJEnleT52G-EGLaUVpHbqlgLFsSMYAsMgtFgHBHZcVOiyzvOo54INw2jV0tlWsJCAyeVlb1baXJ+BUFzuZEubiUUPxCuUkTJPUQYkFQ8D7O1mnhl1bCcNwfACEIogSNIsj8o4hVCfZ97yRyV6ilKFTeecAUdY9arPVwS3IQgdpnoUoNvGUFS2pEB7+W1z7KrDNGrIMwzwhMUwzIjxU-GeySSej0SOmURT09DD1vpGGowrGAMWkVK3lO5EpMDjNYnCUTylOzhOc52thLtBzAsMOM3UytPhSsKUSOpJRQxC5eHnC8orROUlS5GEMtttR8tYIrfbfkwf4AZg6v2YUaHJBhURXDJdZ4feJvvAepQyhy1tBV1H49o7a4FRmdn0ne0ToZrvsXkeATuYKjMSuyTyhJHnVqnRDFMbYvUMBxy0gPzAPJxWHx5iktqnKE2elhKATJOjt7hOV96tf8FEc7bOl6YMBlGSZHDu-SbL5DVwQ7fEHepAkdXPKbUoxPWRzF0TzDkngEDz74Typ1jUS3s3ySlGeF4NTySTlfEZ01IfcvdfwrHV4xc0RrwXPqtUqZUzYHmSCzBIuQSz8nrKne+kpBQWygVKL+tsQG2jPNgHchEwj0w7kec6bNLpAA */
  createMachine(
    {
      tsTypes: {} as import("./unknown-device.typegen").Typegen0,
      schema: { events: {}, context: {} } as Schema,
      id: "auth-unknown-device",
      initial: "Start",
      states: {
        Start: {
          initial: "CheckCapability",
          states: {
            CheckCapability: {
              invoke: {
                src: "isMobileWithWebAuthn",
                id: "isMobileWithWebAuthn",
                onDone: [
                  {
                    cond: "bool",
                    target: "#auth-unknown-device.RegistrationMachine",
                  },
                  {
                    target: "#auth-unknown-device.AuthSelection",
                  },
                ],
              },
            },
          },
        },
        RegistrationMachine: {
          invoke: {
            src: "RegistrationMachine",
            id: "registration",
            onDone: "End",
            data: (context) => ({ appMeta: context.appMeta }),
          },
        },
        AuthSelection: {
          on: {
            AUTH_WITH_GOOGLE: {
              target: "AuthWithGoogle",
            },
            AUTH_WITH_REMOTE: {
              target: "RemoteAuthentication",
            },
            AUTH_WITH_OTHER: {
              target: "ExistingAnchor",
            },
          },
        },
        AuthWithGoogle: {
          initial: "Fetch",
          states: {
            SignIn: {
              invoke: {
                src: "signInWithGoogle",
                id: "signInWithGoogle",
                onDone: [
                  {
                    target: "#auth-unknown-device.End",
                  },
                ],
              },
            },
            Fetch: {
              invoke: {
                src: "fetchGoogleDevice",
                id: "fetchGoogleDevice",
                onDone: [
                  {
                    cond: "isExistingGoogleAccount",
                    target: "SignIn",
                  },
                  {
                    target: "#auth-unknown-device.RegistrationMachine",
                  },
                ],
              },
            },
          },
        },
        RemoteAuthentication: {
          invoke: {
            src: "RemoteReceiverMachine",
            id: "remote",
            onDone: "End",
            data: (context, event) => ({
              secret: uuid(),
              authRequest: context.authRequest,
              appMeta: context.appMeta,
            }),
          },
        },
        ExistingAnchor: {
          on: {
            AUTH_WITH_OTHER: {
              target: "AuthSelection",
            },
            AUTH_WITH_EXISTING_ANCHOR: {
              target: "AuthenticateSameDevice",
            },
          },
        },
        End: {
          type: "final",
          data: (context, event: { data: AuthSession }) => event.data,
        },
        AuthenticateSameDevice: {
          invoke: {
            src: "loginWithAnchor",
            id: "loginWithAnchor",
            onDone: [
              {
                target: "End",
              },
            ],
            onError: [
              {
                target: "ExistingAnchor",
              },
            ],
          },
        },
      },
    },
    {
      guards: {
        isExistingGoogleAccount,
        bool: (context, event) => event.data,
      },
      services: {
        fetchGoogleDevice,
        signInWithGoogle,
        isMobileWithWebAuthn,
        RegistrationMachine,
        RemoteReceiverMachine,
        loginWithAnchor,
      },
    },
  )

export type UnknownDeviceActor = ActorRefFrom<typeof UnknownDeviceMachine>
export default UnknownDeviceMachine
