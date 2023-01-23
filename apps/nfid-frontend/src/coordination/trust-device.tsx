import { useActor } from "@xstate/react"
import React from "react"

import { useDeviceInfo } from "frontend/integration/device"
import { TrustDeviceActor } from "frontend/state/machines/authentication/trust-device"
import { AuthorizeRegisterDeciderScreen } from "frontend/ui/pages/register-device-decider"

export function TrustDeviceCoordinator({ actor }: Actor<TrustDeviceActor>) {
  const [state, send] = useActor(actor)
  const { hasPlatformAuthenticator, platform } = useDeviceInfo()

  React.useEffect(
    () =>
      console.debug("TrustDeviceCoordinator", {
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
      loadingMessage={
        !state.matches("Select") ? "registering device" : undefined
      }
      isPlatformAuthenticatorAvailable={!!hasPlatformAuthenticator}
      deviceName={platform.device}
      platformAuthenticatorName={platform.authenticator}
    />
  )
}
