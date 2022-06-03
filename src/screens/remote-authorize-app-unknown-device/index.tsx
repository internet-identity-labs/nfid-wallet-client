import clsx from "clsx"
import React from "react"
import { Link, Navigate } from "react-router-dom"

import { QRCode } from "@internet-identity-labs/nfid-sdk-react"
import { H5 } from "@internet-identity-labs/nfid-sdk-react"

import { P } from "frontend/design-system/atoms/typography/paragraph"
import { ScreenResponsive } from "frontend/design-system/templates/screen-responsive"

import { useMultipass } from "frontend/hooks/use-multipass"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"

export interface AuthorizeAppUnknownDeviceProps {
  registerDeviceDeciderPath: string
  registerSameDevicePath: string
  url: string | null
  showRegister: boolean
  applicationName?: string
  isLoading?: boolean
}

export const RemoteAuthorizeAppUnknownDevice: React.FC<
  AuthorizeAppUnknownDeviceProps
> = ({ registerDeviceDeciderPath, url, showRegister, isLoading }) => {
  const { applicationLogo, applicationName } = useMultipass()
  const { generatePath } = useNFIDNavigate()

  return url && !showRegister ? (
    <ScreenResponsive
      isLoading={isLoading}
      loadingMessage="Waiting for verification on mobile..."
    >
      <div
        className={clsx("flex flex-col items-center font-inter")}
        style={{
          backdropFilter: "blur(0px)",
          WebkitBackdropFilter: "blur(0px)",
        }}
      >
        {applicationLogo ? <img src={applicationLogo} alt="logo" /> : null}
        <H5 className="mt-4">Sign in</H5>
        <P className="mt-2 text-center max-w-[320px]">
          Use passkey from a device with a camera to sign in to{" "}
          {applicationName}
        </P>
        <Link to={url}>
          <QRCode
            className="p-6 rounded-[10px] w-48 h-48 mt-8"
            content={url}
            options={{ width: 192 }}
          />
        </Link>
      </div>
    </ScreenResponsive>
  ) : showRegister ? (
    <Navigate to={generatePath(registerDeviceDeciderPath)} />
  ) : null
}
