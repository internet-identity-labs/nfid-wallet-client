import { createMachine, assign, ActorRefFrom } from "xstate"

import { PreparedSignatureResponse } from "@nfid/integration"

import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import {
  RPCMessage,
  RPCResponse,
  RPC_BASE,
} from "../embed/services/rpc-receiver"
import {
  MethodControllerService,
  MethodEvents,
} from "./services/method-controller"
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
      type: "error.platform.sendTransactionService"
      data: Error
    }
  | {
      type: "error.platform.SignTypedDataService"
      data: Error
    }
  | {
      type: "error.platform.prepareSignature"
      data: Error
    }

type Events =
  | ErrorEvents
  | MethodEvents
  | { type: "SHOW_TRANSACTION_DETAILS" }
  | { type: "CLOSE" }
  | { type: "CANCEL" }
  | { type: "SIGN" }
  | { type: "BACK" }

export const EmbedControllerMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGEAWYDGBrA9gVwBcBZAQw1QEsA7MAOgAUAnMABxMZIIpytoBFMOCGABKYAI544BAMQQedagDccWOsIxDREqbAIBtAAwBdRKBY5YFLjzMgAHogCMAVgBMtACwB2NwDY-AGYXAE5vEMN-NwAaEABPZxcnWkNU1KcnN0DPQydAtwBfAti0TFxCUnJqOiZWdk5uXlq2ZgBlCigqTjxmOQVaZVU6FmYWsHbO7uYjUyQQCysbKjtHBCdPF1o3AA4I709Mtw3vQNiEhGDPWhCXQNcnAMNQl0NPIpL0bHxiMkoaWgAqgBJWgAGRwJGEjD6-0GalopS+FV+1UBIPBkLAjAQgwwDR4MxmdgW1kaK0Q3lCtBclM8fkOrzcMXiiHygRSTzubge-j8hiC7xAiPKPyq-2BCM+IpkrQAEgB5ADqAH0ACoiACCADlWhrkKqgfKtcq+ABRVUaoGg1pEuYkpbktZPTaRbahQz7B5ulxnVlHLx+G4hbYHPneD3eQXC76VP50CXRwgyABqppEQIAYgBNW3mSyk2xzVZOZ0pHbuz1+b2+i77a6B0IhenbQIRQJ+KNSmMo8UgxOyVPp7P6JyzPOLMlF5yl10V0PVlkITwhK7cm7bdYe7b8yPFIVd5Fi+N9g+yZCg+WtU25+b5h1Tp0uF3lvbzp81lyeK7eJzr-wlzIOz3ftY1RCVVQ4KhYDIJYBAIEgKAAG1gGQACE9QAaRve1J1AYsdnZHc-G8PwaXWKtmXONwTnrINfDySlMk7MpuyPNFaEVBCCAzHBGAmLoCB6MAZGwu9cIcRJvG8Wgf3pO5tnpZcSJrQIpK2X9QnDXJ-FbZikVFON2OTLEKAAMziagoBhRQqBUeFYDAKgIAgkgoJgxpWixJQKAwMBRInQs8MQJkchSRtqPbPxqJCGsHkMWh223NxP1bSl5L0kVQN7WhjMYMyLKoKysUYXjaBYRDOFM3iAFtaAcpyXLcjAlk8xhvN8-yC2WB9XDU2S8icBT1jCPxYs-GSNJCQJAnSG48gy1jDIlVo8AwXzYBQ89L2vExiTEwKJIQf92R2UiMiiwbdlijdaBDDYptS9t8l3PcqC0eA5hAnswD2gLuqChAAFpfxrQHktoUjP0icJW29SIFsPQzmnqe9xy6x03BixcgmpNJUhcektICBGDNRZGOCWfhBGEMRJGkX70YfENaFcKKCe0nS-E8GsjhCLxbjybYjkMFcMjeYDTyympRhRxoGBltoOgEoSGdRw6pJrDZ2RyKLtm2KSN2yEISaltFVfE1ZP2kpJMZpVtppm7wa3pW6v1CPWnH2JsV3Fj4WMRsD0QhKFzYOy2bmpTIbhOB7HZ54NcduHZPcNu5ff3f3Sey-tQ-+w6Ik2YNPcAvlghXFSmQ5dwmwCaa8hcE3vvYxroOaxo4IQ5Dc8dQXrZCDJ1g2W59Z5oXqWrzx8j1oJskbtiJREEhqpYbuHyivmps8FsnrZ+lNdeKuZtSyfUkCOelpBTjrB4vilamH67X2vPi1beKGJCFcNyL7YVMpAMm0GifPIgRtjn0DjlEy5lLKrwBoAq4TwP6vH1scZSi5hoJS-HyRkuwYZnwlpnU2y1VrrQ+mjNWqxebSRjkEJISl+TczQWPbIdIGT935IGMB2VTRORgYdai4NgxNknk+YMvJrrbBkvSaiIt9ZBibJw48tBeEEBwCvBASQJGw0pMRVSSUfQgEQmAUyBBnB0j8CzdwIYpohhATsWIAAjHABAVHVUQATcxWiCYnG8Ho2IeUoCoBMWsFwCkLE7GXCAyeQsf4gAAO4UAgAQVAzg3CGFiOgDogTEBb1iMWMxYSrGRNsTE84GiErBm0d4vRRQihAA */
  createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QFEC2AjSBhA9gOwBcAnHAG1LCIDoBJPASwPoENSBiCfMK2A5g7mkwRchEuUq0GTVgG0ADAF1EoAA45YjevhUgAHogAsAZnmGqhwwFZjxgGx2A7LYAcATgA0IAJ6IATPJWVPIuxgEuhgE2dn4AvrFeQtj4xGQU1HRarFQACkRgqsz5AMr0UHj8AK75ufmF+RxcVPR4AG44ANbcqnVFYKXlVfkKykgg6ppMOmMGCMZWLlR+dgCMdm5+LgErLivWXr4IALQrblRrVsumjoYO7sbxiRjJYmmSmTKktQV9AxUE1W4eR+DUoJGoqlI-AAZjgiKgqD0Qf0yv9ASNdBMtNNQLMjmFzLs-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-KAm5sdVihck6Z1ztRAupddy-aRsDqYaCSwbCaORh6L0IEsqpLGnSO1x6x2jPpfK0lko+D0FILAQigMADSy7-A8RjWHeNkck0x19N+RBMFvksg2EBgtxRKhShtLAaDWBvKyQQ2oo8oY7XsTVh+QwEQDJrCFmyOMvVLgckxcgctcJIkQubdtDhmHLiVy48dUup064CL5mxeI448BVngGMeCadhOw0DviCk-U0U0U3RdQMRxNjkJ2BEUInK+J-IdVI45mnVFHEAq+ywtgOQ5VMDow4JwkZUBZBEDYpcRVmEJgR5CwJ6gokGACfIDmFlHFuGGCkqwBrel2PSQmxn1KLHMx+EI7gkbeLC9kCLvwb0xaBL0WLD6W0umCMSXWMYQwDXJEY4zAQ-Pow-HleYR4TD7PU2vNBpWSjlcBFQZAuK4uqVxmGNiOVY4sh9K8-dqwk5RCjjccatngnnpoNNuKCXFhaVc-MZjRj8v8MyuK9SgFUaxhzQc3JIyC1ZirLWNUB2OGxm-AbBw1geJmxWL2b0FhspbBgpcEwxWqaVUksEr7gcYhF0Sh6fK6lyTGF7NjAcpJfxdtHDD7FYByCI5dGEIy5J5uhBiMSMyBliSpLxqYcyZgT1PbzeYjedsyf+EsF+fKaWG4Y-mNXDYnFLMcgpPYbbp67NSsYYQXnPUhVJS9BdQIdIYj8PYkiwaNgRrgSJwuMJti37K9LvSVJWVmPhlS6L7qJ0wzio-GxM2oWdtHIV2Ms5EyykibYQHl0WkjIhh-ENYOqMQKTzB55piFxiTG5ljKkDWqtPzNUmEVq3LCZZRJP1rH6zTix8CL6WwSMbBJ8LeUQNJa+AW5vqHZkF1Y7U5TcyJFthpNmUJr0qvl6CCzqIPOiryvNjF-ouGdSIrY67v7ZZ0khkmOPcG3k4DmqFUUXA1OqDFutj7oumjL0tg64xw4mNHiBv+l7HZ6vl7GciMkbgKpveQfEC6xyhrWMMRTIDR3d1flJnX-cuDGKvSbCAZXD0PYPzP0A2Uwf8QvAWWkTvPGQXE6XqGzOXXbb3PjcEZXI4U6E7AcdzC7C6LYViSOCXbiXiZGW-SRXbXAuEfAwCKTcXWTcISBBTT3ducULgSAkwOOUkHYIxRkPYZNR3T8fqLxC4RwNiPlUxbg4SLAQlG0CgCAmrN-NRAQziPGDzUQ-YbqYMSnPsAaQIH0PGRTWIIAA */
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
                    onError: "#EmbedController.Error",
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
                    onError: "#EmbedController.Error",
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
                    onError: "#EmbedController.Error",
                  },
                  on: {
                    BUY: "Buy",
                    SELL: "Sell",
                    DEPLOY_COLLECTION: "DeployCollection",
                    MINT: "Mint",
                    LAZY_MINT: "LazyMint",
                  },
                  exit: "assignMethod",
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
                    onError: "#EmbedController.Error",
                  },
                },
                SignTypedData: {
                  invoke: {
                    src: "SignTypedDataService",
                    id: "SignTypedDataService",
                    onDone: { target: "Success", actions: "assignRpcResponse" },
                    onError: "#EmbedController.Error",
                  },
                },

                WaitForSignature: {
                  always: [
                    {
                      target: "SendTransaction",
                      cond: "hasPreparedSignature",
                    },
                    {
                      target: "Error",
                      cond: "hasError",
                    },
                  ],
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
                Error: {
                  type: "final",
                },
              },
            },
          },
        },
        Error: {
          entry: "assignError",
          on: {
            CANCEL: "#EmbedController.Canceled",
          },
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
          method: (_, event) => event.type,
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
        hasError: (context) => !!context.error,
      },
    },
  )

export type EmbedControllerMachineActor = ActorRefFrom<
  typeof EmbedControllerMachine
>

export default EmbedControllerMachine
