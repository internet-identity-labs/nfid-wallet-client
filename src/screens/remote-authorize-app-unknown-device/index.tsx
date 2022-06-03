import clsx from "clsx"
import React from "react"
import { Navigate } from "react-router-dom"

import { QRCode } from "@internet-identity-labs/nfid-sdk-react"
import { H5 } from "@internet-identity-labs/nfid-sdk-react"

import { ApplicationLogo } from "frontend/design-system/atoms/application-logo"

import { useMultipass } from "frontend/hooks/use-multipass"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"

export interface AuthorizeAppUnknownDeviceProps {
  registerDeviceDeciderPath: string
  registerSameDevicePath: string
  url: string | null
  showRegister: boolean
  applicationName?: string
}

export const RemoteAuthorizeAppUnknownDevice: React.FC<
  AuthorizeAppUnknownDeviceProps
> = ({ registerDeviceDeciderPath, url, showRegister }) => {
  const { applicationLogo, applicationName } = useMultipass()
  const { generatePath } = useNFIDNavigate()

  return url && !showRegister ? (
    <div className={clsx("text-center")}>
      {applicationLogo && (
        <ApplicationLogo
          applicationName={applicationName}
          src={applicationLogo}
        />
      )}
      {applicationName && <H5>{applicationName}</H5>}
      <div className="flex flex-col">
        <div className="text-sm">
          Verify it's you. Scan this code with your phone’s camera.
        </div>

        <div className="py-5 m-auto">
          <QRCode content={url} options={{ margin: 0 }} />
        </div>
      </div>
    </div>
  ) : showRegister ? (
    <Navigate to={generatePath(registerDeviceDeciderPath)} />
  ) : null
}
