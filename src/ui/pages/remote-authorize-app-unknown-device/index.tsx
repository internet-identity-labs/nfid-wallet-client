import clsx from "clsx"
import React from "react"
import { Navigate } from "react-router-dom"

import { QRCode } from "@internet-identity-labs/nfid-sdk-react"
import { H5 } from "@internet-identity-labs/nfid-sdk-react"

import { useMultipass } from "frontend/apps/identity-provider/use-app-meta"
import { ApplicationLogo } from "frontend/ui/atoms/application-logo"
import { P } from "frontend/ui/atoms/typography/paragraph"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

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
        {applicationLogo ? (
          <ApplicationLogo
            src={applicationLogo}
            applicationName={applicationName}
          />
        ) : null}
        <H5>Sign in</H5>
        <P className="mt-2 text-center max-w-[320px]">
          Use passkey from a device with a camera to sign in to{" "}
          {applicationName}
        </P>
        <div className="bg-gray-50 p-6 rounded-[10px] mt-8">
          <QRCode content={url} options={{ width: 192 }} />
        </div>
      </div>
    </ScreenResponsive>
  ) : showRegister ? (
    <Navigate to={generatePath(registerDeviceDeciderPath)} />
  ) : null
}
