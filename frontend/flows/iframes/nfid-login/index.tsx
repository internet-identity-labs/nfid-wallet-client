import React from "react"
import { useAuthentication } from "./hooks"
import clsx from "clsx"
import { Link, Navigate } from "react-router-dom"
import { Button, Loader, TouchId } from "frontend/ui-kit/src"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { IFrameConstants } from "../routes"
import { useMultipass } from "frontend/hooks/use-multipass"
import { AuthoriseAppConstants } from "../authorize-app/routes"

export const Authenticate: React.FC<{ userNumber: bigint }> = ({
  userNumber,
}) => {
  const { account } = useMultipass()
  const { isLoading, isAuthenticated, error, authenticate } = useAuthentication(
    {
      userNumber,
    },
  )
  console.log(">> ", { isAuthenticated, Authenticate })

  return (
    <IFrameScreen title="Sign in using Multipass">
      {isAuthenticated && <Navigate to={AuthoriseAppConstants.base} />}
      {!error ? (
        <div className="px-6 py-4">
          <Button block large filled onClick={authenticate}>
            <div className={clsx("p-1")}>
              <TouchId />
            </div>
            <div className="p-2 ml-1">
              Unlock NFID {account && `as ${account.name}`}
            </div>
          </Button>
          <div
            className={clsx(
              "flex mt-5 justify-center text-blue-900 hover:underline",
            )}
          >
            <Link to={IFrameConstants.base}>Log in as different person</Link>
          </div>
        </div>
      ) : (
        <div className="text-red-500">{error.message}</div>
      )}
      <Loader isLoading={isLoading} />
    </IFrameScreen>
  )
}
