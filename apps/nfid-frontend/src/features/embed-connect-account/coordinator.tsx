import { useActor } from "@xstate/react"

import { NFIDConnectAccountActor } from "./machines"
import { ChooseAccount } from "./ui/choose-account"
import { ConnectionDetails } from "./ui/connection-details"

export const NFIDConnectAccountCoordinator = ({
  actor,
}: Actor<NFIDConnectAccountActor>) => {
  const [state, send] = useActor(actor)

  switch (true) {
    case state.matches("Ready") || state.matches("ConnectWithAccount"):
      return (
        <ChooseAccount
          onConnectionDetails={() => send({ type: "CONNECTION_DETAILS" })}
          onConnect={(accountId: string) =>
            send({
              type: "CONNECT_WITH_ACCOUNT",
              data: accountId,
            })
          }
          applicationName={state.context?.appMeta?.name}
          applicationLogo={state.context?.appMeta?.logo}
          applicationURL={state.context?.appMeta?.url}
          isLoading={state.matches("ConnectWithAccount")}
        />
      )
    case state.matches("ConnectionDetails"):
      return <ConnectionDetails onBack={() => send("BACK")} />
    case state.matches("Error"):
      return <div>Some Error happened</div>
    default:
      return <div>NFIDConnectAccountCoordinator</div>
  }
}
