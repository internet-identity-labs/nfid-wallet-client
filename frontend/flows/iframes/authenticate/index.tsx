import React, { useEffect } from "react"
import { useAuthentication } from "./hooks"
import clsx from "clsx"
import { Link } from "react-router-dom"
import { Loader, TouchId } from "@identity-labs/ui"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { IFrameConstants } from "../routes"

export const Authenticate: React.FC<{ userNumber: bigint }> = ({
  userNumber,
}) => {
  const { isLoading, error, authenticate } = useAuthentication({
    userNumber,
  })

  const { hostname } = new URL(document.referrer || "http://localhost:3000") // NOTE: just a fallback for testing
  const scope = `${hostname}`

  return (
    <IFrameScreen title="Sign in using Multipass">
      {!error ? (
        <div className="px-6 py-4">
          <div
            className="flex items-center cursor-pointer border border-gray-200 rounded hover:shadow-sm hover:bg-gray-50"
            onClick={authenticate}
          >
            <div className={clsx("p-1 bg-gray-200")}>
              <TouchId />
            </div>
            <div className="ml-1 p-2">Continue with TouchID as Philipp</div>
          </div>
          <div className={clsx("mt-5 text-blue-900 hover:underline")}>
            <Link to={IFrameConstants.base}>Log in as a new user</Link>
          </div>
        </div>
      ) : (
        <div className="text-red-500">{error.message}</div>
      )}
      <Loader isLoading={isLoading} />
    </IFrameScreen>
  )
}
