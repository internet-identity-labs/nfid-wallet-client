import { assign, ActorRefFrom, createMachine, send } from "xstate"

import { Account } from "@nfid/integration"

import { fetchAccountLimitService } from "frontend/integration/app-config/services"
import {
  createAccountService,
  fetchAccountsService,
} from "frontend/integration/identity-manager/services"
import { fetchDelegateService } from "frontend/integration/internet-identity/services"
import { AuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
  ThirdPartyAuthSession,
} from "frontend/state/authorization"

type AccountAction = "CREATE_ACCOUNT" | "SELECT_ACCOUNT" | "PRESENT_ACCOUNTS"

export const selectAccountAction = (
  accountsAmount: number,
  accountsLimit?: number,
): AccountAction => {
  console.debug("selectAccountAction", { accountsAmount, accountsLimit })
  if (accountsAmount === 0) {
    console.debug("selectAccountAction CREATE_ACCOUNT")
    return "CREATE_ACCOUNT"
  }
  if (accountsAmount === 1 && accountsLimit && accountsLimit <= 1) {
    console.debug("selectAccountAction SELECT_ACCOUNT")
    return "SELECT_ACCOUNT"
  }
  console.debug("selectAccountAction PRESENT_ACCOUNTS")
  return "PRESENT_ACCOUNTS"
}

export interface AuthorizationMachineContext {
  appMeta?: AuthorizingAppMeta
  authSession: AuthSession
  authRequest: AuthorizationRequest
  accountsLimit?: number
  accounts?: Account[]
}

export type AuthorizationMachineEvents =
  | { type: "done.invoke.fetchAccountLimitService"; data: number }
  | { type: "done.invoke.fetchAccountsService"; data: Account[] }
  | { type: "done.invoke.fetchDelegateService"; data: ThirdPartyAuthSession }
  | {
      type: "done.invoke.createAccountService"
      data: { accountId: Account["accountId"] }
    }
  | { type: "SINGLE_ACCOUNT" }
  | { type: "MULTI_ACCOUNT" }
  | { type: "CREATE_ACCOUNT" }
  | { type: "SELECT_ACCOUNT"; data: { accountId: Account["accountId"] } }
  | { type: "PRESENT_ACCOUNTS" }

export interface Schema {
  events: AuthorizationMachineEvents
  context: AuthorizationMachineContext
}

const AuthorizationMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgewE4EsAvMAOgGV1ld0BiCbAO1PwYDdsBrUgMzHQGNMAQQAOIgKqwwuADL4AtvnSJQI7LCX5GKkAA9EAWgDsAFhIBWEwAYAbEYCMAZkcmjNkwE57AGhABPRAAmG0CLKytHW0DAoyNHcyMAX0TfNCw8IlJxBgAbbH4OGnEAORkAeQBhAGkdNQ10LQYdfQRHI3MLIy9zcwAOG3tzexMbG18AhFGOmMcbZw8jXqNAkxNk1IwcAmISGWwoFjpGZjZOUjyDpqQQOs1ta5aXUMWQq3t3WY9XccQTQN6SI4nPFeuEXPMbOsQGktpkSAAxPiCIT8fjYVAMdCwI5MEgsdhcEi8ATCVHozHwa63Br3UCPSIkXoeHrLf7Wax2H4Id7TcwRN7-QbRKEwjI7REklFojFYmgVABKAFEhAAVRUAfSEFQqZRKKtq6juVzpiBCjhINl69hWMV6MQ+XJW9gsIxG7V65g8ViWaxS0M2YtIEuRZJl2LIipkioqKs12t1xX1VMNNONelNKwtHktNisQ1GphMXL+NhIJgS-16vRM9iM4XsIoD2yDSNJ0opNAACkqI4m4zq9WQDfVGs1TcNGbWPIFvSXc44uc4zOF+VYayZ+rNIX7Rc2SBVcGBkOgwFLybR6Lj8WcSPxD8fT6HMcOjWPuYE+SRa113oEPB5HECewPEXFwSBXSI12GTdRkbdI907Q8pExM8wxoCMoxjfsEyTVQU1HB5EGrMxHA8JkHFIusXBA-xfmCMsKyrata3rODYR2RC4DAFCn1lBVlTVbC9RfVM33sPNQhWcwQhnGdaxGUDlzBcJ1xg7cNnguEAHE+AAETAHIwCgY9GhxE4CR4Vt9MM4yTxEgiTQQXo2gsfo+WcOxnPsHxaMmGwPBILw3lzKx3WA5I-QYbAIDgHRdzhCgqGUZMR1pdMEGMAFolCmxzCAmtHA9cwuWWEhAmcZwrA-Bxcu8tjAxIbI8gKey0paAwgLLUjrWCaxnE9TlfNygEFksADnDcGJzHqvc9kuVq00eTqegSaxBgWas3C5cx4lcvpRhnaTgmmncmzhYM23PSk8NSxagksRk8rmax83sKtFyq8Dwj-EY3n-d5fQ09jSAPI8T1Q58UtfQiEGzIwLRZOY4i6L4i18mcAssdwyPElx+gAma4U45D0AhrEFrfZzQmrO1gTIvKgUXGIwiq0wP380iTqBhqdPQayjJMtLqQc9K3HNG0qOZZj3t8naOj6fbXiO3LCZ2RUGAgCmYfE9wLVGGtYlBZyyK5UZzRrN4a3+wDnNVsAtccgxxMkmc3Dy4YnCKrkDCsEg3FGS011MT3QQbCKgA */
  createMachine(
    {
      tsTypes: {} as import("./authorization.typegen").Typegen0,
      schema: { events: {}, context: {} } as Schema,
      id: "authorize",
      initial: "Start",
      states: {
        Start: {
          invoke: {
            src: "fetchAccountLimitService",
            id: "fetchAccountLimitService",
            onDone: [
              {
                actions: "assignUserLimit",
                target: "FetchAccounts",
              },
            ],
          },
        },
        FetchAccounts: {
          invoke: {
            src: "fetchAccountsService",
            id: "fetchAccountsService",
            onDone: [
              {
                actions: ["assignAccounts", "handleAccounts"],
              },
            ],
          },
          on: {
            CREATE_ACCOUNT: "CreateAccount",
            SELECT_ACCOUNT: "GetDelegation",
            PRESENT_ACCOUNTS: "PresentAccounts",
          },
        },
        CreateAccount: {
          invoke: {
            src: "createAccountService",
            id: "createAccountService",
            onDone: [
              {
                target: "GetDelegation",
              },
            ],
          },
        },
        PresentAccounts: {
          on: {
            SELECT_ACCOUNT: {
              target: "GetDelegation",
            },
            CREATE_ACCOUNT: "CreateAccount",
          },
        },
        GetDelegation: {
          invoke: {
            src: "fetchDelegateService",
            id: "fetchDelegateService",
            onDone: "End",
            onError: "PresentAccounts",
          },
        },
        End: {
          type: "final",
          data: (context, event: { data: ThirdPartyAuthSession }) => event.data,
        },
      },
    },
    {
      actions: {
        assignUserLimit: assign({
          accountsLimit: (context, event) => event.data,
        }),
        assignAccounts: assign({ accounts: (context, event) => event.data }),
        handleAccounts: send((context, event) => ({
          type: selectAccountAction(event.data.length, context.accountsLimit),
          data: event.data[0]?.accountId,
        })),
      },
      services: {
        fetchAccountLimitService,
        fetchAccountsService,
        fetchDelegateService,
        createAccountService,
      },
    },
  )

export type AuthorizationActor = ActorRefFrom<typeof AuthorizationMachine>

export default AuthorizationMachine
