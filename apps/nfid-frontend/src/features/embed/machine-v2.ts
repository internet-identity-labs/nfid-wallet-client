import { DecodeResponse } from "packages/integration-ethereum/src/lib/constant"
import { assign, createMachine } from "xstate"

import {
  isDelegationExpired,
  loadProfileFromLocalStorage,
} from "@nfid/integration"

import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"
import AuthenticationMachine from "frontend/state/machines/authentication/authentication"
import TrustDeviceMachine from "frontend/state/machines/authentication/trust-device"

import {
  ProcedureCallEvent,
  RPCMessage,
  RPCReceiverV2 as RPCReceiver,
} from "./services/rpc-receiver"

type Events =
  | ProcedureCallEvent
  | { type: "SESSION_EXPIRED" }
  | { type: "APPROVE"; data?: { hostname: string; accountId: string } }
  | { type: "CANCEL" }
  | { type: "RETRY" }

type Services = {
  RPCReceiver: {
    data: null
  }
  AuthenticationMachine: {
    data: AuthSession
  }
}

type NFIDEmbedMachineContext = {
  appMeta: AuthorizingAppMeta
  authRequest: {
    hostname: string
  }
  authSession?: AuthSession
  rpcMessage?: RPCMessage
  rpcMessageDecoded?: DecodeResponse
  error?: any
  messageQueue: Array<RPCMessage>
}

