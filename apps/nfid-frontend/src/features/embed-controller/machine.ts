import { createMachine, assign, ActorRefFrom } from "xstate"

import { PreparedSignatureResponse } from "@nfid/integration"

import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import { RPCMessage, RPCResponse } from "../embed/rpc-service"
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
}

type Events =
  | { type: "done.invoke.prepareSignature"; data?: PreparedSignatureResponse }
  | {
      type: "done.invoke.decodeRPCRequestService"
      data: unknown
    }
  | {
      type: "done.invoke.sendTransactionService"
      data: RPCResponse
    }
  | {
      type: "done.invoke.SignTypedDataService"
      data: RPCResponse
    }
  | {
      type: "done.invoke.MethodControllerService"
      data: string
    }
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
      /** @xstate-layout N4IgpgJg5mDOIC5QCUAKBhdB7AdgFwCcsAbYsAgOgEkcBLPWgQ2ItQLAAdH2BlWqHIzwBXdq3Zd2AYgi4wFWjgBuWANbyOE7mD4ChosAG0ADAF1EoDllj1auCyAAeiACwBWAJwUATAGYXvgAcAOwAjB6hAGxungA0IACeiN4pFMZ+LgGBEaFukZG+AL6F8WiYuIQkZJQ0tswUAKpUFAAiYADGWBBgyGAAjsJweDJyCspq8t2d3WW9A0M85Eq07UZmDlY2DPZITohRgRS+xoFugS4ewZHexpHp8UkIp75HgcZu7t4exsHe+cWlDDYfBEUjkah0Bj1JqtDpdHr9QawYaOZFCeSMABmeHIAApjsZjABKKRlYGVME1SFMFgwtrTBHzZEmcy7Ta2HagZwINzpCgeAUeSIeELGY4pYIPRAitwUQK+XwFS7hXLeFwAkBkiqg6oQuq05oAWTAeAAFl1yTryCMcPJFCp1BRjWaLdqquRFgRlqsWRtrBycA5uaF0t4KJFgkLFR4XJHCZLEog3MFZd5gv4XCdjB5ji5vBqtSD3VT9Y0jSbzRBLcWbXbxo7nZXq5TPd6jKFWZZ-dtA7tg6Hw5GCsLY98flKECLjD508FM7O-CkC0C3ZS9VCDRRFqQpDwABIAeQA6gB9AAqyAAggA5HiX9BnqgH68nloAUTPl6oABkeL62d2di9ly+zJsEPjJsK0SBJEgS5AmjweMm4b5NkgRwSk0QeMu5RFmutQbmWW5gDuPBUAA4te-5dlsQFBqBwTgd4kFCmcsHwROIYnBQUTBOk2YhIqsE4c2uoETSREAELCAku6HqeF43neD5Pi+76fj+f7rABtGcnsCCYYcbhBEhLi5G4oR5pEE5hOBvKEu8ETphGkQiauYnUtCzTSbJZGUdRIDsj29EGZEsZHDcfwpiG7gIYgvwvBEEaBN4lnCtk+YlJqK54R5pYwj5u4UVRHZ+rpwH6X84W+JFEYWcYsUTncLgoRGqWOVkrlZYWFJ5YRMKGoowz7se55Xre96Ps+r4fl+v4BUFdF9gxTEsdB7HJhOsaRGkDmXClCqhJGbm5eC4leU6Q1Ff52k0QGIXwatVysTBcGbYmCB5rKFwCimYUpUdtwnb1Z2eZu36MAAXgkg34NdVG3YFgF6cGYEQc961vXFCAhncEFiqE-ihMx8qZYCuEgyW-XNG0HDEFgCTYGC7Q9nJo2KRNKnTepc1aZ2SPlQ9aPMRjbFYzZnj8rxc6+EKkShOcwNWlTEl0pw9OM+6LNAfDC3IxVqOMejUFixxH3oYcKbpHmfHpHBwRK8W66q80iw4BAZ4EIwOCwIw2u4LWYwOvIsBgO7nve77-s4K2KxrPzi0o4gvjptOtxqinAQpDBbhNREFAXMYBy8mEmQO91OWU87F26DgZ4JBwkAtEIjCB-aExbvwdcN03Lexz6iOJwbyR-EZJkfOZll-Jx-EUG4fjpe8vjGRcjv4WDRFHow9AAGJYAQtf6NIeuC8tCC+KEIZyp4F+XNmNzvE1txS+xAouKcBSBGvfUuxQEc+37HsbQ8Db2ILAKQkl7wAGkT73TPoZOe48zIxCntZD6VxDgOWJm8DwapYJuG-qDfKrthDtFWLAcB6BvwHh4G+WBwUz5mTFD4dCIpLi8giDPfwFArbeHQimG4eQupZRwPCeAuwerKzKnAkCCAAC0eYJwKLJtlCmytq7EGkQw2RaDHjuDng5IuIZeTYPVBXNRTtzosDYJwbQh8RDsC0UtWRHxOIKl2oScyY4IhBEISreoNjJA6C7kfeQgTtBOKTjje4H0UjTnsoSQ6vIggEPMaJIhhFwm8BCQ4+Qb53aROHggWCLVsjp0uKZPMHgJxqjDHOQUMRjKMTFF1cm6T-EGkKSFOIH0FTgUFCKSMi5batNUe0jRRF6TwjmEiPAXSz4hmxkhUIcoFR1V5PghUfiJkDQrK6U6BB5k6L+IOOWfFGKeHOBOZZqzFSpRFFhBq2yrFEW3JonSMj9JpTDGqFwbUzixjzKEGefJmLpBFGmN4PxsJpPchk3+PkjmVTyC8FK1sFbGV4r4GyCsPEdRTgUd4zyN4DSGki4Mhd+S3EvoTP4uCXBbT4mkeUKcLKEyQjmYlxCKAQ2hrDOZHztFfPcDtX4YViaKl+NkBlH1cbTithfImJMapcuprCOmDMmZkGjuS-YssvCpRgimbIFk5yBAnOhMMLKwrvzCMZa4qrf5uw9l7ABOrBXOP0gqbh6c-l-XCOcbwTU3gF3yL8H4qUjq4MdTXLu9dG4QGbiA3VOMQhhmMmhPM5xzgNRBV4eyYKop5E5bCg5Ozmhb13vvexBgU1fGOHKPhtwfgfHyGKJ+sooiwSbYKMKKjJGWJJc0f+UcgEmlAeIu6QrgxIStawj+yZ3joRsnjMyEYZZywVmYtpcKOmvNIeQydAtPnclliEHhQKjFpi+ITLhqYTH20vpimNm58kQBTUC2UAp2q4KOtELhLUHJ0ouEEL4L6WhyA-UG2V4RAOEjTHcGI1xfjFGKEAA */
      tsTypes: {} as import("./machine.typegen").Typegen0,
      schema: {
        events: {} as Events,
        context: {} as EmbedControllerContext,
      },
      id: "EmbedController",
      initial: "Initial",
      states: {
        Initial: {
          type: "parallel",
          onDone: "InitialDone",
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
                    ],
                  },
                },

                Sell: {
                  on: {
                    SHOW_TRANSACTION_DETAILS: "TransactionDetails",
                    SIGN: "SignTypedData",
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
                  },
                },
                Mint: {
                  on: {
                    SHOW_TRANSACTION_DETAILS: "TransactionDetails",
                    SIGN: "SendTransaction",
                  },
                },
                LazyMint: {
                  on: {
                    SIGN: "SignTypedData",
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
        InitialDone: {
          type: "final",
          data: (context) => context.rpcResponse,
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
