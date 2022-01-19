import { Loader, TouchId } from "@identity-labs/ui"
import clsx from "clsx"
import { useMultipass } from "frontend/hooks/use-multipass"
import React from "react"
import { Link } from "react-router-dom"
import { useAuthentication } from "../iframes/authenticate/hooks"
import { IFrameConstants } from "../iframes/routes"

export const Authenticate: React.FC<{ userNumber: bigint }> = ({
  userNumber,
}) => {
  const { applicationName } = useMultipass()
  const { isLoading, error, authenticate } = useAuthentication({
    userNumber,
  })

  return (
    <>
      {!error ? (
        <div className="px-6 py-4">
          <div className="mb-3 text-lg font-medium">
            Sign in to {applicationName}
          </div>
          <div
            className="flex items-center border border-gray-200 rounded cursor-pointer hover:shadow-sm hover:bg-gray-50"
            onClick={authenticate}
          >
            <div className={clsx("p-1 bg-gray-200")}>
              <TouchId />
            </div>
            <div className="p-2 ml-1">Continue with TouchID as Philipp</div>
          </div>
          <div className={clsx("mt-5 text-blue-900 hover:underline")}>
            <Link to={IFrameConstants.base}>Log in as a new user</Link>
          </div>
        </div>
      ) : (
        <div className="text-red-500">{error.message}</div>
      )}
      <Loader isLoading={isLoading} />
    </>
  )
}
