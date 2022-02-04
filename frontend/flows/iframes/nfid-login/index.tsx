import React from "react"
import { useAuthorization } from "./hooks"
import clsx from "clsx"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { Button, H5, Loader, TouchId } from "frontend/ui-kit/src"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { IFrameConstants } from "../routes"
import { AuthoriseAppConstants } from "../authorize-app/routes"
import { useAuthentication } from "frontend/flows/auth-wrapper"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useMultipass } from "frontend/hooks/use-multipass"

export const Authenticate: React.FC<{ userNumber: bigint }> = ({
  userNumber,
}) => {
  const navigate = useNavigate()
  const { account } = useAccount()
  const { applicationName } = useMultipass()
  const { isAuthenticated } = useAuthentication()
  const { isLoading, error, authenticate } = useAuthorization({
    userNumber,
  })

  return (
    // TODO: title
    <IFrameScreen>
      {isAuthenticated && <Navigate to={AuthoriseAppConstants.base} />}

      <H5 className="text-center py-4">{`Log in to ${applicationName}
    with your NFID`}</H5>

      {!error ? (
        <div>
          <Button block filled onClick={authenticate} className="mb-2">
            Unlock NFID {account && `as ${account.name}`}
          </Button>

          <Button block stroke onClick={() => navigate(IFrameConstants.base)}>
            Create new NFID
          </Button>
        </div>
      ) : (
        <div className="text-red-500">{error.message}</div>
      )}
      <Loader isLoading={isLoading} />
    </IFrameScreen>
  )
}
