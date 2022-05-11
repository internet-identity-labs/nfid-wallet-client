import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { useUnknownDeviceConfig } from "frontend/screens/authorize-app-unknown-device/hooks/use-unknown-device.config"
import { AppScreenRegisterDeviceDecider } from "frontend/screens/register-device-decider"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"

interface AppScreenRegisterDeviceDeciderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  registerSuccessPath: string
}

export const RouterRegisterDeviceDecider: React.FC<
  AppScreenRegisterDeviceDeciderProps
> = ({ registerSuccessPath }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { createDevice } = useDevices()
  const { recoverAccount, createAccount } = useAccount()
  const { getPersona } = usePersona()
  const { identityManager, internetIdentity } = useAuthentication()
  const { generatePath } = useNFIDNavigate()
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
          const message = "This device is already registered"
          console.debug(">> ", { message })

          return {
            message,
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

    const response = await recoverAccount(userNumber)
    if (response?.status_code === 404) {
      console.warn("account not found. Recreating")
      if (!identityManager) throw new Error("identityManager is missing")
      await createAccount(identityManager, { anchor: userNumber })

      // attach the current identity as access point
      const pub_key = Array.from(
        internetIdentity?.delegationIdentity.getPublicKey().toDer() ?? [],
      )
      console.log(">> handleRegister", { pub_key })
      const createAccessPointResponse =
        await identityManager.create_access_point({
          icon: "",
          device: "",
          browser: "",
          pub_key,
        })
      console.log(">> handleRegister", { createAccessPointResponse })
    }
    await getPersona()

    navigate(generatePath(registerSuccessPath))
    setIsLoading(false)
  }, [
    createAccount,
    generatePath,
    getPersona,
    handleCreateDevice,
    identityManager,
    internetIdentity?.delegationIdentity,
    navigate,
    recoverAccount,
    registerSuccessPath,
    userNumber,
  ])

  return (
    <AppScreenRegisterDeviceDecider
      onLogin={() => console.log(">> onLogin")}
      isLoading={isLoading}
      onRegister={handleRegister}
    />
  )
}
