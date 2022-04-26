import React from "react"
import { generatePath, useNavigate, useParams } from "react-router-dom"

import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useMultipass } from "frontend/hooks/use-multipass"
import { ProofOfAttendency } from "frontend/screens/proof-of-attendency"

import { AppScreenProofOfAttendencyConstants } from "./routes"

interface RegisterOrClaimProps {}

export const RegisterAccountIntro: React.FC<RegisterOrClaimProps> = ({
  children,
}) => {
  const { isLoading, setIsloading } = useIsLoading()
  const { secret } = useParams()
  const { createWebAuthNIdentity } = useMultipass()
  const navigate = useNavigate()

  const handleCreateKeys = React.useCallback(async () => {
    try {
      setIsloading(true)
      const registerPayload = await createWebAuthNIdentity()

      const captchaPath = generatePath(
        `${AppScreenProofOfAttendencyConstants.base}/${AppScreenProofOfAttendencyConstants.captcha}`,
        {
          secret,
        },
      )

      navigate(captchaPath, {
        state: {
          registerPayload,
        },
      })
    } catch (error) {
      setIsloading(false)
    }
  }, [createWebAuthNIdentity, navigate, secret, setIsloading])

  return (
    <ProofOfAttendency
      isLoading={isLoading}
      onContinueButtonClick={handleCreateKeys}
      continueButtonContent={"Create an NFID with biometric on this device"}
    />
  )
}
