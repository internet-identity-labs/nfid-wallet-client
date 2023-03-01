import { ActorRefFrom, assign, createMachine } from "xstate"

import { Account } from "@nfid/integration"

import {
  createAccountService,
  fetchAccountsService,
} from "frontend/integration/identity-manager/services"
import { AuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

import { RPCMessage, RPCResponse } from "../../embed/rpc-service"
import { ConnectAccountService } from "../services"

export type EmbedConnectAccountMachineContext = {
  appMeta?: AuthorizingAppMeta
  authSession?: AuthSession
  authRequest: AuthorizationRequest
  rpcMessage?: RPCMessage
  error?: any
  accounts?: Account[]
  accountsLimit?: number
}

type Events =
  | { type: "done.invoke.ConnectAccountService"; data: RPCResponse }
  | {
      type: "done.invoke.createAccountService"
      data: { hostname: string; accountId: string }
    }
  | { type: "done.invoke.fetchAccountsService"; data: Account[] }
  | { type: "done.invoke.fetchAccountLimitService"; data: number }
  | { type: "CREATE_ACCOUNT" }
  | { type: "SELECT_ACCOUNT"; data: { accountId: Account["accountId"] } }
  | { type: "PRESENT_ACCOUNTS" }
  | { type: "CONNECTION_DETAILS" }
  | {
      type: "CONNECT_WITH_ACCOUNT"
      data: { hostname: string; accountId: string }
    }
  | { type: "CONNECT_ANONYMOUSLY" }
  | { type: "BACK" }

export const EmbedConnectAccountMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QDkBiBJAIgUQLYCNIBZAQwGMALASwDswA6AJTBIgE8BiAYQHlllsXACoB9AIJdeAVWRCA2gAYAuolAAHAPawqAFyoaaqkAA9EAZgCsZ+hYUAOAJwA2AOxOnAJgsO7TiwBoQNkQnR3ofABYoiwBGFxczJwcLAF8UwLQsPEIIUkpaBmZWTl5+QVEJaVk5GJUkEE1tPQMjUwQnMwd6MwUIuxjnSwcHDxdA4IQzMLs7COTZnzcXCLSMjBwCYnJqOiYWdg4AZWxkTBEhRjFkQ4khdD5FOvUtXX1DeraHFwtwrz7bMweJxxBzjRAxMwuegRCwuL52BQOKYKBReVYgTIbHJ5HaFfacY6nc6Xa63e7IGpPBovZrvUBtGIouz0YFIpHuHoDUFBRAAWmB9BifWGcQsrk6MScK3SGPW2S2+V2YgArjoKGAaHoyCRaTiChwIAYGLQAG4aADWDBIqvVmqo2p0YEeRkarxaH0QChZflmMVsdjMEQ8nWBYIQvKm3UlCkBo0csQs0rWWU2uW2BXoXAMdDIOjEZDIGmVmoNRvopotDCzNBzeYLRc1hzAACcTfancoXTS3q1zIz6EDIWZhz4gZEwx4fNDLMCPI4PDEZnZ0Zj5WnFQwmzQIEJmyQaLByLTS7sK5b6Fud3uD0e3k3W+3nfVXbTewg7F56AonL12TF--EYYWJO3SJBELgInOrIeCucqpnquyXru+6HrmbwcC2zYaM29BqAANjqABm2G4BeGpXiht4GPebZkB2VIvj2HoIDEC4xN0XxzIiET2BEkphskUIjMOwYeBEfgDKk6I0BoEBwEYq7wemdBdk0TH0nyEJON08QQiMXGeDEYYRsGNhmBCfocsGbhScmWIKriezFKpbp0iY5h2FCMKsREw5WKxfrGdYiSTh4vQiZ5MJ+LBKbYspDDYM2WHNi5r7MdGHjdP0oQ-jxH4KEZPLvuxYmhBCYkWBYviBjF9nro5KpqhqWo6m8CFgKl6nueGMw6S4eliQ434LmYxnBtpMYQuBlVDfptVru1mbZmAub5oWxY6J17oaeG3yClpqJJJVw5jEVUrWJEUUuECYXifNSkbmR27ITeaHbdSanvW0lg-LlgLfCMH76QJoz0BB-yzG4CjxGYaRpEAA */
  createMachine(
    {
      tsTypes: {} as import("./index.typegen").Typegen0,
      schema: {
        events: {} as Events,
        context: {} as EmbedConnectAccountMachineContext,
      },
      id: "EmbedConnectAccountMachine",
      initial: "Start",
      states: {
        Start: {
          type: "parallel",
          states: {
            FetchAccountLimit: {
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
                    actions: ["assignAccounts"],
                  },
                ],
              },
            },
          },
          on: {
            CONNECTION_DETAILS: "ConnectionDetails",
            CONNECT_WITH_ACCOUNT: "ConnectWithAccount",
            CONNECT_ANONYMOUSLY: "ConnectAnonymously",
          },
        },

        Error: {},

        ConnectionDetails: {
          on: {
            BACK: "Start",
          },
        },

        ConnectWithAccount: {
          invoke: {
            src: "ConnectAccountService",
            id: "ConnectAccountService",
            onDone: "End",
          },
        },

        ConnectAnonymously: {
          invoke: {
            src: "createAccountService",
            id: "createAccountService",
            onDone: [
              {
                target: ["ConnectWithAccount"],
              },
            ],
          },
        },

        End: {
          type: "final",
          data: (context, event: { data: EmbedConnectAccountMachineContext }) =>
            event.data,
        },
      },
    },
    {
      actions: {
        assignUserLimit: assign({
          accountsLimit: (context, event) => event.data,
        }),
        assignAccounts: assign({ accounts: (context, event) => event.data }),
      },
      guards: {},
      services: {
        ConnectAccountService,
        fetchAccountsService,
        createAccountService,
      },
    },
  )

export type NFIDConnectAccountActor = ActorRefFrom<
  typeof EmbedConnectAccountMachine
>

export default EmbedConnectAccountMachine
