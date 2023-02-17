// FIXME:
// import from @nfid/integration
import { ActorRefFrom, createMachine } from "xstate"

import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import { RPCMessage, RPCResponse } from "../../embed/rpc-service"
import { ConnectAccountService } from "../services"

type EmbedConnectAccountMachineContext = {
  appMeta?: AuthorizingAppMeta
  authSession?: AuthSession
  rpcMessage?: RPCMessage
  error?: any
}

type Events =
  | { type: "done.invoke.ConnectAccountService"; data: RPCResponse }
  | { type: "CONNECTION_DETAILS" }
  | { type: "CONNECT_WITH_ACCOUNT"; data: string }
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
      initial: "Ready",
      states: {
        Ready: {
          on: {
            CONNECTION_DETAILS: "ConnectionDetails",
            CONNECT_WITH_ACCOUNT: "ConnectWithAccount",
          },
        },
        Error: {},

        ConnectionDetails: {
          on: {
            BACK: "Ready",
          },
        },

        ConnectWithAccount: {
          invoke: {
            src: "ConnectAccountService",
            id: "ConnectAccountService",
            onDone: "End",
            data: (context) => ({
              authSession: context.authSession,
              event: context.rpcMessage,
            }),
          },
        },
        ConnectAnonymously: {},

        End: {
          type: "final",
          data: (context, event: { data: EmbedConnectAccountMachineContext }) =>
            event.data,
        },
      },
    },
    {
      actions: {},
      guards: {},
      services: {
        ConnectAccountService,
      },
    },
  )

export type NFIDConnectAccountActor = ActorRefFrom<
  typeof EmbedConnectAccountMachine
>

export default EmbedConnectAccountMachine
