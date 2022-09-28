import { useActor } from "@xstate/react"
import React, { useState } from "react"

import { useDeviceInfo } from "frontend/integration/device"
import {
  registerDeviceWithSecurityKey,
  registerDeviceWithWebAuthn,
} from "frontend/integration/device/services"
import { TrustDeviceActor } from "frontend/state/machines/authentication/trust-device"
import { AuthorizeRegisterDeciderScreen } from "frontend/ui/pages/register-device-decider"

export function TrustDeviceCoordinator({ actor }: Actor<TrustDeviceActor>) {
  const [isLoading, setIsLoading] = useState(false)
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
      onRegisterPlatformDevice={async () => {
        setIsLoading(true)
        await registerDeviceWithWebAuthn().then(() => send("END"))
        setIsLoading(false)
      }}
      onRegisterSecurityDevice={async () => {
        setIsLoading(true)
        await registerDeviceWithSecurityKey().then(() => send("END"))
        setIsLoading(false)
      }}
      isLoading={isLoading || !state.matches("Select")}
      loadingMessage={isLoading ? "registering device" : undefined}
      isPlatformAuthenticatorAvailable={!!hasPlatformAuthenticator}
      deviceName={platform.device}
      platformAuthenticatorName={platform.authenticator}
    />
  )
}
