import { registerRequestAccountsHandler } from "@nfid/accounts"
import { ActorRefFrom, assign, createMachine } from "xstate"

import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import AuthenticationMachine from "../authentication/authentication"

interface Context {
  appMeta?: AuthorizingAppMeta
  authSession?: AuthSession
  isLoading?: boolean
  accounts?: string[]
}

let accounts: string[] = []

// Definition of events usable in the machine.
type Events =
  | {
      type: "done.invoke.AuthenticationMachine"
      data: AuthSession
    }
  | { type: "SUCCESS" }
  | { type: "REJECT" }
  | { type: "END" }

export const RequestAccountsMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QCUwEcCucAuBBAxvgPYYB22sACgE5EBuAlhGNQHSoCGEAngMQRFSYVg1J0iAa2HUwUBrGwtUmHAWJkKACQ6kIAGxYBtAAwBdRKAAORWA2wNBFkAA9EAFgDMADlbG-xgEYAVgAmAJCvbwBOABoQbkQAgIB2X38ggDYvN2NM5I9kgF9CuOUsBTUScipaRmY2XAxsAAswcgZ8DkV+QWFRcSlWRpa2+077QQBZDnxm0TATcyQQa1sJ0idXBCSvENYAr2S3KK8o5ICMkNj4xCiPViCko48PHM8gqIDi0vRyvEIqhQaPQmCx2L9VACNLBeABlACqAGFEQBRWGwxZOVZ2BwbZZbC6eVjJILJZJREIeXIUuIJBB3B5PTyvYzvT7FEogUhEZjwZZlSHqarAupgzg8LE2HGOfHuEK0xCRNJ+ALGKIZAJnNxFTkCipQ4W1UENJqtdrjMCSta4zaIZJeDL7Q5BNUZDJnEJueU3BBK-yBV2ao46n4qfVCoFG+rgsP-CN8qxS9a27ZuDWsY5RLPqjLGc4nBXbFIPf0ug7uu5ub4gPVxwE1EHRlG6K3SvGgAlkx13fIUryBDLJd2Fp7K4whIceXP9o7V2uVaEi42t5OyhAAWgyhc3HMKQA */
  createMachine(
    {
      context: {} as Context,
      tsTypes: {} as import("./request-accounts.typegen").Typegen0,
      schema: { events: {} as Events },
      initial: "Ready",
      states: {
        Ready: {
          invoke: {
            src: "registerRequestAccountsHandler",
            id: "registerRequestAccountsHandler",
            onDone: [
              {
                target: "Authenticate",
              },
            ],
          },
        },
        Authenticate: {
          invoke: {
            src: "AuthenticationMachine",
            id: "AuthenticationMachine",
            onDone: [
              {
                target: "RequestAccounts",
                actions: "assignAuthSession",
              },
            ],
          },
        },
        RequestAccounts: {
          on: {
            SUCCESS: {
              target: "End",
              actions: "",
            },
          },
        },
        End: {
          type: "final",
        },
      },
      id: "RequestAccountsProvider",
    },
    {
      actions: {
        assignAuthSession: assign((_, event) => ({
          authSession: event.data,
        })),
      },
      services: {
        async registerRequestAccountsHandler() {
          const params = await registerRequestAccountsHandler(() => {
            return new Promise((resolve) => {
              setInterval(() => {
                accounts.length &&
                  resolve({
                    status: "SUCCESS",
                    accounts: accounts,
                  })
              }, 1000)
            })
          })
          console.debug("registerRequestAccountsHandler", { params })
          return params
        },
        AuthenticationMachine,
      },
      guards: {},
    },
  )

export type RequestAccountsMachineActor = ActorRefFrom<
  typeof RequestAccountsMachine
>

export type RequestAccountsMachineType = typeof RequestAccountsMachine
