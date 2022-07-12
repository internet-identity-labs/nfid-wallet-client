import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

import { AuthorizeRegisterDeciderScreen } from "frontend/design-system/pages/register-device-decider"
import { useUnknownDeviceConfig } from "frontend/design-system/pages/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useDeviceInfo } from "frontend/apps/device/use-device-info"
import { im } from "frontend/comm/actors"
import { useAccount } from "frontend/comm/services/identity-manager/account/hooks"
import { useDevices } from "frontend/comm/services/identity-manager/devices/hooks"
import { usePersona } from "frontend/comm/services/identity-manager/persona/hooks"
import { authState } from "frontend/integration/internet-identity"
import { useNFIDNavigate } from "frontend/utils/use-nfid-navigate"

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
        new Uint8Array(
          authState.get()?.delegationIdentity?.getPublicKey().toDer() ?? [],
        ),
      )
      const createAccessPointResponse = await im.create_access_point({
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
