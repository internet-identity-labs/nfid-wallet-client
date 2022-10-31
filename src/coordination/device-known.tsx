import { useActor } from "@xstate/react"

import { KnownDeviceActor } from "frontend/state/machines/authentication/known-device"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"
import { AuthorizeApp } from "frontend/ui/pages/authorize-app"
import { AuthorizeAppSingleAccount } from "frontend/ui/pages/authorize-app/single-account"
import { NFIDLogin } from "frontend/ui/pages/nfid-login"

interface KnownDeviceCoordinatorProps {
  actor: KnownDeviceActor
  enforceSingleAccountScreen?: boolean
}
export function KnownDeviceCoordinator({
  actor,
  enforceSingleAccountScreen,
}: KnownDeviceCoordinatorProps) {
  const [state, send] = useActor(actor)

  console.debug("KnownDeviceCoordinator", {
    context: state.context,
    state: state.value,
  })

  switch (true) {
    case state.matches("Start"):
      return (
        <BlurredLoader isLoading loadingMessage={"Loading Configuration"} />
      )
    case state.matches("Authenticate"):
    case state.matches("Login"):
      switch (true) {
        case state.context.isNFID:
          return (
            <BlurredLoader
              isLoading={state.matches("Login")}
              loadingMessage={"Unlocking your NFID"}
            >
              <NFIDLogin
                account={state.context.profile}
                onLogin={() => send("UNLOCK")}
              />
            </BlurredLoader>
          )
        case state.context.isSingleAccountApplication ||
          enforceSingleAccountScreen:
          return (
            <AuthorizeAppSingleAccount
              isLoading={state.matches("Login")}
              loadingMessage={"Unlocking your NFID"}
              applicationName={state.context?.appMeta?.name}
              applicationLogo={state.context?.appMeta?.logo}
              onContinueButtonClick={async () => send("UNLOCK")}
            />
          )
        default:
          return (
            <AuthorizeApp
              isLoading={state.matches("Login")}
              loadingMessage={"Unlocking your NFID"}
              applicationName={state.context?.appMeta?.name}
              applicationLogo={state.context?.appMeta?.logo}
              accounts={[]}
              onUnlockNFID={async () => send("UNLOCK")}
              onCreateAccount={function (): Promise<void> {
                throw new Error(
                  `KnownDeviceCoordinator onCreateAccount not implemented.`,
                )
              }}
              onLogin={function (): Promise<void> {
                throw new Error(
                  `KnownDeviceCoordinator onLogin not implemented.`,
                )
              }}
            />
          )
      }
    case state.matches("End"):
    default:
      return <BlurredLoader isLoading />
  }
}
