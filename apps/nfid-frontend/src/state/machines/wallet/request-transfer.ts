import {
  registerRequestTransferHandler,
  RequestTransferParams,
} from "@nfid/wallet"
import { ActorRefFrom, assign, createMachine } from "xstate"

import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"
import AuthenticationMachine from "frontend/state/machines/authentication/authentication"

// State local to the machine.
interface Context {
  appMeta?: AuthorizingAppMeta
  authSession?: AuthSession
  requestTransfer?: RequestTransferParams
  amount?: number
  to?: string
  isLoading?: boolean
  blockHeight?: bigint
}

let _blockHeight: number | null = null

// Definition of events usable in the machine.
type Events =
  | {
      type: "done.invoke.AuthenticationMachine"
      data: AuthSession
    }
  | {
      type: "done.invoke.registerRequestTransferHandler"
      data: RequestTransferParams
    }
  | { type: "CONSENT" }
  | { type: "CONFIRM"; blockHeight?: bigint }
  | { type: "REJECT" }
  | { type: "END" }

// The machine. Install xstate vscode extension for best results.
/** @xstate-layout N4IgpgJg5mDOIC5QCUwEcCucAuAVATgIYB2sAZmPgAr4D2AbgJYSUB0qhEAngMQS3EwrRsXq0A1kPxgojWNkqpMOAiXKUAEiQgAbSgG0ADAF1EoAA61YjbIwFmQAD0QBmABxvWHgKzfDATgAmF38Adl9DABYAGhAuREjI-y9AwwA2F0i3bwBGQOCcgF9C2KUseVVSCmo6JhZ8VgBBDGwACzBiWwBjQgU+ASERMUkmlvbOxh7bAQBZQi7WkTAjUyQQS2tp4gdnBBzDYNZAtLTjwMTvQJzQl1j4hBcT1lD-N39Dfb83SLTQ4tL0OU8EQqpQaAxmGwyioQep8DwAMIAeQAcgAxACSyBmKwcGxsdm2a12AFocpEcqw0tljiFjm5DNk7og3DlPNcci4XMdIi4AoYXP8QNCKrDquC6mwEQIyIx8ABbHgAURRABFcWt8Vsdq53Kx3r9Qjkcv4gv5TmlmQhWeyjVyeXz3oKhcRaCx4GsRcC1OLapCGhxuHirAT7MTECTzt5WOS6cFzoFzf4rS5Oc8BQzQml-C5vKFIt4hV7KnCJf7Rm0Ot1emBg5tCTqEBTKRm8qzqabDOkU4Zo120t5IvnMjc-iVhYCYT6wX76uxJ6Lp-g66GiaBSZyXDHvP4IkbO6yrWkAqxBwX-EkgicAkWF97QTUIXPpcRZQqV9rw03kgPQoFvI6LzpLmVqhG4gRUqEXacpEgShDciS3soi4PmWc5KsQEAfg2X5pEOp5gTubhQTkJxcqBOaQZyVzHF2OaBEhQIlr6T6UNhYbrhGiZbrGQTxrBSZWlcaSsP2AG5ryxrUcUxRAA */
const RequestTransferMachine = createMachine(
  {
    context: {} as Context,
    tsTypes: {} as import("./request-transfer.typegen").Typegen0,
    schema: { events: {} as Events },
    id: "RequestTransferProvider",
    initial: "Ready",
    states: {
      Ready: {
        invoke: {
          src: "registerRequestTransferHandler",
          id: "registerRequestTransferHandler",
          onDone: [
            {
              target: "Authenticate",
              actions: "assignRequestTransferRequest",
            },
          ],
        },
      },
      Authenticate: {
        invoke: {
          src: "AuthenticationMachine",
          id: "AuthenticationMachine",
          onDone: [
            {
              target: "RequestTransfer",
              actions: "assignAuthSession",
            },
          ],
        },
      },
      RequestTransfer: {
        on: {
          CONFIRM: {
            target: "Confirm",
          },
        },
      },
      Confirm: {
        entry: "assignBlockHeight",
        on: {
          END: {
            target: "End",
          },
        },
      },
      End: {
        entry: "setBlockHeight",
        type: "final",
      },
    },
  },
  {
    actions: {
      assignAuthSession: assign((_, event) => ({
        authSession: event.data,
      })),
      assignRequestTransferRequest: assign({
        requestTransfer: (_, event) => event.data,
      }),
      setBlockHeight: ({ blockHeight }) => {
        _blockHeight = Number(blockHeight)
      },
      assignBlockHeight: assign({
        blockHeight: (_, event) => event.blockHeight,
      }),
    },
    services: {
      async registerRequestTransferHandler() {
        const params = await registerRequestTransferHandler(() => {
          return new Promise((resolve) => {
            setInterval(() => {
              _blockHeight &&
                resolve({
                  status: "SUCCESS",
                  height: _blockHeight,
                })
            }, 1000)
          })
        })
        console.debug("registerRequestTransferHandler", { params })
        return params
      },
      AuthenticationMachine,
    },
    guards: {},
  },
)

export default RequestTransferMachine

export type RequestTransferMachineActor = ActorRefFrom<
  typeof RequestTransferMachine
>
export type RequestTransferMachineType = typeof RequestTransferMachine
