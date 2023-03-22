import { createMachine, assign, ActorRefFrom } from "xstate"

import { PreparedSignatureResponse } from "@nfid/integration"

import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import { RPCMessage, RPCResponse, RPC_BASE } from "../embed/rpc-service"
import { MethodControllerService } from "./services/method-controller"
import { prepareSignature } from "./services/prepare-signature"
import { decodeRPCRequestService } from "./services/rpc-decode"
import { sendTransactionService } from "./services/send-transaction"
import { SignTypedDataService } from "./services/sign-typed-data"

export type EmbedControllerContext = {
  authSession: AuthSession
  appMeta?: AuthorizingAppMeta
  rpcMessage?: RPCMessage
  rpcResponse?: RPCResponse
  preparedSignature?: PreparedSignatureResponse
  data?: any
  method?: string
  error?: Error
}

type ErrorEvents =
  | {
      type: "error.platform.decodeRPCRequestService"
      data: Error
    }
  | {
      type: "error.platform.MethodControllerService"
      data: Error
    }

type Events =
  | ErrorEvents
  | { type: "SHOW_TRANSACTION_DETAILS" }
  | { type: "CLOSE" }
  | { type: "CANCEL" }
  | { type: "SIGN" }
  | { type: "BACK" }
  | { type: "BUY" }

