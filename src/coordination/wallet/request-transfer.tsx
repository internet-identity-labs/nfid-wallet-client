import { useMachine } from "@xstate/react"
import { useEffect } from "react"

import { RequestTransfer } from "frontend/apps/identity-manager/request-transfer"
import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"
import RequestTransferMachine, {
  RequestTransferMachineType,
} from "frontend/state/machines/wallet/request-transfer"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"
import { TransferModalSuccess } from "frontend/ui/organisms/transfer-modal/sucess"
import { RequestTransferPage } from "frontend/ui/pages/request-transfer"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"

import { AuthenticationCoordinator } from "../authentication"

interface Props {
  machine?: RequestTransferMachineType
}

export default function RequestTransferCoordinator({ machine }: Props) {
  const [state, send] = useMachine(machine || RequestTransferMachine)

  useEffect(() => {
    console.debug("RequestTransferCoordinator", { state: state.value })
  }, [state])

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
        <ScreenResponsive>
          <AuthenticationCoordinator
            actor={state.children.AuthenticationMachine as AuthenticationActor}
          />
        </ScreenResponsive>
      )
    case state.matches("RequestTransfer"):
      return (
        <RequestTransfer
          applicationName={state.context.appMeta?.name}
          applicationLogo={state.context.appMeta?.logo}
          to={state.context.requestTransfer?.to ?? ""}
          amountICP={state.context.requestTransfer?.amount ?? 0}
          onSuccess={() => send("SUCCESS")}
        />
      )
    case state.matches("End"):
      return (
        <ScreenResponsive>
          <TransferModalSuccess
            transactionMessage={`${state.context.requestTransfer?.amount} ICP was sent`}
            onClose={() => window.close()}
          />
        </ScreenResponsive>
      )
    default:
      console.debug(
        `PhoneCredentialCoordinator rendering loader, unknown state: ${JSON.stringify(
          state.value,
        )}`,
      )
      return <BlurredLoader isLoading />
  }
}
