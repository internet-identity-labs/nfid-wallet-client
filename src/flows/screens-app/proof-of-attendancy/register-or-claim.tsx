import React from "react"
import { generatePath, Navigate, useParams } from "react-router-dom"

import { RegisterAccountConstantsIIW as RACIIW } from "frontend/flows/screens-app/register-account-iiw/routes"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { ProofOfAttendency } from "frontend/screens/proof-of-attendency"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

interface RegisterOrClaimProps {}

export const ClaimAttendency: React.FC<RegisterOrClaimProps> = () => {
  const { secret } = useParams()
  const { isLoading, setIsloading } = useIsLoading()
  const { login } = useAuthentication()
  const { account } = useAccount()

  const handleLogin = React.useCallback(async () => {
    console.log(">> handleContinue", {})
    setIsloading(true)
    const response = await login()
    console.log(">> handleContinue", { response })
    setIsloading(false)
  }, [login, setIsloading])

  return account ? (
    <ProofOfAttendency
      isLoading={isLoading}
      onContinueButtonClick={handleLogin}
      continueButtonContent={"get proof of attendance"}
    />
  ) : (
    <Navigate to={generatePath(`${RACIIW.base}/${RACIIW.intro}`, { secret })} />
  )
}
