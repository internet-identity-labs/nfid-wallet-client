import { Button, H5 } from "@internet-identity-labs/nfid-sdk-react"
import React from "react"

import { useDeviceInfo } from "frontend/hooks/use-device-info"

interface RegisterDeviceProps {}

export const RegisterDevice: React.FC<RegisterDeviceProps> = ({ children }) => {
  const {
    platform: { device, authenticator },
  } = useDeviceInfo()
  return (
    <div>
      <H5 className="mb-4">Register this device to login</H5>
      <div>
        Trust this {device}? You can quickly and securely log in the next time
        using this device's {authenticator}.
      </div>
      <Button secondary>Register device</Button>
    </div>
  )
}
