import { useActor } from "@xstate/react"

import { KnownDeviceActor } from "frontend/state/machines/authentication/known-device"
import { AuthorizeAppMultiAccount } from "frontend/ui/pages/authorize-app/multi-account"
import { AuthorizeAppSingleAccount } from "frontend/ui/pages/authorize-app/single-account"

export function KnownDeviceCoordinator({ actor }: Actor<KnownDeviceActor>) {
  const [state, send] = useActor(actor)

  switch (true) {
    case state.matches("Start"):
      return <div>Loading Devices</div>
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
