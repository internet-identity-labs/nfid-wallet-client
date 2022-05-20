import React from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import { ProfileConstants } from "frontend/flows/screens-app/profile/routes"
import { useAuthorizeApp } from "frontend/hooks/use-authorize-app"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { CopyRecoveryPhrase } from "frontend/screens/copy-recovery-phrase"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { generate } from "frontend/services/internet-identity/crypto/mnemonic"

interface RegisterAccountCopyRecoveryPhraseProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  isRemoteRegistration?: boolean
  continueButtonText?: string
}

interface LocationState {
  recoveryPhrase: string
}

export const RegisterAccountCopyRecoveryPhrase: React.FC<
  RegisterAccountCopyRecoveryPhraseProps
> = ({ isRemoteRegistration = false, continueButtonText }) => {
  const navigate = useNavigate()
  const { secret, scope } = useParams()
  const { isLoading, setIsloading } = useIsLoading()
  const { remoteLogin, remoteNFIDLogin } = useAuthorizeApp()
  const { state } = useLocation()

  const isNFID = React.useMemo(() => scope === "NFID", [scope])

  const recoveryPhrase = React.useMemo(() => {
    return (
      (state as LocationState)?.recoveryPhrase ?? `123456 ${generate().trim()}`
    )
  }, [state])

  const { nextPersonaId, createPersona } = usePersona()

  const [successModal, setShowSuccessModal] = React.useState(false)

  const handleAuthorizePersona = React.useCallback(async () => {
    setIsloading(true)
    const response = await createPersona({
      domain: `${window.location.protocol}//${scope}`,
    })
    if (response?.status_code === 200) {
      if (!secret || !scope) throw new Error("missing secret or scope")
      await remoteLogin({ secret, scope, persona_id: nextPersonaId })
      setIsloading(false)
      return setShowSuccessModal(true)
    }
    console.error(response)
  }, [createPersona, nextPersonaId, remoteLogin, scope, secret, setIsloading])

  const handleNavigateToProfile = React.useCallback(() => {
    navigate(`${ProfileConstants.base}/${ProfileConstants.authenticate}`)
  }, [navigate])

  const handleNFIDLogin = React.useCallback(async () => {
    if (!secret) throw new Error("secret is missing from params")
    setIsloading(true)
    await remoteNFIDLogin({ secret })
    setIsloading(false)
    handleNavigateToProfile()
  }, [handleNavigateToProfile, remoteNFIDLogin, secret, setIsloading])

  const handleLogin = React.useCallback(() => {
    navigate("/")
  }, [navigate])

  return (
    <CopyRecoveryPhrase
      recoveryPhrase={recoveryPhrase}
      continueButtonText={continueButtonText || `Continue`}
      showSuccessModal={successModal}
      showSuccessModalText={
        "Remember to keep your recovery phrase secret, safe, offline, and only use it on https://nfid.one"
      }
      onContinueButtonClick={
        isRemoteRegistration
          ? isNFID
            ? handleNFIDLogin
            : handleAuthorizePersona
          : handleLogin
      }
      onSuccessModalClick={handleNavigateToProfile}
      isLoading={isLoading}
    />
  )
}
