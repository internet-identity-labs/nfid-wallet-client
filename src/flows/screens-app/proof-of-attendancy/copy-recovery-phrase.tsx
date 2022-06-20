import React from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { useIsLoading } from "frontend/hooks/use-is-loading"
import { CopyRecoveryPhrase } from "frontend/screens/copy-recovery-phrase"
import { generate } from "frontend/services/internet-identity/crypto/mnemonic"

import { ProfileConstants } from "../profile/routes"
import { ima } from 'frontend/api/actors'

interface RegisterAccountCopyRecoveryPhraseProps
  extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
  > { }

interface LocationState {
  recoveryPhrase: string
}

export const ProofOfAttendencyCopyRecoveryPhrase: React.FC<
  RegisterAccountCopyRecoveryPhraseProps
> = ({ children, className }) => {
  const navigate = useNavigate()
  const { isLoading, setIsloading } = useIsLoading()
  const { state } = useLocation()

  const recoveryPhrase = React.useMemo(() => {
    return (
      (state as LocationState)?.recoveryPhrase ?? `123456 ${generate().trim()}`
    )
  }, [state])

  const handlePoap = React.useCallback(async () => {
    setIsloading(true)

    const hasPoap = await ima.has_poap()
    !hasPoap && (await ima.increment_poap())
    setIsloading(false)
    navigate(`${ProfileConstants.base}/${ProfileConstants.authenticate}`)
  }, [navigate, setIsloading])

  return (
    <CopyRecoveryPhrase
      recoveryPhrase={recoveryPhrase}
      continueButtonText={"Continue"}
      onContinueButtonClick={handlePoap}
      onSuccessModalClick={() => {
        navigate(`${ProfileConstants.base}/${ProfileConstants.authenticate}`)
      }}
      isLoading={isLoading}
    />
  )
}
