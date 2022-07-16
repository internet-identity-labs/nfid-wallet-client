import { WebAuthnIdentity } from "@dfinity/identity"
import { assign, ActorRefFrom, createMachine } from "xstate"

import { createWebAuthnIdentity } from "frontend/integration/identity"
import { fetchChallenge } from "frontend/integration/internet-identity"
import { register } from "frontend/integration/internet-identity/services"
import {
  AuthSession,
  LocalDeviceAuthSession,
} from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

interface Context {
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
  | { type: "done.invoke.register"; data: LocalDeviceAuthSession }
  | { type: "error.platform.register"; data: Error }
  | { type: "done.invoke.createWebAuthnIdentity"; data: WebAuthnIdentity }
  | { type: "CREATE_IDENTITY" }
  | { type: "FETCH_CAPTCHA" }
  | { type: "SUBMIT_CAPTCHA"; data: string }

const RegistrationMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWgE5igEtZ1dl1CB7AOwDoBldZXdWgYU2QBsuxqZaAMTDoAxpgDEEGmFqFqAN0oBrWQDMR4jt178wiUAAdKsQhRoGQAD0QAWABwAGWgHYAnADZ7Dt09suXWwAaEABPRAAmB1o3WNjHAFZ7ey8AZlsAXwyQtCw8AmJScio6RmZWbR4+AQB1ZDMpGTlFFVlxHWqwABVCAFswXEtjU3NqSxsEB2cPW0cPDwiZhMWPVJDwhFTvWkddx1tYj0dUhJcErJyMHHwiEjJRhiYWdk4qvVo6hsEAUS62AAkAPpsACCAAU-v8QUMTGYSuM7E5aDM5gslis1mFEKlUh4dnsAIz2RZuRyLVIXEC5a4FO7FGiPcq0ABKtPQAxeYFEyhBVwkMJG8KQ1kQ9nctAJbmWbn83iSiXWiASCQJ+McBOVBNsCXmjnslOp+VuRQeZWerONHIAktQ4dxKroYBI2MzviCut9AVaACLfAByXStXQAmgK4RZhRMIr5aKl9l5lvZlS4IglMRtAs4ErstV5bBrTvrslSrkbCvcSozzWyOWxkIYxJwJPQAKoAIQAskHgeDIdDhcNw2NI4hPC4dkm3JKXHKnAlFQgnPY1QT0gS9R4DaWbuX6aUnqwLYUOUeSANGtRZPIlKpaDuz4MB7DRgiEKvSbQIi50rZ87ZUhExIRAu65arQ2bqicEQavYq5FpceT3ialZmoeNa4Cy6ESAMuCUBhhhcOQah4b0d7oWGL4jou4qStKsranOC5Jniex6o4ngRGu5zFoaSEVgyqGYZaGFsPg5BgFaEB8BQ6ChBeV4tLeohieyNRgAARryWDUJJ0lmBsRjPkKoATGKbgSlK0b0fK85YggKaqoScy2IBqYuFkxbUJQUnwMKvFsvx+5Mg6nRCJomAUcZIoIB4U7Iu4sV-gBQELnG46sR4BLuNm6RuFuiEBXuVYVK8jqyJ86CRRGJmIOuwF2YszhnDmxKxWSMz5TSxqBcVLwdHoVXDjV9n2CBZwxHEbg4mSvgppkPHboVpoHkJx4iZgXI8lcg2vi4jjjgSqxSgs+0OOmiBHCxOakmSgFuNGnVlnSy1Mqe7IYTadpcCFA1PoK1XRXVC7frY4E5uucYnIkj18UVglvbW9aNsgO1UQSWWqjOpIuac6ppguCyqhEOaLE47H2J4MNLShK0IxhdOo8NmXmdmARaiqMFJEx+Zg+qERRMSSYJHlC0Fd1cO0+h7AqRJUnUDJBkgIOlHDf45m0QBywAVKAQuATbjpXsni2KsOK4lT4svdWwmM9FM4LrKK5Jrivi7O5otdbuVuVX9Q6vgkwR2XVE1xEcWXRuu3EIZ7z2Vt81AQLbEynCBqQaiuG4uXm83R09yEA8rUUTHGC7RiHsR-vM-PE+7WRAA */
  createMachine(
    {
      context: {},
      tsTypes: {} as import("./registration.typegen").Typegen0,
      schema: { events: {} as Events, context: {} as Context },
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
                    src: "register",
                    id: "register",
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
        register,
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