export const NFIDEmbedMachineV2 = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QDkBiBJAIgUQLYCNIBZAQwGMALASwDswA1AJgDoAlABQGEB9V7T7OnrZWAYnasA8gMwBVPt04BBADIqA2gAYAuolAAHAPawqAFyqGaekAA9EjAMwBOZgFYnr15oBsAdmcAjA5eDgA0IACeiA4AHDHMACyaMYwBvpoBTgm+jN7eAL754WhYeIQQpJS0DCwcPHwCQiLiUjLy2IqqGgG6SCBGJuaW1nYIjvExmukOvimuqTFO4VEICXHMTpsZCQmuDt6uMa6FxRg4BMTk1HRMzEqyACoAEsycFGBkANZKAK6m7zRzGQSEMaKItL0DMYzBYrH1RownCwnL4nJonDEHGkZr5vMtEEEAixGMlvAlvLlyQFNA4TiASudypVrjU7o8Xm8Pt8-gCgSDYeCetYBjDhvDojTmIsHBkDmSUTF8QgAiFmIwkt4iakAglKXSGWVLlUbix7s87jywICqMDTGBRBBLGBmLQAG6GT7Og0XCpXaq3M0vX7-K18u0IN2GW2wiEQ4XQ0EjRC4lwZWa+BIORiMGK+AIBJUqzQsBJozyuWbeLObfVnQ2+42swMWkPW232x10F00d2e5jepl+k1s83B3k2kFgCM9qP8yyxoV9EWJ8UIXEONw5tEefx5oKFhJEqWzGneFHkqYxWulH3M-2m9nMB4AJx+sFMmDArptHad3d7Xp1reQ5No+L5vh+X4-tO7rRvOOhxkuCawkmyqZi4hwxJkWGIq4axhJEBJeCWZaeJW1ZONejJGiyAaPmOoYTnaECiAAytgrGsegkjINw2AABrsOgfCYIhUKDChq4Uq4GxZBWKSTOSviuIWwQbtmMr7N42x+AkVH1new5PEoyCYCoHQSNI2ByHwbDYEomAAJrgjo8YSWKoCjJkviJGemiuEE5IVjMSoxJmiSxGsOxTCiKr6cBja3MZpnmdwlltLZSgAOpKOgDxpa01ntNwSjsJZ9CqKIpXldgYn9MhHm2IgWEuMpqRTDKmLuKFh7MAEcReLsARkgcjDxYOiUsMlZkWYVNnYHcOV5QVVnzSVZVSBVKhVRtkjCOoi7iaKcKec1vU0g4sQ6oeWx4oRCCLD5XW+LirjaZdZ7jTR97MNNqXpUVmVLflANrdVm2VcoyACBorlIe5J1NQgXiaIkawvbqmxngcSpIjJuYBf5mjFhkjhfQ2tFTSZM0rRlC0Cfwjyzat7QOn+kZ9gO31GdT-1ze0zAM5wTO04D2AwbOoKxnDR0rqdyrZqjSRorsNJBEcjC4wcfUolWOwzJqV5FPSQETZTv288zdOC-xjMPFbYuiGAz7PoYz7MPoAA2IIAGZu7g-am9zrJ-Q78023bYftBLcE0NLkL1QjqE6kifWaoeMo5OkKn3WFLhZrq+bDc4Crk4ZIeW6L4ciFIYh8A8rCOXVy6SfLRLOMwWL7DkFEopr93+AkiRBFiNKbJ46JlyBSWV6DAvsaZvBcLwHHsDx7Fs12HOATeZs-aHVfz9gi91CvrFr8g7Ex3OccITLifHahsQyUSMRVvszgOLsSz3dSeRuLMEkBw35eBrMbLmFN96z35rZBemAl71FXuvbATsXZuw9t7UwftnwBwgeXGeKUo6wOPvA0+fBz7IOvlLO+CcW6NS8vMFwfgAoqkmFpfwhYfDeAAVhZSl1qTDTGnSGghgIBwGsHg6ejA3KP1XAAWnVG4dEeFxiBTVkqGUqM0QpFJLiVIn1wFB0gcOMh-BBDCFYDIuWSMZRuGpJsLCMxgrpEVPdQ8ARO5hRekiQKWQjanF3sHOizwrGtyRo4RIKsKyGwOE4M8hZsxDxcVWVEqRgi6inpNEcHJ3hfAYm2G+oT6HJg8aWTQuxcT9VifE3+KNZL+VzFWbMAUhEBOosY0Co5LQFLtEUxGow1io01FkRwZZKkFl-rsGS+xPDkhzHwt+mTzbNnAu+T834yBgD6cnfqMk9iLGaVMLwuYDyeE7gcUskxyzEz0oYwJHTglBm6WGSA2zVzDSwswPMmJESOEYAFPYhY6lbEOOuZpRIllQMIYfPgbz5b-OYGPPIuJym5jSB4JUI0NgjxJm9XCrSTb3PwVTaFc9bJ8Aco5OFSN-CIucMi7S6N+o9Q8f1LxOLMzDUhTzUlMCFrZVyiDPl61yqqGpQM4a5ycxZhpCEDMd0VhhVZQNcpAURrzG5RXXlLNbJCxFmS7A4qCRAKlE4L+lzKQyhzoqtIzBvBxGyHErEeRsyaoITTA1gtWC1yNcqDM8RnBUm0k0-yCqzpPXVNqXMOxcJupJR6vlzA4EIM6NDbAKgz4X3Yr6mYHjDhHJ8EiPMeROHEzRmkFIqQnUVjjRbbV1tk2mIoZfQ18NZFt1SEPYZKI9xv02Jw3q8kSQ7lmPrQohQgA */
    id: "NFIDEmbedMachineV2",
    tsTypes: {} as import("./machine-v2.typegen").Typegen0,
    type: "parallel",
    schema: {
      context: {} as NFIDEmbedMachineContext,
      events: {} as Events,
      services: {} as Services,
    },
    context: {
      messageQueue: [],
      appMeta: {
        name: "Rarible SDK Example",
        logo: "https://app.rarible.com/favicon.ico",
        url: "rarible.com",
      },
      authRequest: {
        hostname: "http://localhost:3000",
      },
    },
    states: {
      RPC_RECEIVER: {
        invoke: {
          src: "RPCReceiver",
        },
        on: {
          PROCEDURE_CALL: [
            {
              target: "RPC_RECEIVER",
              actions: "assignProcedure",
              cond: "isReady",
            },
            {
              target: "RPC_RECEIVER",
              actions: "queueRequest",
            },
          ],
        },
      },

      AUTH: {
        initial: "CheckAuthentication",
        states: {
          CheckAuthentication: {
            always: [
              {
                target: "Authenticated",
                cond: "isAuthenticated",
              },
              {
                target: "Authenticate",
              },
            ],
          },
          Authenticate: {
            invoke: {
              src: "AuthenticationMachine",
              data: (context) => context,
              onDone: [
                {
                  target: "TrustDevice",
                  actions: "assignAuthSession",
                },
                {
                  target: "Authenticated",
                  cond: "isTrusted",
                },
              ],
            },
          },
          TrustDevice: {
            invoke: {
              src: "TrustDeviceMachine",
              onDone: [
                {
                  target: "Authenticated",
                },
              ],
            },
          },
          Authenticated: {
            entry: "nfid_authenticated",
            exit: "nfid_unauthenticated",
            on: {
              SESSION_EXPIRED: {
                target: "Authenticate",
              },
            },
          },
        },
      },

      HANDLE_PROCEDURE: {
        states: {
          READY: {
            always: {
              target: "AWAIT_PROCEDURE_APPROVAL",
              cond: "newRPCMessage",
            },
          },

          AWAIT_PROCEDURE_APPROVAL: {
            on: {
              APPROVE: "EXECUTE_PROCEDURE",
              CANCEL: "SEND_RPC_CANCEL_RESPONSE",
            },
          },

          EXECUTE_PROCEDURE: {
            // invoke: {
            //   src: "SubmitSignatureService",
            //   onDone: "SEND_RPC_RESPONSE",
            //   onError: "ERROR",
            // },
          },

          ERROR: {
            on: {
              RETRY: "AWAIT_PROCEDURE_APPROVAL",
            },
          },

          SEND_RPC_CANCEL_RESPONSE: {},
          SEND_RPC_RESPONSE: {
            // invoke: {
            //   src: "RPCResponseService",
            //   onDone: "READY",
            //   onError: "ERROR",
            // },
          },
        },

        initial: "READY",
      },
    },
  },
  {
    actions: {
      assignProcedure: assign((_, event) => ({
        rpcMessage: event.data.rpcMessage,
        rpcMessageDecoded: event.data.rpcMessageDecoded,
      })),
      assignAuthSession: assign((_, event) => {
        console.debug("assignAuthSession", { event })
        return { authSession: event.data }
      }),
      queueRequest: assign((context, event) => ({
        messageQueue: [...context.messageQueue, event.data.rpcMessage],
      })),
      nfid_authenticated: () => {
        console.debug("nfid_authenticated")
        window.parent.postMessage(
          { type: "nfid_authenticated" },
          "http://localhost:3000",
        )
      },
      nfid_unauthenticated: () => {
        console.debug("nfid_authenticated")
        window.parent.postMessage(
          { type: "nfid_unauthenticated" },
          "http://localhost:3000",
        )
      },
    },
    guards: {
      newRPCMessage: (context: NFIDEmbedMachineContext) => !!context.rpcMessage,
      isAuthenticated: (context: NFIDEmbedMachineContext) =>
        !isDelegationExpired(context.authSession?.delegationIdentity),
      isTrusted: () => !!loadProfileFromLocalStorage(),
      isReady: (_: NFIDEmbedMachineContext, __: Events, { state }: any) =>
        state.matches("HANDLE_PROCEDURE.READY"),
    },
    services: {
      AuthenticationMachine,
      TrustDeviceMachine,
      RPCReceiver,
    },
  },
)
