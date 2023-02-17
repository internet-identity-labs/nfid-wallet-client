import { useMachine } from "@xstate/react"

import { NFIDConnectAccountMachine } from "./machines"
import { ChooseAccount } from "./ui/choose-account"
import { ConnectionDetails } from "./ui/connection-details"

export const NFIDConnectAccountCoordinator = () => {
  const [state, send] = useMachine(NFIDConnectAccountMachine)

  switch (true) {
    case state.matches("Ready"):
      return (
        <ChooseAccount
          onConnectionDetails={() => send({ type: "CONNECTION_DETAILS" })}
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
