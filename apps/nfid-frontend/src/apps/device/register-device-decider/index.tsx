import React, { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { BlurredLoader, ScreenResponsive } from "@nfid-frontend/ui"

import { RecoverNFIDRoutesConstants } from "frontend/apps/authentication/recover-nfid/routes"
import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

interface AppScreenRegisterDeviceDeciderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  registerSuccessPath: string
}

export const RouterRegisterDeviceDecider: React.FC<
  AppScreenRegisterDeviceDeciderProps
> = ({ registerSuccessPath }) => {
  const { recoverAccount } = useAccount()
  const { setShouldStoreLocalAccount } = useAuthentication()
  const { generatePath } = useNFIDNavigate()
  const { isAuthenticated } = useAuthentication()

  const navigate = useNavigate()

  const { state } = useLocation()
  const userNumber = BigInt((state as { userNumber: string }).userNumber)

  const handleLogin = React.useCallback(async () => {
    if (!userNumber)
      throw new Error("userNumber is not defined. Not authorized.")

    setShouldStoreLocalAccount(false)

    await recoverAccount(userNumber, false)

    navigate(generatePath(registerSuccessPath))
  }, [
    generatePath,
    navigate,
    recoverAccount,
    registerSuccessPath,
    setShouldStoreLocalAccount,
    userNumber,
  ])

  useEffect(() => {
    if (!isAuthenticated)
      navigate(
        `${RecoverNFIDRoutesConstants.base}/${RecoverNFIDRoutesConstants.enterRecoveryPhrase}`,
      )
    else handleLogin()
  }, [handleLogin, isAuthenticated, navigate])

  return (
    <ScreenResponsive>
      <BlurredLoader className="w-full h-full" isLoading />
    </ScreenResponsive>
  )
}

export default RouterRegisterDeviceDecider
