import React from "react"
import { useParams } from "react-router-dom"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAuthorizeApp } from "frontend/hooks/use-authorize-app"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { AuthorizeAppSingleAccount } from "frontend/screens/authorize-app/single-account"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

import { ProfileConstants } from "../../profile/routes"
import { RemoteRegisterAccountConstants } from "../../register-account/routes"

interface AppScreenAuthorizeAppProps { }

export const AuthorizeNFID: React.FC<AppScreenAuthorizeAppProps> = () => {
  const { isLoading, setIsloading } = useIsLoading()
  const { secret } = useParams()
  const { sendWaitForUserInput, remoteNFIDLogin } = useAuthorizeApp()
  const { user, login } = useAuthentication()
  const { navigate } = useNFIDNavigate()

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
    secret && user && handleNFIDLogin()
  }, [
    handleNFIDLogin,
    user,
    remoteNFIDLogin,
    secret,
    sendWaitForUserInput,
  ])

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
