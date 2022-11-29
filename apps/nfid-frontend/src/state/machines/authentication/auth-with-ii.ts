import { ActorRefFrom, assign, createMachine } from "xstate"

import { signinWithII } from "frontend/integration/signin/signin-with-ii"
import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

export interface AuthenticationMachineContext {
  anchor: number
  appMeta?: AuthorizingAppMeta
  authSession?: AuthSession
  isRegistered?: boolean
}

export type Events =
  | { type: "done.invoke.signInWithIIService"; data?: AuthSession }
  | { type: "done.invoke.checkRegistrationStatus"; data: boolean }
  | { type: "NEW_NFID" }
  | { type: "EXISTING_NFID" }
  | { type: "CONNECT_WITH_ANCHOR"; anchor: number }
  | { type: "CONNECT_WITH_RECOVERY" }
  | { type: "CREATE_NEW_ANCHOR" }
  | { type: "CONNECT_RETRY" }
  | { type: "RECOVER_II_SUCCESS" }
  | { type: "BACK" }

export interface Schema {
  events: Events
  context: AuthenticationMachineContext
}

const AuthWithIIMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEECuAXAFgdQJZYEkCBZAQwGNNcA7MAOgOvzSz0IIGIA5AUWwH0uAMQIARANoAGALqJQABwD2sfLkXU5IAB6IATLoCMdSQA4ArAE4AzADZJVs-oDsjgDQgAnoismrdGwE2TkFWACwWBmY2ZgC+Me4sOPiYRGSUNPSMzBhJ7Bw8ABoEAMoAKgRcAOKCIhIymkoq6GoaSNp6hsbm1nYOzm6eevZ04RZjNpEBBiZxCTlsKSQUVLQMTOiJC0QcAELIAMIA0lKybY2q6po6CPpGppa29o66LrruXggmunRjv06hVic-zMYVmIE2yVSywyDAI+wATmBSOgwFwwAB3YRiDj7ADyXF4+1K-GwBFKAAl+MguPtybiAEonBrKC6tUDXOw2Oi2JzTXQ2Eyhf4md6IUK6CzGSTSgxOSS6UKSGyhUKxeLg+aQpbpVZEBFIlFozG1HH4wnE0kU-j0nh4gBqPHpAE0mWcWc1Lm0OUruUE+QKhaERYMEGYnJKLMEAroomYTAYVWCIew0itMnDEcjURisaIcTbkKUeII+FSaXTGfU3U0WldEJzfbyvgHhaKEFYY1LpdKrFZJAZJE4rEnNSnobqMwbs8bsXsjq6FO7a169CYTHQvvH7HKLGY43u272jIEAr4TOHASPWFrUzC9epaOQNtRKIp4aaCbbiTbSs6FyBzg9Nl2gQAc9zoaZXheKwDAsaJgw+AEjDMbtZXlRVlVVK9ckWW8J32B8wCfZAX0wN9dgOY4q0XGtPXZRBgnXQVAWeFCDF7JxDyBLtpRMII5W6bCtm1NNYQI6hH2fV94QIiAwAo+dqIApc6JAgxZVCOgUJlGxHg7BUuMlbTeP4+4LCEm9x3TekiMUAA3MB4Q8AAFTB4VIWB5Jte1HX4Ih+GKABVfZ9h4Ypin-QDl3o0DJHAyDniHWD4LbEEuT7MYEy+KwLCFGwLLHHVrNshynNc9zPIUqjTho1k6wQRiNwBKC2I41KXh+YJYxePd-l0OJ1WoRQ5PgNpk1wqy1mya92GZWjgOucU2zgkZfl+UJph8CIComoqxMzQ0c1qOa6pXdsLG+aUnBMQcJjiwwbEPRUtO7ex1IVXs1TmGbdtEohSioeEIGc0h4XQD5aqA+rz0u3QwiiSIBzgx6Q0MIxRjGFwhWu9SdqhPb7wkoipLI+ETqhs6YeMOHVQmMwkYCQ9zA3XsYJYnxdEFPGRLvOFCOI0i31ksByeitSXicfxw109jpnQpn11ZtmXA5rn1XG-G-oIGzyHsxyXLcjyRerU6Yqp+V4bphmUY+NKN0kTKgzh3Lgm5vD6FKeFUFgdBRDAOzcHIY3IbF64DAlqW4LZuWDJDO2bsd7KXfy9XR1+mEeGoCBRdU64csuwcbuCMCHrbXwePlEwLtsZK3asnOFsQABaG3m5TuIgA */
  createMachine(
    {
      tsTypes: {} as import("./auth-with-ii.typegen").Typegen0,
      schema: {} as Schema,
      initial: "InitAuthWithII",
      id: "AuthWithIIMachine",
      states: {
        InitAuthWithII: {
          on: {
            NEW_NFID: {
              target: "IICreateNewNFID",
            },
            EXISTING_NFID: {
              target: "IIThirdParty",
            },
            BACK: {
              target: "End",
            },
          },
        },
        IICreateNewNFID: {
          on: {
            CONNECT_WITH_ANCHOR: {
              target: "IIConnectAnchor",
              actions: "assignAnchor",
            },
            CONNECT_WITH_RECOVERY: {
              target: "IIRecoveryPhrase",
            },
            CREATE_NEW_ANCHOR: {
              target: "IIThirdParty",
            },
            BACK: {
              target: "InitAuthWithII",
            },
          },
        },
        IIThirdParty: {
          invoke: {
            src: "signInWithIIService",
            id: "signInWithIIService",
            onDone: {
              // target: "CheckRegistrationStatus",
              actions: "assignAuthSession",
            },
          },
        },
        // CheckRegistrationStatus: {
        //   invoke: {
        //     src: "checkRegistrationStatus",
        //     id: "checkRegistrationStatus",
        //     onDone: { target: "End", actions: "assignRegistrationStatus" },
        //   },
        // },
        IIConnectAnchor: {
          on: {
            CONNECT_RETRY: {
              target: "IIConnectAnchorCode",
            },
            BACK: {
              target: "IICreateNewNFID",
            },
          },
        },
        IIConnectAnchorCode: {
          on: {
            BACK: {
              target: "IIConnectAnchor",
            },
          },
        },
        IIRecoveryPhrase: {
          on: {
            RECOVER_II_SUCCESS: {
              target: "TrustDevice",
            },
            BACK: {
              target: "IICreateNewNFID",
            },
          },
        },
        TrustDevice: {},
        End: {
          type: "final",
          data: (context) => {
            return context.authSession
          },
        },
      },
    },
    {
      actions: {
        assignAnchor: assign((context, event) => {
          console.log({ event })
          return { anchor: event.anchor }
        }),
        assignAuthSession: assign({
          authSession: (_, event) => {
            console.debug("AuthWithII assignAuthSession", {
              authSession: event.data,
            })
            return event.data
          },
        }),
        // assignRegistrationStatus: assign({
        //   isRegistered: (_, event) => event.data,
        // }),
      },
      guards: {},
      services: {
        // @ts-ignore
        signInWithIIService: async (context, event) => {
          console.debug("AuthWithII signInWithIISerivce", {
            context,
            event,
          })
          const response = await signinWithII()
          console.log({ response })
          return response
        },
        // checkRegistrationStatus: async (context) => {
        //   console.log({ context })
        //   try {
        //     const profile = await fetchProfile()
        //     console.debug("checkRegistrationStatus", { profile })
        //     return true
        //   } catch (error: any) {
        //     if (error.code === 404) {
        //       return false
        //     }
        //     throw error
        //   }
        // },
      },
    },
  )

export type AuthWithIIActor = ActorRefFrom<typeof AuthWithIIMachine>

export default AuthWithIIMachine
