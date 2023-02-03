import { createMachine } from "xstate"
import { ConnectAccountService, SendTransactionService } from './connect/service'
import AuthenticationMachine from "frontend/state/machines/authentication/authentication"
import { RPCMessage, RPCResponse } from "./rpc-service"
import { assign } from "lodash"

const appMeta = ({
  appMeta: { name: "Rarible SDK Example", logo: "https://app.rarible.com/favicon.ico" },
})

type Events =
  | {
    type: "done.invoke.ConnectAccountService"
    data: RPCResponse
  } | {
    type: "done.invoke.SendTransactionService"
    data: RPCResponse
  } | {
    type: "error.platform.SendTransactionService";
    data: Error
  } | {
    type: "CONNECT_ACCOUNT",
    data: RPCMessage
  } | {
    type: "SEND_TRANSACTION",
    data: RPCMessage
  }

type NFIDEmbedMachineContext = {
  error?: any
}

export const NFIDEmbedMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QDkBiBJAIgUQLYCNIBZAQwGMALASwDswA6dGqgFwCUAFAYQGI0sA+gEEAqgBUAEtmRj0XIWOwBtAAwBdRKAAOAe1isqOmppAAPRAFoAnPRUBGABwAmB3YCsAZjsAWe9+9OADQgAJ6IAfRWHgBsbiqxdrEeXtEAvqnB-DgExOTUdPRCAK4sFGA0LFRkJJVGpJS0YDwQRgy0AG46ANYMJCVlFVU1YKoaSCC6+rXG4+YIFtH0HioxHg7R8W5OVgDsiW7BYQhObnb0bt6uMSd2Kg47Tt7pmRjZhBD1+QxsYCQQITxsJJhFwuAB5EQyADKoxMkwMRhMc22bno3jce2i3isPg8-mih0QHicZziKhUThi0WcO2iaWeIBoOggcBMWTw70+jThegRM1AcwsGNsjhc7i8vh83kJ8zsTickRicuclMeDjuDPZOQ+eUajGY7G4PKmhn5ZnCqLsVlidN8eMc1IJoUsHlR3iVTmiVnuVm2Pk1rw5uQaBR+fyO2l50yR4SCzoQxNJ5IpVJptoDWCDOpDDGKpXKlWq0y5dGNfJjCACMp8KlsybsOwlKjJOwzb2DX3oXCMdDILCEZDIOiKFTL0dmiDcFyW1LiOIcaysbidRycO1RZIpnv8rqsVie6VSQA */
  createMachine({
    tsTypes: {} as import("./machine.typegen").Typegen0,
    schema: { events: {} as Events, context: {} as NFIDEmbedMachineContext },
    id: "NFIDEmbedMachine",
    initial: "AuthenticationMachine",
    states: {
      Ready: {
        on: {
          CONNECT_ACCOUNT: "ConnectAccount",
          SEND_TRANSACTION: "SendTransaction",
        }
      },
      Error: {},

      AuthenticationMachine: {
        invoke: {
          src: "AuthenticationMachine",
          id: "authenticate",
          onDone: "Ready",
          data: () => appMeta,
        },
        exit: "nfid_authenticated",
      },

      ConnectAccount: {
        invoke: {
          src: "ConnectAccountService",
          id: "ConnectAccountService",
          onDone: "Ready",
        },
        exit: ["sendRPCResponse"]
      },
      SendTransaction: {
        invoke: {
          src: "SendTransactionService",
          id: "SendTransactionService",
          onDone: "Ready",
          onError: { target: "Error", actions: "assingError" }
        },
        exit: ["sendRPCResponse"]
      }
    },
  }, {
    actions: {
      // FIXME:
      // @ts-ignore
      assingError: assign({ error: (context: any, event: any) => event.error }),
      nfid_authenticated: () => {
        console.debug("nfid_authenticated")
        window.parent.postMessage({ type: "nfid_authenticated" }, "http://localhost:3000")
      },
      sendRPCResponse: (_, event) => {
        console.debug("sendRPCResponse", { event })
        // FIXME:
        // why do we receive event.type `xstate.stop`?
        if (event.type !== "xstate.stop") {
          window.parent.postMessage({ ...event.data }, "http://localhost:3000")
        }
      }

    },
    services: {
      AuthenticationMachine,
      ConnectAccountService,
      // FIXME:
      // @ts-ignore
      SendTransactionService
    }
  })
