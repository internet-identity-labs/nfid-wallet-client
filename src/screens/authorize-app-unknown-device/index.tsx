import { Button, Loader } from "@internet-identity-labs/nfid-sdk-react"
import { QRCode } from "@internet-identity-labs/nfid-sdk-react"
import { H5 } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { Link, Navigate } from "react-router-dom"

import { useGeneratePath } from "frontend/hooks/use-generate-path"
import { useInterval } from "frontend/hooks/use-interval"
import { useMultipass } from "frontend/hooks/use-multipass"

import { useUnknownDeviceConfig } from "./hooks/use-unknown-device.config"

interface AuthorizeAppUnknownDeviceProps
  extends React.HTMLAttributes<HTMLDivElement> {
  recoverNFIDPath: string
  registerDeviceDeciderPath: string
}

export const AuthorizeAppUnknownDevice: React.FC<
  AuthorizeAppUnknownDeviceProps
> = ({ recoverNFIDPath, registerDeviceDeciderPath }) => {
  const { applicationName } = useMultipass()
  const { url, status, handlePollForDelegate, showRegister } =
    useUnknownDeviceConfig()
  const isLoading = status === "loading"

  useInterval(handlePollForDelegate, 2000)
  const { generatePath } = useGeneratePath()

  return url && !showRegister ? (
    <div className={clsx("text-center")}>
      <H5 className="mb-4">{applicationName}</H5>
      <div className="flex flex-col">
        <div className="text-sm">
          Verify it's you. Scan this code with your phone’s camera.
        </div>

        <div className="py-5 m-auto">
          <a href={url} target="_blank" rel="noreferrer">
            <QRCode content={url} options={{ margin: 0 }} />
          </a>
        </div>
      </div>
      {isLoading && (
        <div className="fixed top-0 bottom-0 w-full">
          <div className="absolute top-0 left-0 z-10 w-full h-full bg-white bg-opacity-90 backdrop-blur-sm" />
          <div className="z-20 flex flex-col items-center justify-center w-full h-full px-14">
            <Loader
              iframe
              isLoading={isLoading}
              fullscreen={false}
              imageClasses={"w-[90px] mx-auto py-6 -mt-4 z-20"}
            />
            <div className="z-20 mt-5 text-center">
              Waiting for verification on mobile ...
            </div>
          </div>
        </div>
      )}
    </div>
  ) : showRegister ? (
    <Navigate to={generatePath(registerDeviceDeciderPath)} />
  ) : null
}
