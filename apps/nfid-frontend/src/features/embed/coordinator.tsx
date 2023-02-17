import { useMachine } from "@xstate/react"

import { AuthenticationCoordinator } from "frontend/coordination/authentication"
import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"

import { NFIDConnectAccountCoordinator } from "../embed-connect-account/coordinator"
import { NFIDConnectAccountActor } from "../embed-connect-account/machines"
import { NFIDEmbedMachine } from "./machines"

export const NFIDEmbedCoordinator = () => {
  const [state] = useMachine(NFIDEmbedMachine)

  switch (true) {
    case state.matches("AuthenticationMachine"):
      return (
        <AuthenticationCoordinator
          actor={state.children.authenticate as AuthenticationActor}
        />
      )
    case state.matches("ConnectAccount"):
      return (
        <NFIDConnectAccountCoordinator
          actor={
            state.children.EmbedConnectAccountMachine as NFIDConnectAccountActor
          }
        />
      )
    case state.matches("SendTransaction"):
      return <div>SendTransaction</div>
    case state.matches("SignTypedDataV4"):
      return <div>SignTypedDataV4</div>
    case state.matches("Ready"):
      return <div>Waiting for RPC Messages</div>
    case state.matches("Error"):
      return <div>Some Error happened</div>
    default:
      return <div>NFIDEmbedCoordinator</div>
  }
}
