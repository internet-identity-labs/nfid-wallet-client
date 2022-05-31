import React from "react"
import { useNavigate, useParams } from "react-router-dom"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAuthorizeApp } from "frontend/hooks/use-authorize-app"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { AuthorizeAppSingleAccount } from "frontend/screens/authorize-app/single-account"

import { ProfileConstants } from "../../profile/routes"

interface AppScreenAuthorizeAppProps {}

export const AuthorizeNFID: React.FC<AppScreenAuthorizeAppProps> = () => {
  const { isLoading, setIsloading } = useIsLoading()
  const { secret } = useParams()
  const { sendWaitForUserInput, remoteNFIDLogin } = useAuthorizeApp()
  const { isAuthenticated, login } = useAuthentication()
  const navigate = useNavigate()

  const handleNFIDLogin = React.useCallback(async () => {
    if (!secret) throw new Error("missing secret")

    await remoteNFIDLogin({ secret })
    navigate(`${ProfileConstants.base}/${ProfileConstants.authenticate}`)
  }, [navigate, remoteNFIDLogin, secret])

  const handleUnlockNFID = React.useCallback(async () => {
    if (!secret) throw new Error("missing secret, scope or persona_id")

    const result = await login()
    if (result && result.tag === "ok") {
      setIsloading(true)
    }
  }, [login, secret, setIsloading])

  React.useEffect(() => {
    secret && isAuthenticated && handleNFIDLogin()
  }, [
    handleNFIDLogin,
    isAuthenticated,
    remoteNFIDLogin,
    secret,
    sendWaitForUserInput,
  ])

  return (
    <AuthorizeAppSingleAccount
      isLoading={isLoading}
      applicationLogo={""}
      applicationName={""}
      onContinueButtonClick={handleUnlockNFID}
    />
  )
}
