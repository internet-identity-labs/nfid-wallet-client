import clsx from "clsx"
import React from "react"

import { QRCode } from "@internet-identity-labs/nfid-sdk-react"
import { H5 } from "@internet-identity-labs/nfid-sdk-react"

import { ApplicationLogo } from "frontend/ui/atoms/application-logo"
import { P } from "frontend/ui/atoms/typography/paragraph"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"

export interface AuthorizeAppUnknownDeviceProps {
  registerSameDevicePath: string
  url: string | null
  applicationName: string
  applicationLogo: string
  isLoading?: boolean
}

export const RemoteAuthorizeAppUnknownDevice: React.FC<
  AuthorizeAppUnknownDeviceProps
> = ({ url, isLoading, applicationLogo, applicationName }) => {
  return url ? (
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
  ) : null
}
