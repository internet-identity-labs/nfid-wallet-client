import { Button, H2 } from "@internet-identity-labs/nfid-sdk-react"
import React, { useState } from "react"
import logo from "frontend/assets/logo.svg"
import { useDeviceInfo } from "frontend/hooks/use-device-info"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { useUnknownDeviceConfig } from "frontend/flows/screens-iframe/authenticate/login-unknown/hooks/use-unknown-device.config"
import { useRegisterQRCode } from "frontend/flows/screens-app/landing-page/register-qrcode/use-register-qrcode"

interface PopupNewDeviceProps {
}

export const PopupNewDevice: React.FC<PopupNewDeviceProps> = () => {
  const [isSuccess, setIsSuccess] = useState(false)
  const { setStatus } = useRegisterQRCode()
  const { createDevice } = useDevices()

  const { platform: { device } } = useDeviceInfo()

  const { userNumber } = useUnknownDeviceConfig()
  const { createWebAuthNDevice } = useDevices()

  const handleRegisterNewDevice = React.useCallback(async () => {
    if (!userNumber) {
      return console.error(`Missing userNumber: ${userNumber}`)
    }

    try {
      const { device } = await createWebAuthNDevice(BigInt(userNumber))
      const response = await createDevice({
        ...device,
        userNumber,
      })
      setIsSuccess(true)
    } catch {
      console.error("Device not registered")
    }
  }, [createWebAuthNDevice, userNumber])

  return (
    <div>
      <img src={logo} alt="logo" className="w-20 my-8" />
      {isSuccess ?
        <div>
          <H2 className="mb-3">Trust this device</H2>

          <div>
            Prove you own this {device} by successfully unlocking it to trust
            this device.
          </div>

          <Button
            onClick={handleRegisterNewDevice}
            large
            secondary
            className="mt-8"
          >
            Prove I own this {device}
          </Button>
        </div>
        :
        <div>
          <H2 className="mb-3">Success</H2>
          <div className="mb-12">
            Now you can proceed to application.
          </div>
          <Button
            onClick={() => setStatus("")}
            large
            secondary
            className="mt-8"
          >
            Continue
          </Button>
        </div>
      }
    </div>
  )
}
