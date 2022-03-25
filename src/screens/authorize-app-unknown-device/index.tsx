import clsx from "clsx"
import React from "react"

import { Button } from "components/atoms/button"
import { QRCode } from "components/atoms/qrcode"
import { H5 } from "components/atoms/typography"

interface AuthorizeAppUnknownDeviceProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  applicationName?: string
  url: string
  onLogin: () => void
}

export const AuthorizeAppUnknownDevice: React.FC<
  AuthorizeAppUnknownDeviceProps
> = ({ children, className, applicationName, url, onLogin }) => {
  return (
    <div className={clsx("", className)}>
      <H5 className="mb-4">Log in to {applicationName} with your NFID</H5>
      <div className="flex flex-col">
        <div>
          This application uses NFID, the single sign-on protocol for the
          internet.
        </div>

        <div className="py-5 m-auto">
          <a href={url} target="_blank" rel="noreferrer">
            <QRCode content={url} options={{ margin: 0 }} />
          </a>
        </div>
        <p className="text-xs text-center text-gray-500">
          Scan this code with your phone’s camera
        </p>

        <Button text className="mb-2" onClick={onLogin}>
          Log in with Recovery Phrase
        </Button>
      </div>
    </div>
  )
}
