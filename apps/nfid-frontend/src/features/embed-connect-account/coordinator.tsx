import { useMachine } from "@xstate/react"

import { BlurredLoader } from "@nfid-frontend/ui"

import { AuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

import { RPCMessage } from "../embed/services/rpc-receiver"
import { EmbedChooseAccount } from "./components"
import { MappedConnectionDetails } from "./components/connection-details"
import EmbedConnectAccountMachine from "./machines"

type NFIDConnectAccountCoordinatorProps = {
  appMeta: AuthorizingAppMeta
  onConnect: (hostname: string, accountId: string) => void
  rpcMessage?: RPCMessage
  authRequest?: AuthorizationRequest
  authSession?: AuthSession
}

export const NFIDConnectAccountCoordinator: React.FC<
  NFIDConnectAccountCoordinatorProps
> = ({ appMeta, onConnect, rpcMessage, authRequest, authSession }) => {
  const [state, send] = useMachine(EmbedConnectAccountMachine)

  switch (true) {
    case state.matches("Start"):
      return (
        <EmbedChooseAccount
          onConnectionDetails={() => send({ type: "CONNECTION_DETAILS" })}
          onConnect={onConnect}
          applicationName={appMeta.name}
          applicationLogo={appMeta.logo}
          applicationURL={appMeta.url}
        />
      )
    case state.matches("ConnectionDetails"):
      return (
        <MappedConnectionDetails
          onCancel={() => send("BACK")}
          rpcMessage={rpcMessage}
          authSession={authSession}
        />
      )
    default:
      return <BlurredLoader className="w-full h-full" isLoading={true} />
  }
}
