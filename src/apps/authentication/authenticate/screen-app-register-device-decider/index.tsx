import React, { useState } from "react"

import { AuthorizeRegisterDeciderScreen } from "frontend/design-system/pages/register-device-decider"
import { useUnknownDeviceConfig } from "frontend/design-system/pages/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { im } from "frontend/comm/actors"
import { useAccount } from "frontend/comm/services/identity-manager/account/hooks"
import { useDevices } from "frontend/comm/services/identity-manager/devices/hooks"
import { usePersona } from "frontend/comm/services/identity-manager/persona/hooks"

interface AppScreenRegisterDeviceProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const AppScreenRegisterDeviceDecider: React.FC<
  AppScreenRegisterDeviceProps
> = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { recoverDevice, createSecurityDevice } = useDevices()
  const { createAccount, recoverAccount } = useAccount()
  const { getPersona } = usePersona()
  const { user } = useAuthentication()

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

    const response = await recoverAccount(userNumber)

    if (response?.status_code === 404) {
      console.warn("account not found. Recreating")
      await createAccount({ anchor: userNumber })

      // attach the current identity as access point
      const pub_key = Array.from(
        new Uint8Array(
          user?.internetIdentity.delegationIdentity.getPublicKey().toDer() ??
            [],
        ),
      )

      await im.create_access_point({
        icon: "",
        device: "",
        browser: "",
        pub_key,
      })
    }
    await getPersona()
    handleSendDelegate()
    setIsLoading(false)
  }, [
    createAccount,
    getPersona,
    handleSendDelegate,
    user,
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
