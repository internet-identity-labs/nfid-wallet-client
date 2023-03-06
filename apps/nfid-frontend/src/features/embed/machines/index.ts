import { map } from "rxjs"
import { createMachine, assign } from "xstate"

import { checkIsIframe } from "@nfid-frontend/utils"
import { isDelegationExpired } from "@nfid/integration"

import EmbedControllerMachine from "frontend/features/embed-controller/machine"
import { AuthSession } from "frontend/state/authentication"
import AuthenticationMachine from "frontend/state/machines/authentication/authentication"
import TrustDeviceMachine from "frontend/state/machines/authentication/trust-device"

import { EmbedConnectAccountMachine } from "../../embed-connect-account/machines"
import { RPCMessage, rpcMessages, RPCResponse } from "../rpc-service"

type NFIDEmbedMachineContext = {
  authSession?: AuthSession
  rpcMessage?: RPCMessage
  error?: any
}

// TODO:
// - load from url
const mockContext = {
  appMeta: {
    name: "Rarible SDK Example",
    logo: "https://app.rarible.com/favicon.ico",
    url: "rarible.com",
  },
  authRequest: {
    hostname: "http://localhost:3000",
  },
}

type Events =
  | { type: "CONNECT_ACCOUNT"; data: RPCMessage }
  | { type: "SEND_TRANSACTION"; data: RPCMessage }
  | { type: "SIGN_TYPED_DATA"; data: RPCMessage }

type Services = {
  AuthenticationMachine: {
    data: AuthSession
  }
  CheckoutMachine: {
    data: RPCResponse
  }
}

