import React from "react"

import { useDeviceInfo } from "frontend/apps/device/use-device-info"
import { Button } from "frontend/ui/atoms/button"
import { H5 } from "frontend/ui/atoms/typography"

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
      <Button primary onClick={onRegister}>
        Register device
      </Button>
    </div>
  )
}
