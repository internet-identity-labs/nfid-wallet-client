import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { RecoverNFIDRoutesConstants } from "frontend/apps/authentication/recover-nfid/routes"
import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useDeviceInfo } from "frontend/apps/device/use-device-info"
import { im } from "frontend/integration/actors"
import { deviceInfo } from "frontend/integration/device"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { useDevices } from "frontend/integration/identity-manager/devices/hooks"
import { Icon } from "frontend/integration/identity-manager/devices/state"
import { usePersona } from "frontend/integration/identity-manager/persona/hooks"
import { authState } from "frontend/integration/internet-identity"
import { AuthorizeRegisterDeciderScreen } from "frontend/ui/pages/register-device-decider"
import { useUnknownDeviceConfig } from "frontend/ui/pages/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

interface AppScreenRegisterDeviceDeciderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  registerSuccessPath: string
}

export const RouterRegisterDeviceDecider: React.FC<
  AppScreenRegisterDeviceDeciderProps
> = ({ registerSuccessPath }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { recoverDevice, createSecurityDevice } = useDevices()
  const { recoverAccount, createAccount } = useAccount()
  const { setShouldStoreLocalAccount } = useAuthentication()
  const { getPersona } = usePersona()
  const { generatePath } = useNFIDNavigate()
  const { user } = useAuthentication()

  const {
    browser: { name: browserName },
    platform: { os: deviceName },
  } = useDeviceInfo()
  const navigate = useNavigate()

  const { userNumber } = useUnknownDeviceConfig()

  const handleRegister = React.useCallback(async () => {
    setIsLoading(true)
    setShouldStoreLocalAccount(true)

    if (!userNumber) {
      return console.error(`Missing userNumber: ${userNumber}`)
    }

    try {
      await recoverAccount(userNumber, true)
    } catch (e) {
      console.warn("account not found. Recreating")
      const account = { anchor: userNumber }
      const accessPoint = {
        icon: (deviceInfo.isMobile ? "mobile" : "desktop") as Icon,
        device: deviceInfo.newDeviceName,
        browser: deviceInfo.browser.name ?? "Mobile",
        pubKey: Array.from(
          new Uint8Array(
            authState.get()?.delegationIdentity?.getPublicKey().toDer() ?? [],
          ),
        ),
      }
      console.debug("RouterRegisterDeviceDecider handleRegister", {
        account,
        accessPoint,
      })
      await createAccount(account, accessPoint)

      // attach the current identity as access point
      const pub_key = Array.from(
        new Uint8Array(
          authState.get()?.delegationIdentity?.getPublicKey().toDer() ?? [],
        ),
      )
      const createAccessPointResponse = await im
        .create_access_point({
          icon: "laptop",
          device: deviceName,
          browser: browserName || "My Computer",
          pub_key,
        })
        .catch((e) => {
          throw new Error(
            `RouterRegisterDeviceDecider.handleRegister im.create_access_point: ${e.message}`,
          )
        })

      if (createAccessPointResponse.status_code !== 200) {
        console.error("failed to create access point", {
          error: createAccessPointResponse.error[0],
        })
      }

      im.use_access_point().catch((e) => {
        throw new Error(
          `useAuthentication.loginWithRecovery im.use_access_point: ${e.message}`,
        )
      })
    }

    try {
      await recoverDevice(Number(userNumber))
    } catch (e) {
      console.error(e)
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
    setShouldStoreLocalAccount,
    userNumber,
  ])

  const handleLogin = React.useCallback(async () => {
    if (!userNumber)
      throw new Error("userNumber is not defined. Not authorized.")

    setIsLoading(true)
    setShouldStoreLocalAccount(false)

    await recoverAccount(userNumber, false)
    await getPersona()

    setIsLoading(false)
    navigate(generatePath(registerSuccessPath))
  }, [
    generatePath,
    getPersona,
    navigate,
    recoverAccount,
    registerSuccessPath,
    setShouldStoreLocalAccount,
    userNumber,
  ])

  useEffect(() => {
    if (!user)
      navigate(
        `${RecoverNFIDRoutesConstants.base}/${RecoverNFIDRoutesConstants.enterRecoveryPhrase}`,
      )
  }, [navigate, user])

  return (
    <AuthorizeRegisterDeciderScreen
      onLogin={handleLogin}
      isLoading={isLoading}
      onRegisterPlatformDevice={handleRegister}
      onRegisterSecurityDevice={createSecurityDevice}
    />
  )
}
