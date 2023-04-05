import { useMachine } from "@xstate/react"

import { BlurredLoader } from "@nfid-frontend/ui"

import { AuthorizingAppMeta } from "frontend/state/authorization"

import EmbedConnectAccountMachine from "./machines"
import { ChooseAccount } from "./ui/choose-account"
import { ConnectionDetails } from "./ui/connection-details"

type NFIDConnectAccountCoordinatorProps = {
  appMeta: AuthorizingAppMeta
  onConnect: (hostname: string, accountId: string) => void
}

export const NFIDConnectAccountCoordinator: React.FC<
  NFIDConnectAccountCoordinatorProps
> = ({ appMeta, onConnect }) => {
  const [state, send] = useMachine(EmbedConnectAccountMachine)

  switch (true) {
    case state.matches("Start"):
      return (
        <ChooseAccount
          onConnectionDetails={() => send({ type: "CONNECTION_DETAILS" })}
          onConnect={onConnect}
          applicationName={appMeta.name}
          applicationLogo={appMeta.logo}
          applicationURL={appMeta.url}
        />
      )
    case state.matches("ConnectionDetails"):
      return <ConnectionDetails onBack={() => send("BACK")} />
    default:
      return <BlurredLoader className="w-full h-full" isLoading={true} />
  }
}
