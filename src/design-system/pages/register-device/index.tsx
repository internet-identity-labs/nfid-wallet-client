import React from "react"

import { Button, H5 } from "@internet-identity-labs/nfid-sdk-react"

import { useDeviceInfo } from "frontend/apps/device/use-device-info"

export interface RegisterDeviceProps {
  onRegister: () => void
}

export const RegisterDevice: React.FC<RegisterDeviceProps> = ({
  onRegister,
}) => {
  const {
    platform: { device, authenticator },
  } = useDeviceInfo()
  return (
    <div>
      <H5 className="mb-4">Register this device to login</H5>
      <div className="mb-4">
        Trust this {device}? You can quickly and securely log in the next time
        using this device's {authenticator}.
      </div>
      <Button secondary onClick={onRegister}>
        Register device
      </Button>
    </div>
  )
}
