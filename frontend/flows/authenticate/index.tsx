import React from "react"
import { Centered } from "@identity-labs/ui"
import { TouchId } from "@identity-labs/ui"
import { Loader } from "@identity-labs/ui"
import { useAuthentication } from "./hooks"
import clsx from "clsx"
import { Link } from "react-router-dom"
import { Button } from "@identity-labs/ui"

export const Authenticate: React.FC<{ userNumber: bigint }> = ({
  userNumber,
}) => {
  const { isLoading, error, authenticate } = useAuthentication({
    userNumber,
  })

  const { hostname } = new URL(document.referrer || "http://localhost:3000") // NOTE: just a fallback for testing
  const scope = `${hostname}`

  return (
    <>
      {!error ? (
        <div className="px-6 py-4">
          <div className="font-medium text-lg mb-3">Sign in to {scope}</div>
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
    </>
  )
}
