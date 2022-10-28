import { useMachine } from "@xstate/react"

import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"
import RequestTransferMachine, {
  RequestTransferMachineType,
} from "frontend/state/machines/wallet/request-transfer"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import { AuthenticationCoordinator } from "../authentication"

interface Props {
  machine?: RequestTransferMachineType
}

export default function RequestTransferCoordinator({ machine }: Props) {
  const [state, send] = useMachine(machine || RequestTransferMachine)

  switch (true) {
    case state.matches("Ready"):
      return (
        <BlurredLoader
          isLoading
          loadingMessage={`Connecting to ${
            state.context.appMeta?.name ?? "the application"
          }`}
        />
      )
    case state.matches("Authenticate"):
      return (
        <AuthenticationCoordinator
          actor={state.children.AuthenticationMachine as AuthenticationActor}
        />
      )
    case state.matches("RequestTransfer"):
      return <div>Do your magic here magic here @Pashunya 🪩</div>
    default:
      console.debug(
        `PhoneCredentialCoordinator rendering loader, unknown state: ${JSON.stringify(
          state.value,
        )}`,
      )
      return <BlurredLoader isLoading />
  }
}
