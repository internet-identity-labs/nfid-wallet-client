import { useMachine } from "@xstate/react"
import { AuthenticationCoordinator } from "frontend/coordination/authentication"
import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"
import React from "react"
import { NFIDEmbedMachine } from "./machine"
import { rpcMessages } from "./rpc-service"

export const NFIDEmbedCoordinator = () => {
  const [state, send] = useMachine(NFIDEmbedMachine)

  React.useEffect(() => {
    console.debug("NFIDEmbedCoordinator", { state })
    const observer = rpcMessages.subscribe(({ data, origin }) => {
      console.debug("NFIDEmbedCoordinator", { data, origin })
      switch (data.method) {
        case "eth_accounts":
          return send("CONNECT_ACCOUNT", { data, origin })
        case "eth_sendTransaction":
          return send("SEND_TRANSACTION", { data, origin })
        default:
          console.warn("Unhandled RPC message", data)
          break
      }
    })
    return () => observer.unsubscribe()
  }, [state, send])

  switch (true) {
    case state.matches("AuthenticationMachine"):
      return (
        <AuthenticationCoordinator
          actor={state.children.authenticate as AuthenticationActor}
        />
      )
    case state.matches("ConnectAccount"):
      return (
        <div>ConnectAccount</div>
      )
    case state.matches("SendTransaction"):
      return (
        <div>SendTransaction</div>
      )
    case state.matches("Ready"):
      return (
        <div>Waiting for RPC Messages</div>
      )
    default: return <div>NFIDEmbedCoordinator</div>
  }
}
