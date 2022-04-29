import { QRCode } from "@internet-identity-labs/nfid-sdk-react"
import { H5 } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { Link } from "react-router-dom"
import { RestoreAccessPointConstants as RAC } from "frontend/flows/screens-app/restore-access-point/routes"

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
      <H5 className="mb-4">{applicationName}</H5>
      <div className="flex flex-col">
        <div>
          Verify it's you. Scan this code with your phone’s camera.
        </div>

        <div className="py-5 m-auto">
          <a href={url} target="_blank" rel="noreferrer">
            <QRCode content={url} options={{ margin: 0 }} />
          </a>
        </div>

        <Link
          className="block mt-4 text-sm font-light text-center cursor-pointer text-blue-base"
          to={`${RAC.base}/${RAC.recoveryPhrase}`}
          state={{ from: "loginWithRecovery" }}
        >
          Recover NFID
        </Link>
      </div>
    </div>
  )
}
