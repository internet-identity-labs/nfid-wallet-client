import React from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import { useAuthorizeApp } from "frontend/hooks/use-authorize-app"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useMultipass } from "frontend/hooks/use-multipass"
import { CopyRecoveryPhrase } from "frontend/screens/copy-recovery-phrase"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
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
  const { secret, scope } = useParams()
  const { isLoading, setIsloading } = useIsLoading()
  const { applicationName } = useMultipass()
  const { remoteLogin } = useAuthorizeApp()
  const { state } = useLocation()

  const recoveryPhrase = React.useMemo(() => {
    return (
      (state as LocationState)?.recoveryPhrase ?? `123456 ${generate().trim()}`
    )
  }, [state])

  const { nextPersonaId, createPersona } = usePersona()

  const [successModal, setShowSuccessModal] = React.useState(false)

  const handleAuthorizePersona = React.useCallback(async () => {
    setIsloading(true)
    const response = await createPersona({ domain: scope })
    if (response?.status_code === 200) {
      if (!secret || !scope) throw new Error("missing secret or scope")
      await remoteLogin({ secret, scope, persona_id: nextPersonaId })
      setIsloading(false)
      return setShowSuccessModal(true)
    }
    console.error(response)
  }, [createPersona, nextPersonaId, remoteLogin, scope, secret, setIsloading])

  return (
    <CopyRecoveryPhrase
      recoveryPhrase={recoveryPhrase}
      continueButtonText={`Log in to ${applicationName || "NFID Demo"}.`}
      showSuccessModal={successModal}
      showSuccessModalText={`You signed in to ${
        applicationName || "NFID Demo"
      }`}
      onContinueButtonClick={handleAuthorizePersona}
      onSuccessModalClick={() => {
        navigate(`${ProfileConstants.base}/${ProfileConstants.authenticate}`)
      }}
      isLoading={isLoading}
    />
  )
}
