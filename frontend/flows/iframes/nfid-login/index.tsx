import React from "react"
import { useAuthentication } from "./hooks"
import clsx from "clsx"
import { Link, useNavigate } from "react-router-dom"
import { Button, Loader, TouchId } from "@identity-labs/ui"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { IFrameConstants } from "../routes"
import { useMultipass } from "frontend/hooks/use-multipass"
import { AuthoriseAppConstants } from "../authorize-app/routes"

export const Authenticate: React.FC<{ userNumber: bigint }> = ({
  userNumber,
}) => {
  const navigate = useNavigate()
  const { account } = useMultipass()
  const { isLoading, error, authenticate } = useAuthentication({
    userNumber,
  })

  console.log(">> Authenticate", { isLoading, error })

  const handleAuhtenticate = React.useCallback(async () => {
    await authenticate()
    console.log(">> navigate", { to: AuthoriseAppConstants.base })
    navigate(AuthoriseAppConstants.base, { replace: true })
  }, [authenticate, navigate])

  return (
    <IFrameScreen title="Sign in using Multipass">
      {!error ? (
        <div className="px-6 py-4">
          <Button block large filled onClick={handleAuhtenticate}>
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
