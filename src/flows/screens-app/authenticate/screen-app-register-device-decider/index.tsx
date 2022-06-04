import React, { useState } from "react"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { AuthorizeRegisterDeciderScreen } from "frontend/screens/register-device-decider"
import { useUnknownDeviceConfig } from "frontend/screens/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"

interface AppScreenRegisterDeviceProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const AppScreenRegisterDeviceDecider: React.FC<
  AppScreenRegisterDeviceProps
> = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { recoverDevice, createSecurityDevice } = useDevices()
  const { createAccount, recoverAccount } = useAccount()
  const { getPersona } = usePersona()
  const { internetIdentity, identityManager } = useAuthentication()

  const { userNumber, handleSendDelegate } = useUnknownDeviceConfig()

  const handleLogin = React.useCallback(() => {
    handleSendDelegate()
  }, [handleSendDelegate])

  const handleRegister = React.useCallback(async () => {
    setIsLoading(true)
    if (!userNumber) {
      return console.error(`Missing userNumber: ${userNumber}`)
    }
    if (!identityManager) throw new Error("Missing identityManager")

    await recoverDevice(userNumber)

    const response = await recoverAccount(userNumber)

    if (response?.status_code === 404) {
      console.warn("account not found. Recreating")
      await createAccount({ anchor: userNumber })

      // attach the current identity as access point
      const pub_key = Array.from(
        internetIdentity?.delegationIdentity.getPublicKey().toDer() ?? [],
      )

      await identityManager.create_access_point({
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
    identityManager,
    internetIdentity?.delegationIdentity,
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
