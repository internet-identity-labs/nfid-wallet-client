import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useGeneratePath } from "frontend/hooks/use-generate-path"
import { useUnknownDeviceConfig } from "frontend/screens/authorize-app-unknown-device/hooks/use-unknown-device.config"
import { AppScreenRegisterDevice as AppScreenRegisterDeviceRaw } from "frontend/screens/register-device"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"

interface AppScreenRegisterDeviceProps
  extends React.HTMLAttributes<HTMLDivElement> {
  registerSuccessPath: string
}

export const AppScreenRegisterDevice: React.FC<
  AppScreenRegisterDeviceProps
> = ({ registerSuccessPath }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { createDevice } = useDevices()
  const { recoverAccount } = useAccount()
  const { getPersona } = usePersona()
  const { identityManager } = useAuthentication()
  const { generatePath } = useGeneratePath()
  const navigate = useNavigate()

  const { userNumber } = useUnknownDeviceConfig()
  const { createWebAuthNDevice } = useDevices()

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
    setIsLoading(true)
    if (!userNumber) {
      return console.error(`Missing userNumber: ${userNumber}`)
    }

    await handleCreateDevice(userNumber)

    await recoverAccount(userNumber, identityManager)
    await getPersona()

    navigate(generatePath(registerSuccessPath))
    setIsLoading(false)
  }, [
    generatePath,
    getPersona,
    handleCreateDevice,
    identityManager,
    navigate,
    recoverAccount,
    registerSuccessPath,
    userNumber,
  ])

  return (
    <AppScreenRegisterDeviceRaw
      isLoading={isLoading}
      onRegister={handleRegister}
    />
  )
}
