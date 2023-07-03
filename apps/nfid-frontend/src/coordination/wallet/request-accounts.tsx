import { useMachine } from "@xstate/react"
import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"

import { ScreenResponsive } from "@nfid-frontend/ui"

import { RequestAccounts } from "frontend/apps/identity-manager/request-accounts"
import AuthenticationCoordinator from "frontend/features/authentication/root/coordinator"
import { AuthenticationMachineActor } from "frontend/features/authentication/root/root-machine"
import RequestAccountsMachine from "frontend/state/machines/wallet/request-accounts"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

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
            actor={
              state.children.AuthenticationMachine as AuthenticationMachineActor
            }
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
