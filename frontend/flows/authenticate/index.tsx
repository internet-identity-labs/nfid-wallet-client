import React from "react"
import { Centered } from "frontend/ui-utils/atoms/centered"
import { TouchId } from "frontend/ui-utils/atoms/icons/touch-id"
import { Loader } from "frontend/ui-utils/atoms/loader"
import { useAuthentication } from "./hooks"

export const Authenticate: React.FC<{ userNumber: bigint }> = ({
  userNumber,
}) => {
  // TODO: pull scope from backend or locastorage

  const scope = "DSCVR"

  const { isLoading, error, authenticate } = useAuthentication({ userNumber })

  return (
    <Centered>
      {!error ? (
        <>
          <div className="font-medium mb-3">
            Sign in to {scope} with Multipass
          </div>
          <div className="flex items-center" onClick={authenticate}>
            <TouchId />
            <div className="ml-1">Continue with TouchID as Philipp</div>
          </div>
        </>
      ) : (
        <div className="text-red-500">{error.message}</div>
      )}
      <Loader isLoading={isLoading} />
    </Centered>
  )
}
