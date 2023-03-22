import { createMachine, assign } from "xstate"

import { checkIsIframe } from "@nfid-frontend/utils"
import { isDelegationExpired } from "@nfid/integration"

import EmbedControllerMachine from "frontend/features/embed-controller/machine"
import { AuthSession } from "frontend/state/authentication"
import AuthenticationMachine from "frontend/state/machines/authentication/authentication"
import TrustDeviceMachine from "frontend/state/machines/authentication/trust-device"

import {
  EmbedConnectAccountMachine,
  EmbedConnectAccountMachineContext,
} from "../embed-connect-account/machines"
import { RPCMessage, RPCResponse, RPCReceiver } from "./services/rpc-receiver"

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
  EmbedConnectAccountMachine: {
    data: EmbedConnectAccountMachineContext
  }
  TrustDeviceMachine: {
    data: void
  }
  EmbedControllerMachine: {
    data: RPCResponse
  }
  RPCService: {
    data: void
  }
}

export const NFIDEmbedMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QDkBiBJAIgUQLYCNIBZAQwGMALASwDswA6AYQrDIGsBBAVwBcKBlHiR5gAxAG0ADAF1EoAA4B7WFR5VFNOSAAeiAEwBGAGz1JRvQFYAzFYuSLxq0asAaEAE9EByQHYAHPTGAJwGPs5BRn56egAsAL5xbmhYeIQQpJS0DMysnLwCQiISBrJIIEoqahpaugiGJmaWNnYOzs5unggGVkGmRj4xFoOSsUNWfglJGDgExOTUdPQASmAkEO6iYABOW4pb9PIANsIAZnu4ywAKjPzbAG5UZGBSpQrKquqaZbV+BgHjej8MWigyMdhiHX0Pgs9D8kiCfh8QSsBlCQUkxkmIGSMzSGQWDBWaw2jAA8shkNhGAAVAD6HEYZIAqshqS8tBUPtVvohfv8okCQRYwZIIR4vAN6EFrJIgSM-OjAXosTjUnNMosietRGSKVS6QzmazxCUOe8ql9QD8-vQAYLRiKxZ1flZ6A4rJJbGDQvYrCrpmr0vMsstVtr+NhkJhadSlhxkPwGdT0OT2WVORaarybXbgQ7wZCEDFoW6LAjpRZEaj-P6UrMgxrCWGNhGozG4wmkynkCbXuVzZ8swg+baBXnQQXxQh0b0IkY-sZK8MLLXceqCaHiaJ+OgAOLIGMATUu2GjmA41I4abelUHPOHObHQsdheBMPsQXRBgseiCemhRiroG+IhlqLZ7ge1LHqetLnpevZmre3JWtm-KAuOwqTp0PihKYZZ+AqRgxDEEQYkB9YgYsgaMBoPC7IchzbKIEAaAwtB3IobAMNRtH0YxWyUc8MiIVylo6Igf4GPQv5GCEoxlqEhZWHoroegiDi-iR3gxIBiTYgGFHBlR9Y0TQdGKAxTHbLs+xHKc5z0DxZl8dsgnXv2SFibU35-tJCqot0JFBP4r5mKYfg2E4ZaGH4DjkXiRkMNwfBgGZjzCJ8gnMax9DsZxDAkPkqVqGQwhCX2GZ3ihXTRX5ISolYQUhVOcK9C6so+OMFh2Ki8XriGyUsGlpUWll1l7Acxw8GcWwXIVKXDWV7mVch4k1b5gL1YFn7NZ06KunoRjzoC-T1T4Ph9Q2G7UlsXCwDwmBgA8TzZYseVcfQdF3Q9T2PGAbnCemA6rd5R0mH80IGMWCoqYpU4WJKEU2P+-QKjEsWXYJ9A3d9j3PWI422VNM0XF991439AMVcDXn6L+UlllYnUI-4dhGIWZaSPQAyftKirWM4mOJUwGh0GQPAcGQZCKFwZmvWxNAcR9TlixLUsy2ZVMiZm96IgEOHwmCkR-D+ha-G6kiWxiMTGLKv7KnpqqGY2Is0KrkvS7LPCbDsE12dNDkq6waue5riXLTTQ4+XodUBY1O1+IW3hc5WynogMejwj0ExYjQigQHAWhOwljba1Va0ALTs1OVdCy7OTsINghlWXIOIMCScxK6nU27ESrKZijsGSXG5ga3tNFsR9A6YiX5d9YThJ90sKhMMEQ2z40QrkPdYjyG2C+1s49Dk0MdGBi1iZ0EJERa+gJ4Qi5+GJbm+HXXG5OeZllH0DnlRwYERY7dE9L8BqSlpQPz8GCD0zRPTvwGkVRao1ErH3vAYTOMI7TQmRL+SsZtohuh6OfLSQJ+gGHgYsHG5NfpPFQdVP4CJCHoPnlAsIwUOYKmkodbqKJgr+EGBQ7Iotg4ew1jwOha1USAM2g1EBccza9G6giX4XdM5EVCAkBIQA */
  createMachine(
    {
      tsTypes: {} as import("./machine.typegen").Typegen0,
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
            id: "RPCService",
            src: "RPCService",
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
            onError: { target: "Error", actions: "assignError" },
          },
        },

        AuthenticationMachine: {
          invoke: {
            src: "AuthenticationMachine",
            id: "authenticate",
            onDone: { target: "TrustDevice", actions: "assignAuthSession" },
            onError: { target: "Error", actions: "assignError" },

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
            onError: { target: "Error", actions: "assignError" },
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
            onError: { target: "Error", actions: "assignError" },
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
        assignRPCMessage: assign((_, event) => ({
          rpcMessage: event.data,
        })),
        assignError: assign((_, event) => ({
          error: event.data,
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
    },
  )

export const services = {
  AuthenticationMachine,
  EmbedConnectAccountMachine,
  TrustDeviceMachine,
  EmbedControllerMachine,
  RPCService: RPCReceiver,
}
