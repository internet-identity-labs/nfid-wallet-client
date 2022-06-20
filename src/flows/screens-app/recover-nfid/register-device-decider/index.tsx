import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useDeviceInfo } from "frontend/hooks/use-device-info"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { AuthorizeRegisterDeciderScreen } from "frontend/screens/register-device-decider"
import { useUnknownDeviceConfig } from "frontend/screens/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { im } from 'frontend/api/actors'

interface AppScreenRegisterDeviceDeciderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  registerSuccessPath: string
}

export const RouterRegisterDeviceDecider: React.FC<
  AppScreenRegisterDeviceDeciderProps
> = ({ registerSuccessPath }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { recoverDevice, createSecurityDevice } = useDevices()
  const { readAccount, recoverAccount, createAccount } = useAccount()
  const { getPersona } = usePersona()
  const { user } = useAuthentication()
  const { generatePath } = useNFIDNavigate()

  const {
    browser: { name: browserName },
    platform: { os: deviceName },
  } = useDeviceInfo()
  const navigate = useNavigate()

  const { userNumber } = useUnknownDeviceConfig()

  const handleRegister = React.useCallback(async () => {
    setIsLoading(true)
    if (!userNumber) {
      return console.error(`Missing userNumber: ${userNumber}`)
    }

    await recoverDevice(userNumber)

    const response = await recoverAccount(userNumber)

    if (response?.status_code === 404) {
      console.warn("account not found. Recreating")
      await createAccount({ anchor: userNumber })

      // attach the current identity as access point
      const pub_key = Array.from(
        new Uint8Array(user?.internetIdentity.delegationIdentity.getPublicKey().toDer() ?? []),
      )
      const createAccessPointResponse =
        await im.create_access_point({
          icon: "laptop",
          device: deviceName,
          browser: browserName || "My Computer",
          pub_key,
        })
      if (createAccessPointResponse.status_code !== 200) {
        console.error("failed to create access point", {
          error: createAccessPointResponse.error[0],
        })
      }
    }
    await getPersona()

    navigate(generatePath(registerSuccessPath))
    setIsLoading(false)
  }, [
    browserName,
    createAccount,
    deviceName,
    generatePath,
    getPersona,
    user,
    navigate,
    recoverAccount,
    recoverDevice,
    registerSuccessPath,
    userNumber,
  ])

  const handleLogin = React.useCallback(async () => {
    if (!userNumber) throw new Error("unauthorized")
    setIsLoading(true)
    await Promise.all([readAccount(), getPersona()])
    setIsLoading(false)
    navigate(generatePath(registerSuccessPath))
  }, [
    generatePath,
    getPersona,
    navigate,
    readAccount,
    registerSuccessPath,
    userNumber,
  ])

  return (
    <AuthorizeRegisterDeciderScreen
      onLogin={handleLogin}
      isLoading={isLoading}
      onRegisterPlatformDevice={handleRegister}
      onRegisterSecurityDevice={createSecurityDevice}
    />
  )
}
