import { Button, H2 } from "@internet-identity-labs/nfid-sdk-react"
import React from "react"

import logo from "frontend/assets/logo.svg"
import { useRegisterQRCode } from "frontend/flows/screens-app/landing-page/register-qrcode/use-register-qrcode"

interface PopupNewDeviceProps {}

export const PopupNewDevice: React.FC<PopupNewDeviceProps> = () => {
  const { setStatus } = useRegisterQRCode()

  return (
    <div>
      <img src={logo} alt="logo" className="w-20 my-8" />
        <div>
          <H2 className="mb-3">Success</H2>
          <div className="mb-12">
            You are now able to securely log in without passwords on this
            device.
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
    </div>
  )
}
