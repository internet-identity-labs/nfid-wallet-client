import React from "react"
import { useAuthorization } from "./hooks"
import clsx from "clsx"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { Button, Loader, TouchId } from "frontend/ui-kit/src"
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
    <IFrameScreen
      title={`Log in to ${applicationName}
    with your NFID`}
    >
      {isAuthenticated && <Navigate to={AuthoriseAppConstants.base} />}

      {!error ? (
        <div>
          <Button block filled onClick={authenticate} className="mb-3">
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