export const EmbedControllerMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGEAWYDGBrA9gVwBcBZAQw1QEsA7MAOgAUAnMABxMZIIpytoBFMOCGABKYAI544BAMQQedagDccWOsIxDREqbAIBtAAwBdRKBY5YFLjzMgAHogCMAVgBMtACwB2NwDY-AGYXAE5vEMN-NwAaEABPZxcnWkNU1KcnN0DPQydAtwBfAti0TFxCUnJqOiZWdk5uXlq2ZgBlCigqTjxmOQVaZVU6FmYWsHbO7uYjUyQQCysbKjtHBCdPF1o3AA4I709Mtw3vQNiEhGDPWhCXQNcnAMNQl0NPIpL0bHxiMkoaWgAqgBJWgAGRwJGEjD6-0GalopS+FV+1UBIPBkLAjAQgwwDR4MxmdgW1kaK0Q3lCtBclM8fkOrzcMXiiHygRSTzubge-j8hiC7xAiPKPyq-2BCM+IpkrQAEgB5ADqAH0ACoiACCADlWhrkKqgfKtcq+ABRVUaoGg1pEuYkpbktZPTaRbahQz7B5ulxnVlHLx+G4hbYHPneD3eQXC76VP50CXRwgyABqppEQIAYgBNW3mSyk2xzVZOZ0pHbuz1+b2+i77a6B0IhenbQIRQJ+KNSmMo8UgxOyVPp7P6JyzPOLMlF5yl10V0PVlkITwhK7cm7bdYe7b8yPFIVd5Fi+N9g+yZCg+WtU25+b5h1Tp0uF3lvbzp81lyeK7eJzr-wlzIOz3ftY1RCVVQ4KhYDIJYBAIEgKAAG1gGQACE9QAaRve1J1AYsdnZHc-G8PwaXWKtmXONwTnrINfDySlMk7MpuyPNFaEVBCCAzHBGAmLoCB6MAZGwu9cIcRJvG8Wgf3pO5tnpZcSJrQIpK2X9QnDXJ-FbZikVFON2OTLEKAAMziagoBhRQqBUeFYDAKgIAgkgoJgxpWixJQKAwMBRInQs8MQJkchSRtqPbPxqJCGsHkMWh223NxP1bSl5L0kVQN7WhjMYMyLKoKysUYXjaBYRDOFM3iAFtaAcpyXLcjAlk8xhvN8-yC2WB9XDU2S8icBT1jCPxYs-GSNJCQJAnSG48gy1jDIlVo8AwXzYBQ89L2vExiTEwKJIQf92R2UiMiiwbdlijdaBDDYptS9t8l3PcqC0eA5hAnswD2gLuqChAAFpfxrQHktoUjP0icJW29SIFsPQzmnqe9xy6x03BixcgmpNJUhcektICBGDNRZGOCWfhBGEMRJGkX70YfENaFcKKCe0nS-E8GsjhCLxbjybYjkMFcMjeYDTyympRhRxoGBltoOgEoSGdRw6pJrDZ2RyKLtm2KSN2yEISaltFVfE1ZP2kpJMZpVtppm7wa3pW6v1CPWnH2JsV3Fj4WMRsD0QhKFzYOy2bmpTIbhOB7HZ54NcduHZPcNu5ff3f3Sey-tQ-+w6Ik2YNPcAvlghXFSmQ5dwmwCaa8hcE3vvYxroOaxo4IQ5Dc8dQXrZCDJ1g2W59Z5oXqWrzx8j1oJskbtiJREEhqpYbuHyivmps8FsnrZ+lNdeKuZtSyfUkCOelpBTjrB4vilamH67X2vPi1beKGJCFcNyL7YVMpAMm0GifPIgRtjn0DjlEy5lLKrwBoAq4TwP6vH1scZSi5hoJS-HyRkuwYZnwlpnU2y1VrrQ+mjNWqxebSRjkEJISl+TczQWPbIdIGT935IGMB2VTRORgYdai4NgxNknk+YMvJrrbBkvSaiIt9ZBibJw48tBeEEBwCvBASQJGw0pMRVSSUfQgEQmAUyBBnB0j8CzdwIYpohhATsWIAAjHABAVHVUQATcxWiCYnG8Ho2IeUoCoBMWsFwCkLE7GXCAyeQsf4gAAO4UAgAQVAzg3CGFiOgDogTEBb1iMWMxYSrGRNsTE84GiErBm0d4vRRQihAA */
  createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QFEC2AjSBhA9gOwBcAnHAG1LCIDoBJPASwPoENSBiCfMK2A5g7mkwRchEuUq0GTVgG0ADAF1EoAA45YjevhUgAHogAsAZgCcAViqHTAJjMB2e6YAcpw+YA0IAJ6IAbPKmVOby8gCM9vI2NmHG8oY2AL6JXkLY+MRkFNR0WqxUAApEYKrMxQDK9FB4-ACuxYXFpcUcXFT0eABuOADW3KpNZWCV1XXFCspIIOqaTDpTBgjuQXaGhvLGhvYx0RZevgjRNlRRm85hYVt+zubOyakY6WJZkrkypFQAqjRUACJgAGMcBAwAAlMAAR1qcAIrTw3A63T6VBBQJBoIKWHBUJh5UonXoALAE10My081AizC1yocRujmcxhs6z8NlM+0QN2MtOc8hCNnC5nMphF9xAaREGXE2SkeQ+3z+gOBYMh0N4bD0vH43GYADMBEQABRxUIASjYEtEmQkOWkLHlP3+aJVON4JKmZLmeF0ixC3NCoQu1K2pnsmw5CBclkZxlZNjDhjCzmTYstUpetrlXx+AFkwAQABbAq3SyhwhFdXrcPOF4vpm14ogEonutQacnehaIMJRY5+Jz2EyuWybGwR8z2Szx2PmaxJrbyeypx6S5422XvbNUGtF1fW7Ll9qV5E7utr7KN5vEsKTNuzbSdynd3tUfuhoci1ZjnyIFzyKjTts5zyH4AQWMuwglhmG72lueLkGw5QABIAPIAOoAPoACqggAggAcuUuFYFhNAofhGG-MgWG4TQAAy5SttM7Zej63YTvYAETqYUQmG4YTsj+kYTq+oHnMY9jOI41JhBBTz7q8dr5Aq8HsOUNAAOL4UxnoPmxCBhBxXFOLxZiJoJBw9vIzhUNSfg8QESZ8sKcl7qWmabgqABCtTeIhqGYThBFESRZEUVRNH0YxSikixeldocNg0uYZgREmg5Mp4Qn2BEwShDEazUmyrlQeubywd5vmIZp2kxR6cUUvoiBJVstICkOs4WIuEbbNypjUsmWznH484lfWMrlcpPw+X56labIN6xfejWLC1nFMvExg3NYIT2BGASGKJ9nWZEhjnDcY3nopWYKjmHSwsh6HYXhhHEaR5GUdRtEMTpDWPk1BlGTY3GmfxFlGPYfgnIG0RJsK1hLik4orqVE1KQ6273dV811XeHb6YZjjGTxzJmQJEYJJYIT5SKQpgaYxiXQpHkVT8dHMAAXt4d2ENjtW3sxy3-VSQMg6TYMRj2ARcbxI05X4xjmH4TPuTBU2KqopA4N4uASACXr+U9QWvaFH0Rd90UC7pK3sUTwMmeL5k9cKVD9fZFzMgzSXK0jaZXSz6v-Jr2u6xQ+sPnzv1CwTosO3xTtCcmNmTlEtx+FsYair7KPjddnk-HieAQFhRDMHgsDMOH+CHoiVY8GARcl2XFdV3gl6EsSuOC-jCUSXEJysqBvYxM4hh+Pt-VWDxZjWa4iYxCr0GTRjIx4Fh3iqJAvz8MwNfHtwq-r5vEDb3w7ctl31vC81SU2Sl-U5VJJjA5LUT-uYdiDgJSUM+YsnZ5BXOAcMZoWYIwAAYjgIgq8xhgDYFHHuT4EDGAuP+G4bhQxJkMsYfaIFXbUlMCNMwisTCMwAfJVWy8txN3LpXL0-w+D0FILANgXliIAGkEGsQStEZKqVH4ZRftlGkAY4igTHgrKIi8yrozgrUAERJYAsKwHRFC5RkBcPikgxMGwAKuHjGEGwNxeTOFfpsKgKcUG3EMZDaIyQkZ4GVPAKYftmZLUQQDAAtAkCM3iwiuxFIEoJgTnA+weIA-2atSDuO4Ug8eQl3B5VCCadwgRnBJHIW5JesiiglCGDAgg9QwAxK0QDWcktjD+gDAEQI4RCESWkWjLMuTmjDCqDUQpDQWlDBKTbAyUQIzRHfgGIUFwRqBE2I0vOsFukVHabAqgyAi69Ovgga4h1XAgWiIOBWElTFCWZMcFOGxtgJEiDsKZwDswrP0sKCMlSbIBiiHLawoREbhIodkm6jolTolVDCG5CUex7SEhYfxMZWShiHpsMJyMInMyiVuU8WSbSAriUlV8A4mQJhMNcCMYKqAQs2JcTYTJYWuMobIlSYByBooBpcVkAE1hSXiG4bYGxX5RBlmydYTlYzkpzpEqhlUDh41iQDYGCtCXtTiJcNYlTDA9STNDXibgSGTjIR8lFTT86Y0IHSqkrzXYgQVSgkCLgKaRBOIyM61wzC8n7O8uFnyZHfKoOzLmPMCAGu7O4KG2xQJGMCUlECr9pYpyMRcHi6T-5atRtMwOJQtY6xeK3H1BkzArCTOk4ls57LxIOMmY4MYOIPLdpq512qE0rwbsXUutC031Wjr3BVA8Wo8QnFtMM+1eRWFAm4eM50H6XMRSpdpR8t473TelY499qSLkCB-SGnKgjU2BsmfKPKR3Cp+KAiBUCClFPTWyfu6T0lj0HMmQxWUDgBEsHZUMT8UGuG3VSn4NCW70PzGA5h06LDFtcNSMRdkBnCP-Imey5wjGQ0IaYV9bryjyMUc4sVpTFj2s4oOOwjIUpCmSWYqcfpDJQdsYYeDuqlkQHTQkQyATmSbXldSMxh0AzxkCNJUCFaKVfPeL8Lg6aJwVIsCquI09QgMzuPYoAA */
      tsTypes: {} as import("./machine.typegen").Typegen0,
      schema: {
        events: {} as Events,
        context: {} as EmbedControllerContext,
        services: {} as {
          prepareSignature: {
            data: PreparedSignatureResponse | undefined
          }
          decodeRPCRequestService: {
            data: any | Error
          }
          MethodControllerService: {
            data: any
            error: Error
          }
          sendTransactionService: {
            data: RPCResponse
          }
          SignTypedDataService: {
            data: RPCResponse
          }
        },
      },
      id: "EmbedController",
      initial: "Initial",
      states: {
        Initial: {
          type: "parallel",
          onDone: "Done",
          states: {
            PrepareSignature: {
              initial: "Prepare",
              states: {
                Prepare: {
                  invoke: {
                    src: "prepareSignature",
                    id: "prepareSignature",
                    onDone: {
                      actions: "assignPreparedSignature",
                      target: "End",
                    },
                  },
                },
                End: {
                  type: "final",
                },
              },
            },

            UI: {
              initial: "DecodeRequest",
              states: {
                DecodeRequest: {
                  invoke: {
                    src: "decodeRPCRequestService",
                    id: "decodeRPCRequestService",
                    onDone: {
                      actions: "assignData",
                    },
                    onError: "Error",
                  },
                  after: {
                    3000: "MethodController",
                  },
                },
                MethodController: {
                  invoke: {
                    src: "MethodControllerService",
                    id: "MethodControllerService",
                    onDone: [
                      {
                        target: "Buy",
                        actions: "assignMethod",
                        cond: (_, event) => event.data === "Buy",
                      },
                      {
                        target: "Sell",
                        actions: "assignMethod",
                        cond: (_, event) => event.data === "Sell",
                      },
                      {
                        target: "DeployCollection",
                        actions: "assignMethod",
                        cond: (_, event) => event.data === "DeployCollection",
                      },
                      {
                        target: "Mint",
                        actions: "assignMethod",
                        cond: (_, event) => event.data === "Mint",
                      },
                      {
                        target: "LazyMint",
                        actions: "assignMethod",
                        cond: (_, event) => event.data === "LazyMint",
                      },
                      {
                        target: "DefaultSign",
                        actions: "assignMethod",
                        cond: (_, event) => event.data === "DefaultSign",
                      },
                    ],
                    onError: "Error",
                  },
                },
                DefaultSign: {
                  on: {
                    SIGN: "SignTypedData",
                    CANCEL: "#EmbedController.Canceled",
                  },
                },
                Error: {
                  entry: "assignError",
                },

                Sell: {
                  on: {
                    SHOW_TRANSACTION_DETAILS: "TransactionDetails",
                    SIGN: "SignTypedData",
                    CANCEL: "#EmbedController.Canceled",
                  },
                },
                Buy: {
                  on: {
                    SHOW_TRANSACTION_DETAILS: "TransactionDetails",
                    SIGN: [
                      {
                        target: "SendTransaction",
                        cond: "hasPreparedSignature",
                      },
                      { target: "WaitForSignature" },
                    ],
                    CANCEL: "#EmbedController.Canceled",
                  },
                },
                Mint: {
                  on: {
                    SHOW_TRANSACTION_DETAILS: "TransactionDetails",
                    SIGN: [
                      {
                        target: "SendTransaction",
                        cond: "hasPreparedSignature",
                      },
                      { target: "WaitForSignature" },
                    ],
                    CANCEL: "#EmbedController.Canceled",
                  },
                },
                LazyMint: {
                  on: {
                    SIGN: "SignTypedData",
                    CANCEL: "#EmbedController.Canceled",
                  },
                },
                DeployCollection: {
                  on: {
                    SHOW_TRANSACTION_DETAILS: "TransactionDetails",
                    SIGN: [
                      {
                        target: "SendTransaction",
                        cond: "hasPreparedSignature",
                      },
                      { target: "WaitForSignature" },
                    ],
                    CANCEL: "#EmbedController.Canceled",
                  },
                },

                SendTransaction: {
                  invoke: {
                    src: "sendTransactionService",
                    id: "sendTransactionService",
                    onDone: { target: "Success", actions: "assignRpcResponse" },
                  },
                },
                SignTypedData: {
                  invoke: {
                    src: "SignTypedDataService",
                    id: "SignTypedDataService",
                    onDone: { target: "Success", actions: "assignRpcResponse" },
                  },
                },

                WaitForSignature: {
                  always: {
                    target: "SendTransaction",
                    cond: "hasPreparedSignature",
                  },
                },
                TransactionDetails: {
                  on: {
                    BACK: "Buy",
                  },
                },
                Success: {
                  on: {
                    CLOSE: "End",
                  },
                },

                End: {
                  type: "final",
                },
              },
            },
          },
        },
        Error: {
          type: "final",
          data: (context) => context.error,
        },
        Done: {
          type: "final",
          data: (context) => context.rpcResponse,
        },
        Canceled: {
          type: "final",
          data: (context) => ({
            ...RPC_BASE,
            id: context.rpcMessage?.id,
            error: {
              code: 4001,
              message: "User rejected the request",
            },
          }),
        },
      },
    },
    {
      actions: {
        assignPreparedSignature: assign({
          preparedSignature: (_, event) => event.data,
        }),
        assignData: assign({
          data: (_, event) => event.data,
        }),
        assignRpcResponse: assign({
          rpcResponse: (_, event) => event.data,
        }),
        assignMethod: assign({
          method: (_, event) => event.data,
        }),
        assignError: assign({
          error: (_, event) => event.data,
        }),
      },
      services: {
        decodeRPCRequestService,
        sendTransactionService,
        SignTypedDataService,
        MethodControllerService,
        prepareSignature,
      },
      guards: {
        hasPreparedSignature: (context) => !!context.preparedSignature,
      },
    },
  )

export type EmbedControllerMachineActor = ActorRefFrom<
  typeof EmbedControllerMachine
>

export default EmbedControllerMachine
