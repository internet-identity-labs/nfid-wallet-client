import clsx from "clsx"
import React from "react"

import { QRCode } from "frontend/ui/atoms/qrcode"
import { ApplicationMeta } from "frontend/ui/molecules/application-meta"

export interface AuthorizeAppUnknownDeviceProps {
  registerSameDevicePath: string
  url: string | null
  applicationName: string
  applicationLogo: string
}

export const RemoteAuthorizeAppUnknownDevice: React.FC<
  AuthorizeAppUnknownDeviceProps
> = ({ url, applicationLogo, applicationName }) => {
  return url ? (
    <div
      className={clsx("flex flex-col items-center text-center font-inter p-6")}
    >
      <ApplicationMeta
        applicationName={applicationName}
        applicationLogo={applicationLogo}
        title="Sign in"
        subTitle={`Scan this code from a device with a camera to sign in to ${applicationName}`}
      />
      <div className="bg-gray-50 p-6 rounded-[10px] mt-8">
        <QRCode content={url} options={{ width: 192 }} />
      </div>
    </div>
  ) : null
}
