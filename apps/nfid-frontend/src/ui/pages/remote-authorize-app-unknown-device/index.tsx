import clsx from "clsx"
import React from "react"

import { Button, QRCode, SDKApplicationMeta } from "@nfid-frontend/ui"

export interface AuthorizeAppUnknownDeviceProps {
  onClickBack: () => void
  registerSameDevicePath: string
  url: string | null
  applicationName: string
  applicationLogo: string
}

export const RemoteAuthorizeAppUnknownDevice: React.FC<
  AuthorizeAppUnknownDeviceProps
> = ({ url, applicationLogo, applicationName, onClickBack }) => {
  return url ? (
    <div className={clsx("flex flex-col items-center text-center font-inter")}>
      <SDKApplicationMeta
        applicationName={applicationName}
        applicationLogo={applicationLogo}
        title="Sign in"
        subTitle={`Scan this code from a device with a camera to sign in to ${applicationName}`}
      />
      <div className="bg-gray-50 p-6 rounded-[10px] mt-4">
        <QRCode content={url} options={{ width: 142 }} />
      </div>
      <Button onClick={onClickBack} className="mt-4">
        Back
      </Button>
    </div>
  ) : null
}
