import React from "react"
import { useNavigate } from "react-router-dom"
import { generatePath, Navigate, useParams } from "react-router-dom"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { ProofOfAttendency } from "frontend/screens/proof-of-attendency"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

import { ProfileConstants } from "../profile/routes"
import { AppScreenProofOfAttendencyConstants } from "./routes"
import { ima } from 'frontend/api/actors'

interface RegisterOrClaimProps { }

export const ClaimAttendency: React.FC<RegisterOrClaimProps> = () => {
  const { secret } = useParams()
  const { isLoading, setIsloading } = useIsLoading()
  const { login } = useAuthentication()
  const { account } = useAccount()
  const navigate = useNavigate()

  const handleLogin = React.useCallback(async () => {
    setIsloading(true)
    const response = await login()
    if (response && response.tag === "ok") {
      const hasPoap = await ima.has_poap()
      !hasPoap && (await ima.increment_poap())
      navigate(`${ProfileConstants.base}/${ProfileConstants.authenticate}`)

      setIsloading(false)
    }
  }, [login, navigate, setIsloading])

  return account ? (
    <ProofOfAttendency
      isLoading={isLoading}
      onContinueButtonClick={handleLogin}
      continueButtonContent={"get proof of attendance"}
    />
  ) : (
    <Navigate
      to={generatePath(
        `${AppScreenProofOfAttendencyConstants.base}/${AppScreenProofOfAttendencyConstants.register}`,
        { secret },
      )}
    />
  )
}
