import React from "react"
import clsx from "clsx"
import { H5 } from "components/atoms/typography"
import { Button } from "components/atoms/button"
import { QRCode } from "components/atoms/qrcode"

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
          This application uses NFID, the most secure, private, and convenient
          Internet Identity.
        </div>

        <div className="py-5 m-auto">
          <a href={url} target="_blank" rel="noreferrer">
            <QRCode content={url} options={{ margin: 0 }} />
          </a>
        </div>

        <Button text className="mb-2" onClick={onLogin}>
          Log in with Recovery Phrase
        </Button>
      </div>
    </div>
  )
}
