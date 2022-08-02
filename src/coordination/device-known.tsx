import { useActor } from "@xstate/react"

import { KnownDeviceActor } from "frontend/state/machines/authentication/known-device"
import { AuthorizeAppMultiAccount } from "frontend/ui/pages/authorize-app/multi-account"
import { AuthorizeAppSingleAccount } from "frontend/ui/pages/authorize-app/single-account"
import { NFIDLogin } from "frontend/ui/pages/nfid-login"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"

export function KnownDeviceCoordinator({ actor }: Actor<KnownDeviceActor>) {
  const [state, send] = useActor(actor)

  console.debug("KnownDeviceCoordinator", {
    context: state.context,
    state: state.value,
  })

  switch (true) {
    case state.matches("Start"):
      return (
        <ScreenResponsive
          isLoading
          loadingMessage="Loading Configuration"
          className="flex flex-col items-center"
        />
      )
    case state.matches("Authenticate"):
    case state.matches("Login"):
      switch (true) {
        case state.context.isNFID:
          return (
            <ScreenResponsive
              isLoading={state.matches("Login")}
              loadingMessage={"Unlocking your NFID"}
              className="flex flex-col items-center"
            >
              <NFIDLogin
                account={state.context.profile}
                onLogin={() => send("UNLOCK")}
              />
            </ScreenResponsive>
          )
        case state.context.isSingleAccountApplication:
          return (
            <AuthorizeAppSingleAccount
              isLoading={state.matches("Login")}
              applicationName={state.context?.authAppMeta?.name}
              applicationLogo={state.context?.authAppMeta?.logo}
              onContinueButtonClick={async () => send("UNLOCK")}
            />
          )
        default:
          return (
            <AuthorizeAppMultiAccount
              isLoading={state.matches("Login")}
              applicationName={state.context?.authAppMeta?.name}
              applicationLogo={state.context?.authAppMeta?.logo}
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
      return <ScreenResponsive isLoading />
  }
}
