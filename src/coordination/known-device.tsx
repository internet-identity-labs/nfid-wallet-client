import { useActor } from "@xstate/react"

import { Loader } from "@internet-identity-labs/nfid-sdk-react"

import { KnownDeviceActor } from "frontend/state/machines/authentication/known-device"
import { AuthorizeAppMultiAccount } from "frontend/ui/pages/authorize-app/multi-account"
import { AuthorizeAppSingleAccount } from "frontend/ui/pages/authorize-app/single-account"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"

export function KnownDeviceCoordinator({ actor }: Actor<KnownDeviceActor>) {
  const [state, send] = useActor(actor)

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
        case state.context.isSingleAccountApplication:
          return (
            <AuthorizeAppSingleAccount
              isLoading={false}
              onContinueButtonClick={function (): Promise<void> {
                throw new Error("Function not implemented.")
              }}
            />
          )
        default:
          return (
            <AuthorizeAppMultiAccount
              isAuthenticated={false}
              applicationName={""}
              accounts={[]}
              onUnlockNFID={async () => send("UNLOCK")}
              onCreateAccount={function (): Promise<void> {
                throw new Error("Function not implemented.")
              }}
              applicationLogo={""}
              isLoading={false}
              onLogin={function (
                personaId?: string | undefined,
              ): Promise<void> {
                throw new Error("Function not implemented.")
              }}
            />
          )
      }
    case state.matches("End"):
      return <div>End</div>
    default:
      return <div>KnownDeviceCoordinator</div>
  }
}
