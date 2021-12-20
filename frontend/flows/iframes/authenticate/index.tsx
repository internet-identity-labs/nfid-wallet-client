import React, { useEffect } from "react"
import { useAuthentication } from "./hooks"
import clsx from "clsx"
import { Link } from "react-router-dom"
import { Loader, TouchId } from "@identity-labs/ui"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"

export const Authenticate: React.FC<{ userNumber: bigint }> = ({
  userNumber,
}) => {
  const { isLoading, error, authenticate } = useAuthentication({
    userNumber,
  })

  const { hostname } = new URL(document.referrer || "http://localhost:3000") // NOTE: just a fallback for testing
  const scope = `${hostname}`

  return (
    <IFrameScreen>
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
            <Link to="/login-unknown-device">Log in as a new user</Link>
          </div>
        </div>
      ) : (
        <div className="text-red-500">{error.message}</div>
      )}
      <Loader isLoading={isLoading} />
    </IFrameScreen>
  )
}
