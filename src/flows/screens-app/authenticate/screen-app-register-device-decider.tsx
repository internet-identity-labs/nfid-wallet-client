import React, { useState } from "react"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useUnknownDeviceConfig } from "frontend/screens/authorize-app-unknown-device/hooks/use-unknown-device.config"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"

import { AppScreenRegisterDeviceDecider } from "../../../screens/register-device-decider"

interface AppScreenRegisterDeviceProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const AppScreenRegisterDevice: React.FC<
  AppScreenRegisterDeviceProps
> = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { createDevice } = useDevices()
  const { readAccount } = useAccount()
  const { getPersona } = usePersona()
  const { identityManager } = useAuthentication()

  const { userNumber, handleSendDelegate } = useUnknownDeviceConfig()
  const { createWebAuthNDevice } = useDevices()

  const handleLogin = React.useCallback(() => {
    handleSendDelegate()
  }, [handleSendDelegate])

  const handleRegister = React.useCallback(async () => {
    setIsLoading(true)
    if (!userNumber) {
      return console.error(`Missing userNumber: ${userNumber}`)
    }

    const { device } = await createWebAuthNDevice(BigInt(userNumber))
    await createDevice({
      ...device,
      userNumber,
    })
    await Promise.all([readAccount(identityManager, userNumber), getPersona()])

    setIsLoading(false)
    handleSendDelegate()
  }, [
    createDevice,
    createWebAuthNDevice,
    getPersona,
    handleSendDelegate,
    identityManager,
    readAccount,
    userNumber,
  ])

  return (
    <AppScreenRegisterDeviceDecider
      isLoading={isLoading}
      onRegister={handleRegister}
      onLogin={handleLogin}
    />
  )
}
