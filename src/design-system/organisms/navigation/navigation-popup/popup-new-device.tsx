import { Button, H2, Loader } from "@internet-identity-labs/nfid-sdk-react"
import React, { useEffect, useState } from "react"

import logo from "frontend/assets/logo.svg"
import { useRegisterQRCode } from "frontend/flows/screens-app/landing-page/register-qrcode/use-register-qrcode"
import { useUnknownDeviceConfig } from "frontend/flows/screens-iframe/authenticate/login-unknown/hooks/use-unknown-device.config"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useDeviceInfo } from "frontend/hooks/use-device-info"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"

interface PopupNewDeviceProps {}

export const PopupNewDevice: React.FC<PopupNewDeviceProps> = () => {
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { setStatus } = useRegisterQRCode()
  const { createDevice } = useDevices()
  const { readAccount } = useAccount()
  const { identityManager } = useAuthentication()

  const {
    platform: { device },
  } = useDeviceInfo()

  const { userNumber } = useUnknownDeviceConfig()
  const { createWebAuthNDevice } = useDevices()

  const handleRegisterNewDevice = React.useCallback(async () => {
    setIsLoading(true)
    if (!userNumber) {
      return console.error(`Missing userNumber: ${userNumber}`)
    }

    const { device } = await createWebAuthNDevice(BigInt(userNumber))
    await createDevice({
      ...device,
      userNumber,
    })
    await readAccount(identityManager, userNumber)

    setIsSuccess(true)
    setIsLoading(false)
  }, [
    createDevice,
    createWebAuthNDevice,
    identityManager,
    readAccount,
    userNumber,
  ])

  useEffect(() => {
    handleRegisterNewDevice()
  }, [handleRegisterNewDevice])

  return (
    <div>
      <img src={logo} alt="logo" className="w-20 my-8" />
      {!isSuccess ? (
        <div className="relative">
          <Loader isLoading={isLoading} iframe />
          <H2 className="mb-3">Trust this device</H2>

          <div>
            Prove you own this {device} by successfully unlocking it to trust
            this device.
          </div>
        </div>
      ) : (
        <div>
          <H2 className="mb-3">Success</H2>
          <div className="mb-12">Now you can proceed to application.</div>
          <Button
            onClick={() => setStatus("")}
            large
            secondary
            className="mt-8"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  )
}
