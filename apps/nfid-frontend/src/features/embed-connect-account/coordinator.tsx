import { useActor } from "@xstate/react"

import { BlurredLoader } from "@nfid-frontend/ui"

import { NFIDConnectAccountActor } from "./machines"
import { ChooseAccount } from "./ui/choose-account"
import { ConnectionDetails } from "./ui/connection-details"

export const NFIDConnectAccountCoordinator = ({
  actor,
}: Actor<NFIDConnectAccountActor>) => {
  const [state, send] = useActor(actor)

  switch (true) {
    case state.matches("Start"):
      return (
        <ChooseAccount
          onConnectionDetails={() => send({ type: "CONNECTION_DETAILS" })}
          onConnect={(hostname: string, accountId: string) =>
            send({
              type: "CONNECT_WITH_ACCOUNT",
              data: { hostname, accountId },
            })
          }
          onConnectAnonymously={() => send({ type: "CONNECT_ANONYMOUSLY" })}
          applicationName={state.context?.appMeta?.name}
          applicationLogo={state.context?.appMeta?.logo}
          applicationURL={state.context?.appMeta?.url}
          accounts={state?.context?.accounts}
        />
      )
    case state.matches("ConnectionDetails"):
      return <ConnectionDetails onBack={() => send("BACK")} />
    case state.matches("Error"):
      return <div>Some Error happened</div>
    default:
      return <BlurredLoader className="w-full h-full" isLoading={true} />
  }
}
