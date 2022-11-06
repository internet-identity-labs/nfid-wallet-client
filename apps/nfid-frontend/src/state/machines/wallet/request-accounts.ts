import { registerRequestAccountsHandler } from "@nfid/accounts"
import { ActorRefFrom, assign, createMachine } from "xstate"

import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import AuthenticationMachine from "../authentication/authentication"

interface Context {
  appMeta?: AuthorizingAppMeta
  authSession?: AuthSession
  requestAccounts?: string
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
  | {
      type: "done.invoke.registerRequestAccountsHandler"
      data: string
    }
  | { type: "SUCCESS" }
  | { type: "REJECT" }
  | { type: "END" }

/** @xstate-layout N4IgpgJg5mDOIC5QCUwEcCucAuBBAxvgPYYB22sACgE5EBuAlhGNQHSoCGEAngMQRFSYVg1J0iAa2HUwUBrGwtUmHAWJkKACQ6kIAGxYBtAAwBdRKAAORWA2wNBFkAA9EAFgDMAdlYBOf75evh6+AGweAEweABwArAA0INyIwayxAIzpXh7pwemhGR4AvkWJylgKaiTkVLSMzGy4GNgAFmDkDPgcivyCwqLiUqxNre32XfaCALIc+C2iYCbmSCDWtpOkTq4ImdERrOnRXrHGob7psb5uEdGJyQipGVk5eQXpxaUg5aqE1RQ09CYLHY6AqeF+GlgvAAygBVADC8IAotDoUsnGs7A5NittvlPKxjl5oulrmFYns3HcUh40plsrkcm8Pp9SERmPAVt9KhCagD6sDODwMTYsY5ce4ItSEHs-AErjEIp49h8yqCfuo+XUgY1mm0OhMwCL1titohiaEDkc3F4lekIr5onFpbL5QrKYrVV91TzNf9tQ0QSpfX9OVZRRszTs3KF0qw3AEvEnoiFDlSkoh6WljDmMm5Kflom4Smrg+C-bVAYGkbpjWKcaA8UnLcFjh5jG4Y7EKdKszmc+9zl57bavdzy6H+Tq65GJQgALShaWLkolIA */
const RequestAccountsMachine = createMachine(
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
              actions: "assignRequestAccountsRequest",
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
      assignRequestAccountsRequest: assign({
        requestAccounts: (_, event) => event.data,
      }),
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

export default RequestAccountsMachine

export type RequestAccountsMachineActor = ActorRefFrom<
  typeof RequestAccountsMachine
>

export type RequestAccountsMachineType = typeof RequestAccountsMachine
