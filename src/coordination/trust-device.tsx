import { useActor } from "@xstate/react"
import React from "react"

import { TrustDeviceActor } from "frontend/state/machines/authentication/trust-device"
import { AuthorizeRegisterDeciderScreen } from "frontend/ui/pages/register-device-decider"

export function TrustDeviceCoordinator({ actor }: Actor<TrustDeviceActor>) {
  const [state, send] = useActor(actor)
  React.useEffect(
    () =>
      console.debug(TrustDeviceCoordinator.name, {
        context: state.context,
        state: state.value,
      }),
    [state.value, state.context],
  )
  return (
    <AuthorizeRegisterDeciderScreen
      onLogin={() => send("DONT_TRUST")}
      onRegisterPlatformDevice={async () => send("TRUST")}
      onRegisterSecurityDevice={async () => send("TRUST")}
      isLoading={!state.matches("Select")}
    />
  )
}
