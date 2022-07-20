import { WebAuthnIdentity } from "@dfinity/identity"
import { assign, ActorRefFrom, createMachine } from "xstate"

import { createWebAuthnIdentity } from "frontend/integration/identity"
import { fetchChallenge } from "frontend/integration/internet-identity"
import { registerService } from "frontend/integration/internet-identity/services"
import {
  AuthSession,
  LocalDeviceAuthSession,
} from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

export interface RegistrationContext {
  authSession?: AuthSession
  challenge?: {
    pngBase64: string
    challengeKey: string
  }
  appMeta?: AuthorizingAppMeta
  webAuthnIdentity?: WebAuthnIdentity
  error?: string
}

type Events =
  | {
      type: "done.invoke.fetchChallenge"
      data: {
        pngBase64: string
        challengeKey: string
      }
    }
  | { type: "done.invoke.challengeTimer"; data: void }
  | { type: "done.invoke.registerService"; data: LocalDeviceAuthSession }
  | { type: "error.platform.registerService"; data: Error }
  | { type: "done.invoke.createWebAuthnIdentity"; data: WebAuthnIdentity }
  | { type: "CREATE_IDENTITY" }
  | { type: "FETCH_CAPTCHA" }
  | { type: "SUBMIT_CAPTCHA"; data: string }

const RegistrationMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWgE5igEtZ1dl1CB7AOwDoBldZXdWgYU2QBsuxqZaAMTDoAxpgDEEGmFqFqAN0oBrWQDMR4jt178wiUAAdKsQhRoGQAD0QAWABwAGWgHYAnADZ7Dt09suXWwAaEABPRAAmB1o3WNjHAFZ7ey8AZlsAXwyQtCw8AmJScio6RmZWbR4+AQB1ZDMpGTlFFVlxHWqwABVCAFswXEtjU3NqSxsEB2cPW0cPDwiZhMWPVJDwhFTvWkddx1tYj0dUhJcErJyMHHwiEjJRhiYWdk4qvVo6hsEAUS62AAkAPpsACCAAU-v8QUMTGYSuM7E5aDM5gslis1mFEKlUh4dnsAIz2RZuRyLVIXEC5a4FO7FGiPcq0ABKtPQAxeYFEyhBVwkMJG8KQ1kQ9nctAJbmWbn83iSiXWiASCQJ+McBOVBNsCXmjnslOp+VuRQeZWerONHIAktQ4dxKroYBI2MzviCut9AVaACLfAByXStXQAmgK4RZhRMIr5aLYIvtFmTVgScYqEAFbLRFot7Ak40T9i4DVcjYV7iVGea2Ry2MhDGJOBJ6ABVABCAFkg8DwZDocLhuGxpHEASNXiCe4jhEXB4XKkZQk02LUrQErsCeqtnH7Oli3kbmX6aUnqwLYUOWeSANGtRZPIlKpaAer4N+7DRgiECnSVm57Z-1qqQRMSERphuWqruuJwRBq9gpvq2RUiWz4mhWZqntWuAsphEgDLglBYYYXDkGoBG9E+mFhh+w4IGKbgSlK0aytqTiLlitE6mqeqOJ4ETpBqe40sa5YMuh2GWlhbD4OQYBWhAfAUOgoQ3neLSPqI0nsjUYAAEa8lg1ByQpZgbEY75CqAEx0Qx0rMfKbEbC4MFqhuMzAREpxZIh1CUPJ8DCoaKEiceTIOp0QiaJgVEWSKCAeG4qqzp4MqAe5oHsakjguFxHgTlKxwHIJpZ0qaJ4vB07yfOg0URpZI5kmmiauGu6rEvFSaZIhgVssFlYVK8jr6G+gq1bFLj2GBZwxHEYqnLYRwEgsRVBUefXieekmYFyPJXDVQ51emWUSqsUoLFlDiYhsRx4oSpJksBbjRstPWrWJl7slhNp2lwYV6Htn4buljnpJB6obplJyJM9wmvWV701nWDbIP9NGji4qrjaScanOqCSXYgCyqvG6o5rsvieNDh6lUy8NYbTKMHbl9FrgEWoqrBSRLrYqotQSERRMSuYJG4lMlWhcOYewmmyfJ1CKaZIADtRB3+PRkp4x5fHRqcARpvF2V7DxMyrDiuKi6hokSxJDNjRN7Gyi5ywphq7jm716E2xMeZgWS01xPO7jLHmBJu6t3zUBAntKi4YGpBqLl6m5Xj-qHyuK+Zo0TJljX0XE8SeHmti4hSXlAA */
  createMachine(
    {
      context: {},
      tsTypes: {} as import("./registration.typegen").Typegen0,
      schema: { events: {} as Events, context: {} as RegistrationContext },
      id: "auth-registration",
      initial: "Start",
      states: {
        Start: {
          type: "parallel",
          states: {
            Challenge: {
              initial: "Fetch",
              states: {
                Fetch: {
                  invoke: {
                    src: "fetchChallenge",
                    id: "fetchChallenge",
                    onDone: [
                      {
                        actions: "assignChallenge",
                        target: "Wait",
                      },
                    ],
                  },
                },
                Wait: {
                  invoke: {
                    src: "challengeTimer",
                    id: "challengeTimer",
                    onDone: [
                      {
                        target: "Fetch",
                      },
                    ],
                  },
                  on: {
                    FETCH_CAPTCHA: {
                      target: "Fetch",
                    },
                  },
                },
              },
            },
            Register: {
              initial: "CheckAuth",
              states: {
                CheckAuth: {
                  always: [
                    {
                      cond: "authenticated",
                      target: "Captcha",
                    },
                    {
                      target: "InitialChallenge",
                    },
                  ],
                },
                InitialChallenge: {
                  on: {
                    CREATE_IDENTITY: {
                      target: "CreateIdentity",
                    },
                  },
                },
                Captcha: {
                  on: {
                    SUBMIT_CAPTCHA: {
                      target: "Register",
                    },
                  },
                },
                Register: {
                  invoke: {
                    src: "registerService",
                    id: "registerService",
                    onDone: [
                      {
                        target: "#auth-registration.End",
                      },
                    ],
                    onError: [
                      {
                        actions: "assignError",
                        target: "Captcha",
                      },
                    ],
                  },
                },
                CreateIdentity: {
                  invoke: {
                    src: "createWebAuthnIdentity",
                    id: "createWebAuthnIdentity",
                    onDone: [
                      {
                        actions: "assignWebAuthnIdentity",
                        target: "Captcha",
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        End: {
          type: "final",
          // @ts-ignore: typegen sux a bit
          data: (context, event) => event.data as LocalDeviceAuthSession,
        },
      },
    },
    {
      services: {
        registerService,
        async challengeTimer(): Promise<void> {
          return new Promise((res) => setTimeout(res, 240_000))
        },
        fetchChallenge,
        createWebAuthnIdentity,
      },
      actions: {
        assignChallenge: assign({ challenge: (context, event) => event.data }),
        assignWebAuthnIdentity: assign({
          webAuthnIdentity: (context, event) => event.data,
        }),
        assignError: assign({ error: (context, event) => event.data.message }),
      },
      guards: {
        authenticated: (context) => !!context.authSession,
      },
    },
  )

export type RegistrationActor = ActorRefFrom<typeof RegistrationMachine>

export default RegistrationMachine