export const NFIDEmbedMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QDkBiBJAIgUQLYCNIBZAQwGMALASwDswA6AJTBIgE8BiAYQHlllsXACoB9AIJdeAVWRCA2gAYAuolAAHAPawqAFyoaaqkAA9EAZgCsZ+hYUAOAJwA2AOxOnAJgsO7TiwBoQNkQnR3ofABYoiwBGFxczJwcLAF8UwLQsPEIIUkpaBmZWTl5+QVEJaVk5GJUkEE1tPQMjUwQnMwd6MwUIuxjnSwcHDxdA4IQzMLs7COTZnzcXCLSMjBwCYnJqOiYWdg4AZWxkTBEhRjFkQ4khdD5FOvUtXX1DeraHFwtwrz7bMweJxxBzjRAxMwuegRCwuL52BQOKYKBReVYgTIbHJ5HaFfacY6nc6Xa63e7IGpPBovZrvUBtGIouz0YFIpHuHoDUFBRAAWmB9BifWGcQsrk6MScK3SGPW2S2+V2YgArjoKGAaHoyCRaTiChwIAYGLQAG4aADWDBIqvVmqo2p0YEeRkarxaH0QChZflmMVsdjMEQ8nWBYIQvKm3UlCkBo0csQs0rWWU2uW2BXoXAMdDIOjEZDIGmVmoNRvopotDCzNBzeYLRc1hzAACcTfancoXTS3q1zIz6EDIWZhz4gZEwx4fNDLMCPI4PDEZnZ0Zj5WnFQwmzQIEJmyQaLByLTS7sK5b6Fud3uD0e3k3W+3nfVXbTewg7F56AonL12TF--EYYWJO3SJBELgInOrIeCucqpnquyXru+6HrmbwcC2zYaM29BqAANjqABm2G4BeGpXiht4GPebZkB2VIvj2HoIDEC4xN0XxzIiET2BEkphskUIjMOwYeBEfgDKk6I0BoEBwEYq7wemdBdk0TH0nyEJON08QQiMXGeDEYYRsGNhmBCfocsGbhScmWIKriezFKpbp0iY5h2FCMKsREw5WKxfrGdYiSTh4vQiZ5MJ+LBKbYspDDYM2WHNi5r7MdGHjdP0oQ-jxH4KEZPLvuxYmhBCYkWBYviBjF9nro5KpqhqWo6m8CFgKl6nueGMw6S4eliQ434LmYxnBtpMYQuBlVDfptVru1mbZmAub5oWxY6J17oaeG3yClpqJJJVw5jEVUrWJEUUuECYXifNSkbmR27ITeaHbdSanvW0lg-LlgLfCMH76QJoz0BB-yzG4CjxGYaRpEAA */
  createMachine(
    {
      tsTypes: {} as import("./index.typegen").Typegen0,
      schema: {
        events: {} as Events,
        context: {} as NFIDEmbedMachineContext,
        services: {} as Services,
      },
      id: "NFIDEmbedMachine",
      initial: "CheckAuthState",
      states: {
        CheckAuthState: {
          always: [
            { target: "AuthenticationMachine" },
            { target: "Ready", cond: "isAuthenticated" },
          ],
        },
        Ready: {
          invoke: {
            onError: "Error",
            src: () =>
              rpcMessages.pipe(
                map(({ data, origin }) => {
                  switch (data.method) {
                    case "eth_accounts":
                      return { type: "CONNECT_ACCOUNT", data, origin }
                    case "eth_sendTransaction":
                      return { type: "SEND_TRANSACTION", data, origin }
                    case "eth_signTypedData_v4":
                      return { type: "SIGN_TYPED_DATA", data, origin }
                    default:
                      throw new Error(`Unknown method: ${data.method}`)
                  }
                }),
              ),
          },
          on: {
            CONNECT_ACCOUNT: [
              { target: "ConnectAccount", cond: "isAuthenticated" },
              // TODO:
              // - store rpc message for later handling
              // - replay rpc message after authentication
              { target: "AuthenticationMachine", actions: "assignRPCMessage" },
            ],
            SEND_TRANSACTION: [
              { target: "EmbedController", cond: "isAuthenticated" },
              { target: "AuthenticationMachine", actions: "assignRPCMessage" },
            ],
            SIGN_TYPED_DATA: [
              { target: "EmbedController", cond: "isAuthenticated" },
              { target: "AuthenticationMachine", actions: "assignRPCMessage" },
            ],
          },
        },
        Error: {},

        EmbedController: {
          invoke: {
            src: "EmbedControllerMachine",
            id: "EmbedControllerMachine",
            data: (context, event) => ({
              ...context,
              rpcMessage: event.data,
              appMeta: mockContext.appMeta,
              authRequest: mockContext.authRequest,
            }),
            onDone: { target: "Ready", actions: "sendRPCResponse" },
          },
        },

        AuthenticationMachine: {
          invoke: {
            src: "AuthenticationMachine",
            id: "authenticate",
            onDone: { target: "TrustDevice", actions: "assignAuthSession" },
            data: () => mockContext,
          },
        },

        TrustDevice: {
          invoke: {
            src: "TrustDeviceMachine",
            id: "trustDeviceMachine",
            onDone: [
              {
                target: "Ready",
                actions: ["nfid_authenticated"],
              },
            ],
            data: () => ({ isIframe: checkIsIframe() }),
          },
        },

        ConnectAccount: {
          invoke: {
            src: "EmbedConnectAccountMachine",
            id: "EmbedConnectAccountMachine",
            data: (context, event) => ({
              authSession: context.authSession,
              rpcMessage: event.data,
              appMeta: mockContext.appMeta,
              authRequest: mockContext.authRequest,
            }),
            onDone: { target: "Ready", actions: "sendRPCResponse" },
          },
        },
      },
    },
    {
      actions: {
        assignAuthSession: assign((_, event) => ({
          authSession: event.data,
        })),
        assignRPCMessage: assign((context, event) => ({
          rpcMessage: event.data,
        })),
        nfid_authenticated: () => {
          console.debug("nfid_authenticated")
          window.parent.postMessage(
            { type: "nfid_authenticated" },
            "http://localhost:3000",
          )
        },
        sendRPCResponse: (_, event) => {
          console.debug("sendRPCResponse", { event })
          window.parent.postMessage(event.data, "http://localhost:3000")
        },
      },
      guards: {
        isAuthenticated: (context) =>
          !isDelegationExpired(context.authSession?.delegationIdentity),
      },
      services: {
        AuthenticationMachine,
        EmbedConnectAccountMachine,
        TrustDeviceMachine,
        EmbedControllerMachine,
      },
    },
  )
