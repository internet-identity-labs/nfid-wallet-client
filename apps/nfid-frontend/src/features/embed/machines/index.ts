import { map } from "rxjs"
import { createMachine, assign } from "xstate"

import { checkIsIframe } from "@nfid-frontend/utils"
import { isDelegationExpired } from "@nfid/integration"

import CheckoutMachine from "frontend/features/checkout/machine"
import SignMessageMachine from "frontend/features/sign-message/machine"
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
  /** @xstate-layout N4IgpgJg5mDOIC5QDkBiBJAIgUQLYCNIBZAQwGMALASwDswA6AYQrDIGsBBAVwBcKBlHiR5gAxAG0ADAF1EoAA4B7WFR5VFNOSAAeiAEwBGAGz1JRvQFZJAdmsBOAMxGAHABYjAGhABPRI-qu1kYWzgYhdnrWkhYWAL6xXmhYeIQQpJS0DMysnLwCQiISBrJIIEoqahpaugiGJmaWNvZObp4+iEaSzvTWznaSdhbBRsZ2rvGJGDgExOTUdPQASmAkEN6iYABOm4qb9PIANsIAZru49EnTqenzDMur3gi0AG6KZMLqNFLS31rlqp9qh0LA56CCDA4bAZJNFbBYvL4EHZBvRIXUDIZmnEEiBLilZhkFvc1qJGAB5ZDIbCMAAqAH0OIxyQBVZA036lf6VTSlGrBUHgyHWaGw6zw9oIPquAKuCyuAyOYzGIwTXFTfFpOaZJYrEnkynU+mMlls8TFP7KAFVXnAgUOCFQmEWOEIxAOPSSegGezWBy2Vz2+3e1V4maawl3XXrfjYZCYOk0xYcZD8Rk09AUjkKS3coEIflgwOO0XixFiz2uCJ6D0BoaSYM40PXLVEqOiGNxhNJlNpjPIM0lbMVQE2-MgwsO4VOl0S+UmIzutzOByuUIhBzYybJMM3bXE6PoADiyATAE0AArYeOYDg0jhZso5kegPnjwXF51i135syF-p9PRnBGSsQ3VHcW0jB52yPE8aQvK86RvO8BwtYdrRfW0JyFEVP1LfQ9FBaw9GCUI7DcSQ9EccZGzA5sI3obg+DAGg1HebldzoUQIA0BgXkUNgGBIPJmNY4QwAfLlnx0RADFcSIAj9BcjF9FdHG-AjpUiIxOiGBw7GVdxQO3OjbnoGlNi4WAeEwMBnioMgxG4hY+IE+geAsqybLshyOPEmRUKtHkMIQWS-XoCIFRGSEgIib9QgCZFEucNwgjsYUjKuAlTMYDQ6DIHgODIMhFC4FiuJ4+gXIYDUcpoPKCqKkqWN8iSn3Q6SEGFUFnAsMYQRCNwrGsOKYXCqsYgMb0jHcawMo1XymBYdgSp4XzyucmhXlc7Jlt4Fr-M5Nqgo65xRvsIwxghIIrAu79gmsUw9OhCF9LCZS5vA+idrYFa1q2HY9kOE4zkWnJfog1q0OOmpZPkgMgicFTKwcO6iPCmJUqcAxnEsBwPpM7V+CoKAaBpbx5EgTBhBIAA1Vx1t4zb+IYImSaIOBYBIGB9sHR8obzWwHsiDcFXInHvwsCFTB6wY+nBHqVRo4yssJ4nSfJynqbpjZtl2fYjh4U5NnOVmaHZ2BOe5iGDqHQK81hh74aUpG1IlEE9C9C7KP0sx3El+IcRoRQIDgLQmxVugAtzUcAFo2kROP8YjrIltyPhBDEqOpJqOTvzI+g+ndatJAcIC6zsJPw1M-cs-anPXGldxnF6ZE+gutuJeXP8Blh7TAkrhbsF1zZa+hmSXE9YjnQuyahiGYa3eCUwPR6tw9FlfkB4ghjhJY+yPg0XzR-tkuTEL5dtOb6tlPU90ekFICiJXaet-o8zLOs2z7LAY-R2MU76BT1SrPYYC9EQokLuvTockvaTVftlXKrAGrFVKjwX+wVoT2gUmKU6ykHD2nXiNOwpgLCYmdOvOUIElaZSrtqb64MIzoI6pg4hktnTRFkkuYwqMDAKQIuvNKNYFTwNViTMmFMIBUyEHTJhMMS68PhiEMwKkMSuAloYL0soeqS3rOYC6AdYhAA */
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
              { target: "CheckoutMachine", cond: "isAuthenticated" },
              { target: "AuthenticationMachine", actions: "assignRPCMessage" },
            ],
            SIGN_TYPED_DATA: [
              { target: "SignTypedDataV4", cond: "isAuthenticated" },
              { target: "AuthenticationMachine", actions: "assignRPCMessage" },
            ],
          },
        },
        Error: {},

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
            onDone: { target: "Ready", actions: ["sendRPCResponse"] },
          },
        },

        CheckoutMachine: {
          invoke: {
            src: "CheckoutMachine",
            id: "CheckoutMachine",
            data: (context, event) => ({
              authSession: context.authSession,
              rpcMessage: event.data,
              appMeta: mockContext.appMeta,
              authRequest: mockContext.authRequest,
            }),
            onDone: { target: "Ready", actions: "sendRPCResponse" },
            onError: { target: "Error", actions: "assingError" },
          },
        },

        SignTypedDataV4: {
          invoke: {
            src: "SignMessageMachine",
            id: "SignMessageMachine",
            onDone: { target: "Ready", actions: ["sendRPCResponse"] },
            onError: { target: "Error", actions: "assingError" },
            data: (context, event) => ({
              authSession: context.authSession,
              rpcMessage: event.data,
              appMeta: mockContext.appMeta,
              authRequest: mockContext.authRequest,
            }),
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
        // FIXME:
        // @ts-ignore
        assingError: assign({
          error: (context: any, event: any) => {
            return event.error
          },
        }),
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
        CheckoutMachine,
        EmbedConnectAccountMachine,
        SignMessageMachine,
        TrustDeviceMachine,
      },
    },
  )
