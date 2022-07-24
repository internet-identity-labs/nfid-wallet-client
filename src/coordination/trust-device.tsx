import { useActor } from "@xstate/react"

import { TrustDeviceActor } from "frontend/state/machines/authentication/trust-device"
import { AuthorizeRegisterDeciderScreen } from "frontend/ui/pages/register-device-decider"

export function TrustDeviceCoordinator({ actor }: Actor<TrustDeviceActor>) {
  const [state, send] = useActor(actor)
  console.debug(TrustDeviceCoordinator.name, {
    context: state.context,
    state: state.value,
  })
  switch (true) {
    case state.matches("Select"):
    case state.matches("IsMobileWebAuthn"):
    case state.matches("RegisterWithWebAuthn"):
    case state.matches("RegisterWithSecurityKey"):
    case state.matches("End"):
      return (
        <AuthorizeRegisterDeciderScreen
          onLogin={() => send("DONT_TRUST")}
          onRegisterPlatformDevice={async () => send("TRUST")}
          onRegisterSecurityDevice={async () => send("TRUST")}
          isLoading={
            state.matches("IsMobileWebAuthn") ||
            state.matches("RegisterWithSecurityKey") ||
            state.matches("RegisterWithWebAuthn") ||
            state.matches("End")
          }
        />
      )
    default:
      return <div>{TrustDeviceCoordinator.name}</div>
  }
}
