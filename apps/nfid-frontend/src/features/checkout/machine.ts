import { ActorRefFrom, createMachine, assign } from "xstate"

import { PreparedSignatureResponse } from "@nfid/integration"

import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import { RPCMessage, RPCResponse } from "../embed/rpc-service"
import { sendTransactionService } from "../embed/services/send-transaction"
import { decodeRequest, prepareSignature } from "./services"
import { timeoutSrv } from "./services"

export type CheckoutMachineContext = {
  authSession: AuthSession
  appMeta?: AuthorizingAppMeta
  rpcMessage?: RPCMessage
  rpcResponse?: RPCResponse
  preparedSignature?: PreparedSignatureResponse
  decodedData?: any
}

type Events =
  | { type: "SHOW_TRANSACTION_DETAILS" }
  | { type: "done.invoke.prepareSignature"; data: PreparedSignatureResponse }
  | { type: "done.invoke.sendTransactionService"; data: RPCResponse }
  | { type: "VERIFY"; data?: RPCMessage }
  | { type: "CLOSE" }
  | { type: "BACK" }

export const CheckoutMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGEAWYDGBrA9gVwBcBZAQw1QEsA7MAOmooIpIBsBiCHG22Akgumky5CpctToMmrANoAGALqJQABxyxGFLspAAPRACYALAEYTtAJwB2K3KNWArA4sm5ADgcAaEAE9EANgBmB1ojQMcjIwNAk0cHIwBfBO8hbHxiMkpuKWYWWgAFACcwFRJC-i0qWgARTBwIMAAlMABHPDgCGrqGji5JKgA3HCw6Box6ptb23nklJBA1DSZtef0EI38LSwMTN0C3K38DeM2jbz8EAxdaB2iwk3i5Az3gpJT0NNFMiXoqTVYCsVSuVllUiiUymAAMoUKBUfh4YqAiHFXrZQbDOgqIGQmFwhHFWY6RaaFagNZGNxbO6BKJuHZRU7nRBGCz+G53fz+PbOOQWAxvECpEQZcTo-55ACqAElaAAZHAkBqFNH9IYjWjC9JiLL9CW0GXyxXKhDUIYYCpcWZE+Yk0E6NbGKy0AxBEwWZwOOT+Excry+RBsgy0elyWxyXZyYLPQVar5ivXSKWyuMENhQgASAHkAOoAfQAKo0AIIAOShxeQBelWdLeeqAFEC8XpXKoTbVOpSVQHYh4sGrL7njsglYLPTmQg2UYXR4nlcrg5dv5Yx8RTqfjkAYbU2wAGoNxrSgBiAE0Owsu-bVn2orRB0d6b7wuODJPXCYZ1Y3KzaeE+U8iTJEKa7at84pJgaKagYQ+6Hie54mHMnZLJUvYIP295Dk+o6vu+Ji0rQUasl63omNEY6rsIYEJr8+o7jBabIHKWZQg2F52mhN4YXeD7Ds+Y4TgGCBmD+Ny0uOn6mBY7hWFRnyirqdGQYaBblFQsBkKCtR8BQLCwGwABClYANIcVeXHkogNhyPeTgScE44uP4k4uIE94-hYLjxG4P7fvJ67gYmuRQbQOYkIwx44IUeLwgQiJgGw5moWSeiIK4-ghEYUaOGOPoOP43rvhGzrEV5DiBB6mUbAFNFKVuya0HuYCFBQABmPjUFAqq-OqdCwGAVAQGpJAaVplRQi1AwUBgYDJd26GxAYzpWPY-hRBG3qBOtk5uHItm7H+-HHA4bi1fG9V-CpsrNa1HVdWwLWFNFtAqCw-BtdFAC2PCDcN6maRgoKTYU02zfN15WSJ3pZTlDh5Q8hUucJY4zhVrJsk4sReYE52KZuV0hYaUJ4Bgs2wAZzGsexijEhZqWOq4tnWGEtKUgY7i7TstBcvtEZhIVnlJMBVATPA8yphuNB0ylPbcQAtIV9445+bKHAVFWTvLziWF55VyBVJ27HjUvBawMsLQr5HKxYMSsv46uZc8k7LTcfMG7Eri2JEJtBcpIXgsClpyyhltQ9t+EhO7BuVRVbLer7tENciQegl04wNM0bQdBbkNpQgP4u08bvu843K+etieXfqgdlMH6cTFn0ydLUGdgLnln5wRb7Cc8Wx6+Vgn7ORQHvNRF0EzXOIgpUDeZ1MHQ1H0HcMwEhwuq4c6DrbBUmJOMTBsYetXAb60PlXk+QbXM9cCnuKwnFCUryH+eF8J2XOqR+28oc-JycBks-bJ2vvXa+0IH4EjoGA5+i1Ag9wuCRIi7szB8l2BVC+EEA7T1AdPcB+J4pImqMvW09MX5rEHDOKkBslwPA5lGZGFwlzOiPl5HCRglwCgAYxU2-ttzShgdxYILp9rci9HAv89hJy2HMJlLythf7fldBgs2jUFRKhagIqGexhHejnOIsIkjhK2zcLQOB3pHAESjLSFcXDx740wXwzUjFNH50qu5LkFgwh2HdBzNwe8jE+hDBzB2niDgwzOrYhSPDk6qQBuNLgOkIr6RcWsA4IRlppMpGYVkuxXIGGDNtF4EZyILgiWPKJQDCaOMaCQL6KgUnpViDzfJBU4FBBcDDYqYQglhlocYDYNhlG8MauFSK0VYqQIaQXGwQSCocyZrbD0xUHizl-GEWwMlohDJiTdFq7VOpUCgFMgiMR7z2HhtEJ4tsrDwOslSWgDw9aekKmyCw2yqmNRJmTOA4tQ55zWO6DwoRlq0gjIEPknj-QXHpMGR51hPwcLdO8+isoGxDSmfkgiPMbBx0CJVKwwQGGIHpCY+GXJ9hLi9GfIZnBpYkNluhY47pTFUiXKYAq-JwiTiCMGbkjg6HhFcM4YWCQgA */
  createMachine(
    {
      tsTypes: {} as import("./machine.typegen").Typegen0,
      schema: {
        events: {} as Events,
        context: {} as CheckoutMachineContext,
      },
      id: "CheckoutMachine",
      initial: "initial",
      states: {
        initial: {
          type: "parallel",
          states: {
            Preparation: {
              type: "parallel",
              states: {
                DecodeRequest: {
                  initial: "Decode",
                  states: {
                    Decode: {
                      invoke: {
                        src: "decodeRequest",
                        id: "decodeRequest",
                        onDone: {
                          actions: ["assignDecodedData"],
                          target: "Done",
                        },
                      },
                    },
                    Done: {
                      type: "final",
                    },
                  },
                },

                PrepareSignature: {
                  initial: "Prepare",
                  states: {
                    Prepare: {
                      invoke: {
                        src: "prepareSignature",
                        id: "prepareSignature",
                        onDone: {
                          actions: "assignPreparedSignature",
                          target: "Done",
                        },
                      },
                    },
                    Done: {
                      type: "final",
                    },
                  },
                },
              },
            },
            UI: {
              initial: "Loader",
              states: {
                Loader: {
                  invoke: {
                    src: () => timeoutSrv({ timeout: 3000 }),
                    onDone: "Checkout",
                  },
                },
                Checkout: {
                  on: {
                    SHOW_TRANSACTION_DETAILS: "TransactionDetails",
                    VERIFY: [
                      { target: "WaitForSignature" },
                      { target: "Verifying", cond: "hasPreparedSignature" },
                    ],
                    CLOSE: "End",
                  },
                },
                TransactionDetails: {
                  on: {
                    BACK: "Checkout",
                  },
                },
                Ramp: {},
                WaitForSignature: {
                  always: {
                    target: "Verifying",
                    cond: "hasPreparedSignature",
                  },
                },
                Verifying: {
                  invoke: {
                    src: "sendTransactionService",
                    id: "sendTransactionService",
                    onDone: { target: "Success", actions: "assignRpcResponse" },
                    onError: "Checkout",
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
          onDone: "done",
        },
        done: {
          type: "final",
          data: (context) => {
            console.debug("CheckoutMachine: End", { context })
            return context.rpcResponse
          },
        },
      },
    },
    {
      actions: {
        assignPreparedSignature: assign({
          preparedSignature: (_, event) => event.data,
        }),
        assignRpcResponse: assign({
          rpcResponse: (_, event) => event.data,
        }),
        assignDecodedData: assign({
          decodedData: (_, event) => event.data,
        }),
      },
      guards: {
        hasPreparedSignature: (context) => !!context.preparedSignature,
      },
      services: {
        prepareSignature,
        sendTransactionService,
        decodeRequest,
      },
    },
  )

export type CheckoutMachineActor = ActorRefFrom<typeof CheckoutMachine>

export default CheckoutMachine
