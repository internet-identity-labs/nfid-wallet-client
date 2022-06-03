import clsx from "clsx"
import React, { ReactElement } from "react"

import { useIsIframe } from "frontend/hooks/use-is-iframe"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { NFIDGradientBar } from "frontend/design-system/atoms/gradient-bar"
import { H5 } from "frontend/design-system/atoms/typography"
import QRCode from "./assets/qrcode.svg"
import SecurityKey from "./assets/security-key.svg"

export interface AuthorizeAppUnknownDeviceProps {
  registerDeviceDeciderPath: string
  registerSameDevicePath: string
  url: string | null
  showRegister: boolean
  applicationName?: string
}

export const AuthorizeAppUnknownDevice: React.FC<AuthorizeAppUnknownDeviceProps> = ({
                                                                                      registerDeviceDeciderPath,
                                                                                      registerSameDevicePath,
                                                                                      url,
                                                                                      showRegister,
                                                                                      applicationName,
                                                                                    }) => {
  const { generatePath } = useNFIDNavigate()
  const isIframe = useIsIframe()

  return <div>
    <div className="relative w-80 shadow-iframe rounded-xl">
      <NFIDGradientBar />
      <div className="w-[90%] mx-auto py-6">
        <H5>Sign in</H5>
        <p className="mt-3 text-sm">Choose how you’d like to sign in to <br /> {applicationName}</p>
        <div className="flex flex-col mt-2 space-y-1">
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
        </div>
      </div>
    </div>
  </div>

}

interface MethodRawProps {
  img: ReactElement
  title: string
  subtitle: string
}

const MethodRaw: React.FC<MethodRawProps> = ({ img, title, subtitle }) => (
  <div className="flex items-center w-full px-3 py-2 border border-gray-200 rounded-md hover:border-blue-light transition-all cursor-pointer hover:bg-[#F4FAFF]">
    <div className="w-[28px] mr-[9px]">
      {img}
    </div>
    <div>
      <p className="text-sm">{title}</p>
      <p className="text-[11px] text-gray-400">{subtitle}</p>
    </div>
  </div>
)
