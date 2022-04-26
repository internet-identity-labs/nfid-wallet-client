import React from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import { useIsLoading } from "frontend/hooks/use-is-loading"
import { CopyRecoveryPhrase } from "frontend/screens/copy-recovery-phrase"
import { generate } from "frontend/services/internet-identity/crypto/mnemonic"

import { ProfileConstants } from "../profile/routes"

interface RegisterAccountCopyRecoveryPhraseProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

interface LocationState {
  recoveryPhrase: string
}

export const RegisterAccountCopyRecoveryPhrase: React.FC<
  RegisterAccountCopyRecoveryPhraseProps
> = ({ children, className }) => {
  const navigate = useNavigate()
  const { secret } = useParams()
  const { isLoading, setIsloading } = useIsLoading()
  const { state } = useLocation()

  const recoveryPhrase = React.useMemo(() => {
    return (
      (state as LocationState)?.recoveryPhrase ?? `123456 ${generate().trim()}`
    )
  }, [state])

  const handleClaimAndLogin = React.useCallback(async () => {
    setIsloading(true)
    console.log(">> handleClaimAndLogin", { secret })
    setTimeout(() => setIsloading(false), 1000)
  }, [secret, setIsloading])

  return (
    <CopyRecoveryPhrase
      recoveryPhrase={recoveryPhrase}
      continueButtonText={`Log in to NFID`}
      onContinueButtonClick={handleClaimAndLogin}
      onSuccessModalClick={() => {
        navigate(`${ProfileConstants.base}/${ProfileConstants.authenticate}`)
      }}
      isLoading={isLoading}
    />
  )
}
