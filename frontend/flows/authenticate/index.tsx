import React from "react"
import { Centered } from "frontend/ui-utils/atoms/centered"
import { TouchId } from "frontend/ui-utils/atoms/icons/touch-id"
import { Loader } from "frontend/ui-utils/atoms/loader"
import { useAuthentication } from "./hooks"
import clsx from "clsx"

export const Authenticate: React.FC<{ userNumber: bigint }> = ({
  userNumber,
}) => {
  const { isLoading, error, authenticate } = useAuthentication({
    userNumber,
  })

  const { hostname } = new URL(document.referrer)
  const scope = `${hostname}`

  return (
    <Centered>
      {!error ? (
        <div className={clsx("w-full p-10")}>
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
        </div>
      ) : (
        <div className="text-red-500">{error.message}</div>
      )}
      <Loader isLoading={isLoading} />
    </Centered>
  )
}
