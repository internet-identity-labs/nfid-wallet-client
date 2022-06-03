import React, { ReactElement } from "react"

import { Input } from "frontend/design-system/atoms/input"
import { H5 } from "frontend/design-system/atoms/typography"
import { IFrameTemplate } from "frontend/design-system/templates/IFrameTemplate"

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
    <IFrameTemplate className="flex flex-col items-center">
      <img src={applicationLogo} alt="" />
      <H5 className="mt-4">Sign in</H5>
      <p className="mt-3 text-center">
        Choose how you’d like to sign in to {applicationName}
      </p>
      {isOtherMethod && (
        <Input labelText="Your NFID number" className="w-full mt-8" />
      )}
      <div className="flex flex-col w-full mt-8 space-y-1">
        <MethodRaw
          title="iPhone, iPad, or Android device"
          subtitle="Use passkey from a device with a camera"
          img={<img src={QRCode} alt="qrcode" />}
        />
        <MethodRaw
          title="Security key"
          subtitle="Use an external security key"
          img={<img src={SecurityKey} alt="security-key" />}
        />
        <p
          className="pt-4 text-sm text-center cursor-pointer text-blue-base"
          onClick={() => setIsOtherMethod(!isOtherMethod)}
        >
          {isOtherMethod ? "Back" : "Other sign in options"}
        </p>
      </div>
    </IFrameTemplate>
  )
}

interface MethodRawProps {
  img: ReactElement
  title: string
  subtitle: string
}

const MethodRaw: React.FC<MethodRawProps> = ({ img, title, subtitle }) => (
  <div className="flex items-center w-full px-3 py-2 border border-gray-200 rounded-md hover:border-blue-light transition-all cursor-pointer hover:bg-[#F4FAFF]">
    <div className="w-[28px] mr-[9px]">{img}</div>
    <div>
      <p className="text-sm">{title}</p>
      <p className="text-[11px] text-gray-400">{subtitle}</p>
    </div>
  </div>
)
