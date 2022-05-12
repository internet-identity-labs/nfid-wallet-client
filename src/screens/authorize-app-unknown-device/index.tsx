import { QRCode } from "@internet-identity-labs/nfid-sdk-react"
import { H5 } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { Link, Navigate } from "react-router-dom"

import { useIsIframe } from "frontend/hooks/use-is-iframe"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"

export interface AuthorizeAppUnknownDeviceProps {
  registerDeviceDeciderPath: string
  registerSameDevicePath: string
  url: string | null
  showRegister: boolean
  applicationName?: string
}

export const AuthorizeAppUnknownDevice: React.FC<
  AuthorizeAppUnknownDeviceProps
> = ({
  registerDeviceDeciderPath,
  registerSameDevicePath,
  url,
  showRegister,
  applicationName,
}) => {
  const { generatePath } = useNFIDNavigate()
  const isIframe = useIsIframe()

  return url && !showRegister ? (
    <div className={clsx("text-center")}>
      <H5 className="mb-4">{applicationName}</H5>
      <div className="flex flex-col">
        <div className="text-sm">
          Verify it's you. Scan this code with your phone’s camera.
        </div>

        <div className="py-5 m-auto">
          <Link
            to={generatePath(registerSameDevicePath)}
            target={isIframe ? "_blank" : "_self"}
            rel="noreferrer"
          >
            <QRCode content={url} options={{ margin: 0 }} />
          </Link>
        </div>
      </div>
    </div>
  ) : showRegister ? (
    <Navigate to={generatePath(registerDeviceDeciderPath)} />
  ) : null
}
