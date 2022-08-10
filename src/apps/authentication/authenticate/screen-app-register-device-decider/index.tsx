import React, { useState } from "react"

import { im } from "frontend/integration/actors"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { useDevices } from "frontend/integration/identity-manager/devices/hooks"
import { usePersona } from "frontend/integration/identity-manager/persona/hooks"
import { authState } from "frontend/integration/internet-identity"
import { AuthorizeRegisterDeciderScreen } from "frontend/ui/pages/register-device-decider"
import { useUnknownDeviceConfig } from "frontend/ui/pages/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"

interface AppScreenRegisterDeviceProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const AppScreenRegisterDeviceDecider: React.FC<
  AppScreenRegisterDeviceProps
> = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { recoverDevice, createSecurityDevice } = useDevices()
  const { createAccount, recoverAccount } = useAccount()
  const { getPersona } = usePersona()

  const { userNumber, handleSendDelegate } = useUnknownDeviceConfig()

  const handleLogin = React.useCallback(() => {
    handleSendDelegate()
  }, [handleSendDelegate])

  const handleRegister = React.useCallback(async () => {
    setIsLoading(true)
    if (!userNumber) {
      return console.error(`Missing userNumber: ${userNumber}`)
    }

    await recoverDevice(Number(userNumber))

    try {
      await recoverAccount(userNumber, true)
    } catch (e) {
      console.warn("account not found. Recreating")
      await createAccount({ anchor: userNumber })

      // attach the current identity as access point
      const pub_key = Array.from(
        new Uint8Array(
          authState.get()?.delegationIdentity?.getPublicKey().toDer() ?? [],
        ),
      )

      await im
        .create_access_point({
          icon: "",
          device: "",
          browser: "",
          pub_key,
        })
        .catch((e) => {
          throw new Error(
            `AppScreenRegisterDeviceDecider.handleRegister im.create_access_point: ${e.message}`,
          )
        })
    }

    await getPersona()
    handleSendDelegate()
    setIsLoading(false)
  }, [
    createAccount,
    getPersona,
    handleSendDelegate,
    recoverAccount,
    recoverDevice,
    userNumber,
  ])

  const handleCreateSecurityDevice = React.useCallback(async () => {
    setIsLoading(true)
    await createSecurityDevice(userNumber, "authentication")
    handleSendDelegate()
    setIsLoading(false)
  }, [createSecurityDevice, handleSendDelegate, userNumber])

  return (
    <AuthorizeRegisterDeciderScreen
      onLogin={handleLogin}
      isLoading={isLoading}
      onRegisterPlatformDevice={handleRegister}
      onRegisterSecurityDevice={handleCreateSecurityDevice}
    />
  )
}
