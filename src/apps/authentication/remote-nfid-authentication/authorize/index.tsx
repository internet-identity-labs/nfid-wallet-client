import React from "react"
import { useParams } from "react-router-dom"

import { AuthorizeAppSingleAccount } from "frontend/design-system/pages/authorize-app/single-account"
import { useIsLoading } from "frontend/design-system/templates/app-screen/use-is-loading"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useAuthorizeApp } from "frontend/apps/authorization/use-authorize-app"
import { useAccount } from "frontend/integration/services/identity-manager/account/hooks"
import { useNFIDNavigate } from "frontend/utils/use-nfid-navigate"

import { RemoteRegisterAccountConstants } from "../../../registration/register-account/routes"

interface AppScreenAuthorizeAppProps {}

export const AuthorizeNFID: React.FC<AppScreenAuthorizeAppProps> = () => {
  const { isLoading, setIsloading } = useIsLoading()
  const { secret } = useParams()
  const { sendWaitForUserInput, remoteNFIDLogin } = useAuthorizeApp()
  const { user, login } = useAuthentication()
  const { navigate } = useNFIDNavigate()

  const handleNFIDLogin = React.useCallback(async () => {
    if (!secret) throw new Error("missing secret")

    await remoteNFIDLogin({ secret })
    navigate("/profile/authenticate")
  }, [navigate, remoteNFIDLogin, secret])

  const handleUnlockNFID = React.useCallback(async () => {
    if (!secret) throw new Error("missing secret, scope or persona_id")

    const result = await login()
    if (result && result.tag === "ok") {
      setIsloading(true)
    }
  }, [login, secret, setIsloading])

  React.useEffect(() => {
    secret && user && handleNFIDLogin()
  }, [handleNFIDLogin, user, remoteNFIDLogin, secret, sendWaitForUserInput])

  const { userNumber } = useAccount()
  React.useEffect(() => {
    if (!userNumber) {
      navigate(
        `${RemoteRegisterAccountConstants.base}/${RemoteRegisterAccountConstants.intro}`,
      )
    }
  }, [navigate, userNumber])

  return (
    <AuthorizeAppSingleAccount
      isLoading={isLoading}
      onContinueButtonClick={handleUnlockNFID}
    />
  )
}
