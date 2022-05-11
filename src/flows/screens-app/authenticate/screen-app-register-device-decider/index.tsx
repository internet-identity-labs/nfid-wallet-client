import React, { useState } from "react"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useUnknownDeviceConfig } from "frontend/screens/authorize-app-unknown-device/hooks/use-unknown-device.config"
import { AppScreenRegisterDeviceDecider as AppScreenRegisterDeviceDeciderRaw } from "frontend/screens/register-device-decider"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"

interface AppScreenRegisterDeviceProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const AppScreenRegisterDeviceDecider: React.FC<
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
    console.log(">> handleLogin")
    handleSendDelegate()
  }, [handleSendDelegate])

  const handleCreateDevice = React.useCallback(
    async (userNumber) => {
      try {
        const { device } = await createWebAuthNDevice(BigInt(userNumber))
        await createDevice({
          ...device,
          userNumber,
        })

        return {
          message: "Device created successfully",
        }
      } catch (error) {
        if (
          (error as DOMException).message ===
          "The user attempted to register an authenticator that contains one of the credentials already registered with the relying party."
        ) {
          console.log(">> existing device", {})

          return {
            message: "This device is already registered",
          }
        }
        throw error
      }
    },
    [createDevice, createWebAuthNDevice],
  )

  const handleRegister = React.useCallback(async () => {
    console.log(">> handleRegister")

    setIsLoading(true)
    if (!userNumber) {
      return console.error(`Missing userNumber: ${userNumber}`)
    }

    await handleCreateDevice(userNumber)

    await Promise.all([readAccount(identityManager), getPersona()])

    setIsLoading(false)
    handleSendDelegate()
  }, [
    getPersona,
    handleCreateDevice,
    handleSendDelegate,
    identityManager,
    readAccount,
    userNumber,
  ])

  return (
    <AppScreenRegisterDeviceDeciderRaw
      isLoading={isLoading}
      onRegister={handleRegister}
      onLogin={handleLogin}
    />
  )
}
