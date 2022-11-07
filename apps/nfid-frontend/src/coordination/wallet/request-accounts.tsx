import { useMachine } from "@xstate/react"
import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"

import { RequestAccounts } from "frontend/apps/identity-manager/request-accounts"
import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"
import RequestAccountsMachine, {
  RequestAccountsMachineType,
} from "frontend/state/machines/wallet/request-accounts"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"

import { AuthenticationCoordinator } from "../authentication"

export default function RequestAccountsCoordinator() {
  const [searchParams] = useSearchParams()
  const applicationName = searchParams.get("applicationName")
  const applicationLogo = searchParams.get("applicationLogo")

  const [state, send] = useMachine(
    RequestAccountsMachine.withConfig(
      {},
      {
        appMeta: { name: applicationName || "", logo: applicationLogo || "" },
      },
    ),
  )

  useEffect(() => {
    console.debug("RequestAccountsCoordinator", { state: state.value })
  }, [state])

  switch (true) {
    case state.matches("Ready"):
      return (
        <BlurredLoader
          isLoading
          loadingMessage={`Connecting to ${
            state.context?.appMeta?.name ?? "the application"
          }`}
        />
      )
    case state.matches("Authenticate"):
      return (
        <ScreenResponsive>
          <AuthenticationCoordinator
            actor={state.children.AuthenticationMachine as AuthenticationActor}
            enforceSingleAccountScreen
          />
        </ScreenResponsive>
      )
    case state.matches("RequestAccounts"):
      return (
        <RequestAccounts
          applicationName={state.context?.appMeta?.name}
          applicationLogo={state.context.appMeta?.logo}
          onSuccess={(accounts: string[]) => {
            send({ type: "SUCCESS", accounts: accounts })
          }}
        />
      )
    default:
      console.debug(
        `RequestAccounts rendering loader, unknown state: ${JSON.stringify(
          state.value,
        )}`,
      )
      return <BlurredLoader isLoading />
  }
}
