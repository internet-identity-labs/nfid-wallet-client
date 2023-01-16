import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { authState, im } from "@nfid/integration"

import { RecoverNFIDRoutesConstants } from "frontend/apps/authentication/recover-nfid/routes"
import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import {
  deviceInfo,
  getBrowserName,
  getIcon,
  useDeviceInfo,
} from "frontend/integration/device"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { useDevices } from "frontend/integration/identity-manager/devices/hooks"
import { AuthorizeRegisterDeciderScreen } from "frontend/ui/pages/register-device-decider"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

interface AppScreenRegisterDeviceDeciderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  registerSuccessPath: string
}

export const RouterRegisterDeviceDecider: React.FC<
  AppScreenRegisterDeviceDeciderProps
> = ({ registerSuccessPath }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { recoverDevice, createSecurityDevice, hasSecurityKey } = useDevices()
  const { recoverAccount, createAccount } = useAccount()
  const { setShouldStoreLocalAccount } = useAuthentication()
  const { generatePath } = useNFIDNavigate()
  const { isAuthenticated } = useAuthentication()

  const {
    platform: { os: deviceName },
    hasPlatformAuthenticator,
  } = useDeviceInfo()
  console.log(">> ", { hasWebAuthn: hasPlatformAuthenticator })

  const navigate = useNavigate()

  const { state } = useLocation()
  const userNumber = BigInt((state as { userNumber: string }).userNumber)
  console.debug("RouterRegisterDeviceDecider", {
    hasSecurityKey,
    hasWebAuthn: hasPlatformAuthenticator,
  })

  // In case the current device
  // - does not support web authn platform authentication (!hasPlatformAuthenticator)
  // - but has a security key registered (hasSecurityKey)
  // then we don't want to show the decider and transition to profile
  React.useEffect(() => {
    if (!hasPlatformAuthenticator && hasSecurityKey) {
      return navigate(generatePath(registerSuccessPath))
    }
  }, [
    generatePath,
    hasSecurityKey,
    hasPlatformAuthenticator,
    navigate,
    registerSuccessPath,
  ])

  const handleRegister = React.useCallback(async () => {
    setIsLoading(true)
    setShouldStoreLocalAccount(true)

    if (!userNumber) {
      return console.error(`Missing userNumber: ${userNumber}`)
    }

    try {
      await recoverAccount(BigInt(userNumber), true)
    } catch (e) {
      console.warn("account not found. Recreating")
      const account = { anchor: userNumber }
      const accessPoint = {
        icon: getIcon(deviceInfo),
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
      const pub_key = authState
        .get()
        ?.delegationIdentity?.getPrincipal()
        .toText()!
      const createAccessPointResponse = await im
        .create_access_point({
          icon: "laptop",
          device: deviceName,
          browser: getBrowserName(),
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

      im.use_access_point([getBrowserName()]).catch((e) => {
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

    navigate(generatePath(registerSuccessPath))
    setIsLoading(false)
  }, [
    createAccount,
    deviceName,
    generatePath,
    navigate,
    recoverAccount,
    recoverDevice,
    registerSuccessPath,
    setShouldStoreLocalAccount,
    userNumber,
  ])

  const handleRegisterSecurityKey = React.useCallback(async () => {
    setIsLoading(true)
    await createSecurityDevice()
    navigate(generatePath(registerSuccessPath))
    setIsLoading(false)
  }, [createSecurityDevice, generatePath, navigate, registerSuccessPath])

  const handleLogin = React.useCallback(async () => {
    if (!userNumber)
      throw new Error("userNumber is not defined. Not authorized.")

    setIsLoading(true)
    setShouldStoreLocalAccount(false)

    await recoverAccount(userNumber, false)

    setIsLoading(false)
    navigate(generatePath(registerSuccessPath))
  }, [
    generatePath,
    navigate,
    recoverAccount,
    registerSuccessPath,
    setShouldStoreLocalAccount,
    userNumber,
  ])

  useEffect(() => {
    if (!isAuthenticated)
      navigate(
        `${RecoverNFIDRoutesConstants.base}/${RecoverNFIDRoutesConstants.enterRecoveryPhrase}`,
      )
  }, [isAuthenticated, navigate])

  return (
    <ScreenResponsive>
      <AuthorizeRegisterDeciderScreen
        onLogin={handleLogin}
        isLoading={isLoading}
        isPlatformAuthenticatorAvailable={!!hasPlatformAuthenticator}
        deviceName={deviceInfo.platform.device}
        platformAuthenticatorName={deviceInfo.platform.authenticator}
        onRegisterPlatformDevice={handleRegister}
        onRegisterSecurityDevice={handleRegisterSecurityKey}
      />
    </ScreenResponsive>
  )
}

export default RouterRegisterDeviceDecider
