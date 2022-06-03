import React from "react"

import { IconButton } from "frontend/design-system/atoms/button/icon-button"
import { Input } from "frontend/design-system/atoms/input"
import { H5 } from "frontend/design-system/atoms/typography"
import { ScreenResponsive } from "frontend/design-system/templates/screen-responsive"

import QRCode from "./assets/qrcode.svg"
import SecurityKey from "./assets/security-key.svg"

export interface AuthorizeAppUnknownDeviceProps {
  registerDeviceDeciderPath: string
  registerSameDevicePath: string
  url: string | null
  showRegister: boolean
  applicationName?: string
  applicationLogo?: string
}

export const AuthorizeAppUnknownDevice: React.FC<
  AuthorizeAppUnknownDeviceProps
> = ({
  registerDeviceDeciderPath,
  registerSameDevicePath,
  url,
  applicationName,
  applicationLogo,
}) => {
  const [isOtherMethod, setIsOtherMethod] = React.useState(false)

  return (
    <ScreenResponsive className="flex flex-col items-center">
      <img src={applicationLogo} alt="" />
      <H5 className="mt-4">Sign in</H5>
      <p className="mt-3 text-center">
        Choose how you’d like to sign in to {applicationName}
      </p>
      {isOtherMethod && (
        <Input labelText="Your NFID number" className="w-full mt-8" />
      )}
      <div className="flex flex-col w-full mt-8 space-y-1">
        <IconButton
          title="iPhone, iPad, or Android device"
          subtitle="Use passkey from a device with a camera"
          img={<img src={QRCode} alt="qrcode" />}
          onClick={() => new Error("implement me")}
        />
        <IconButton
          title="Security key"
          subtitle="Use an external security key"
          img={<img src={SecurityKey} alt="security-key" />}
          onClick={() => new Error("implement me")}
        />
        <p
          className="pt-4 text-sm text-center cursor-pointer text-blue-base"
          onClick={() => setIsOtherMethod(!isOtherMethod)}
        >
          {isOtherMethod ? "Back" : "Other sign in options"}
        </p>
      </div>
    </ScreenResponsive>
  )
}
