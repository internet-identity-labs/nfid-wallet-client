import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { Button, H5, Loader } from "frontend/ui-kit/src"
import React from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { AuthoriseAppConstants } from "../authorize-app/routes"
import { IFrameConstants } from "../routes"
import { useAuthorization } from "./hooks"

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
    <IFrameScreen>
      {isAuthenticated && (
        <Navigate
          // TODO: this is fragile. We need pass the applicationName query string
          to={`${AuthoriseAppConstants.base}${window.location.search}`}
        />
      )}

      <H5 className="mb-4 text-center">{`Log in to ${applicationName}
    with your NFID`}</H5>

      {!error ? (
        <div>
          <Button block secondary onClick={authenticate} className="mb-2">
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
