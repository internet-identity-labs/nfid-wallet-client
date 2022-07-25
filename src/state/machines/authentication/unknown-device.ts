import { v4 as uuid } from "uuid"
import { ActorRefFrom, createMachine } from "xstate"

import { isMobileWithWebAuthn } from "frontend/integration/device/services"
import { GoogleDeviceResult } from "frontend/integration/lambda/google"
import {
  fetchGoogleDevice,
  isExistingGoogleAccount,
  signInWithGoogle,
} from "frontend/integration/lambda/google/services"
import {
  AuthSession,
  GoogleAuthSession,
  RemoteDeviceAuthSession,
} from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

import RegistrationMachine from "./registration"
import RemoteReceiverMachine from "./remote-receiver"
import { TrustDeviceMachine } from "./trust-device"

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
  | { type: "done.invoke.isMobileWithWebAuthn"; data: boolean }
  | { type: "AUTH_WITH_GOOGLE"; data: string }
  | { type: "AUTH_WITH_REMOTE" }
  | { type: "AUTH_WITH_OTHER" }
  | { type: "END"; data: AuthSession }

export interface Schema {
  events: Events
  context: UnknownDeviceContext
}

const UnknownDeviceMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWlQOwGs8B7Adz2wjADcBLAYzADoBldZAJ3SYGFMx6BHsgAOyAEa0ANrXQBPAMQRieZrTzViBNbACyxSVLAB1WZmNhxAQQyY8iUCOKxZtFQ5AAPRAEYATABsTACcABw+wQDMAAwALJEA7D4ArP6hADQgcoiRkX5MscHBCcGxyQnRoWEBsQC+tZloWLiEJOSUNAzMAEpgULSw6BzI6G54usj0mOpgSipqGlrMHH0DQyNjHk4uo+5IXojxQbEBoaGxftHB5akZWYjJoQlMydFvfjHnVQEJ9Y22LSIZAoVDojCYNiwLDARnouzwCisAFUACoACQA+sYAJLojEAcQA8oT8QAZACiW2crj2oG8CD8jwKiUKyT8fh8sROoWSmWyCFCkWCTDeosiPmiPh5AT8fxATRw+CB7VBXQhtmhsPhiNRmJxeO65N0hJRlP22xp9n29L8sVCzISrPZnO5fj5viuQVeb1eZT8xTqDXlAKVbRBnXBkMwmoE2uReP1mJNaPJ3SpO021sQgXt8Ud12dXNOvPuCASqSYPgC1ceCQCuQqkTlCsBYY6YOYUdMWHxxGIUCMrFoUDw2IRylUTHUmm0TBcI7H3cwvf7RnTlo89Kr7KY9cCAWuCQS4WC7oQwSrItFHMisQStp8zZDrWB7bVXbMK4HzAAYmB0FMcyTtOSxMAAZv+UxfkYAAiEZgOu8KbogVSxC84pSk8d71tWZ48mhRSEYKHwxOKT7NKGr6quCvQALbEOgYBRmAeCjPQGwqEBCwzssYD0YxiGZnSKEfCE0QyskASVD4JSFGeErBF6oq+myAbkYqL4qvBTDkp4azqFAVh4FMxAcAo5IAHIwYJtIHAgARskwtrspE5QRKUySxGeST5IRRRXJEoT7sk6mtlR2m6fpeCGcZmCmTqCa4km6KpjZVrCQypwOk6HJFjy3nRJElbVtWxFxHWAShZRWkdkwKIcKggxwR2XFToss5DI16DNV0ExTDMaXIQgKRSi8qRRFJMpSlE8kSva0T+kk4Q1BEoSVXKJBUPA+wttV4a1WwnDcHwAhCKIEjSLI-KONSSFZmWbqlv4PhXqKUoVKV5xVZp+1qodXCDfddpnnaV4ygEKSlDJtrBN9yq-TRqyDMM8J9dMqiAxlPxnskkmvW8jplEUuNw221GdhqMKxkJIAWndGXlN5EpMJEJWeT8YSyaT4W1R+PZ9t+Q4LultO3TTW7TSELKSUUMS5Xh5wvKK0TlJUuRhNzNXvrYS7Qb+kGYJjdmFGhyQYVEVwyXWeH3kr7wHqUMocprCMU1gusC2u5pi7Z9J3tE6E+BEMQXkeATeUFYPsoEuOlFyLtvoj-FMbYLFsRxIt0+LhwVh8eYpLapxrfJ4nJPjt7hLE0T3r8Qa7T9ifMJFgwGUZJkcEbfvJMKUkpOEMnFNUBXPMrUoxPWRwJ+TdUNU18Gdx6o3FMejKCokNReU9KtFW8dqVAFQVBVPEV4BAC-DU8AcVP6uQXLe3eb-yF5FTySRV-E5Ss4G-wUQ35Pn7aM82BbQhCwqUcShUPjlHqPUIAA */
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
            onDone: "TrustDevice",
            data: (context, event) => ({
              secret: uuid(),
              authRequest: context.authRequest,
              appMeta: context.appMeta,
            }),
          },
        },
        ExistingAnchor: {
          on: {
            END: {
              target: "End",
            },
            AUTH_WITH_OTHER: {
              target: "AuthSelection",
            },
          },
        },
        TrustDevice: {
          invoke: {
            src: "TrustDeviceMachine",
            id: "trustDeviceMachine",
            onDone: "End",
            data: (context, event) => {
              console.debug("TrustDevice invoker", { context, event })
              return {
                // @ts-ignore leck mich am Arsch event.data
                authSession: event.data as RemoteDeviceAuthSession,
              }
            },
          },
        },
        End: {
          type: "final",
          data: (context, event: { data: AuthSession }) => event.data,
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
        TrustDeviceMachine,
      },
    },
  )

export type UnknownDeviceActor = ActorRefFrom<typeof UnknownDeviceMachine>
export default UnknownDeviceMachine
