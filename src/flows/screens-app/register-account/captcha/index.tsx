import React from "react"
import { useNavigate, useParams } from "react-router-dom"

import { ProfileConstants } from "frontend/flows/screens-app/profile/routes"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAuthorizeApp } from "frontend/hooks/use-authorize-app"
import { useMultipass } from "frontend/hooks/use-multipass"
import { Captcha } from "frontend/screens/captcha"
import { useCaptcha } from "frontend/screens/captcha/hook"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"

interface RegisterAccountCopyRecoveryPhraseProps
  extends React.HTMLAttributes<HTMLDivElement> {
  isRemoteRegistration?: boolean
}

export const RegisterAccountCaptcha: React.FC<
  RegisterAccountCopyRecoveryPhraseProps
> = ({ isRemoteRegistration }) => {
  const navigate = useNavigate()
  const { secret, scope } = useParams()
  const [captchaError, setCaptchaError] = React.useState<string | undefined>(
    undefined,
  )
  const [isPreparingDelegate, setIsPreparingDelegate] = React.useState(false)
  const { remoteLogin, remoteNFIDLogin } = useAuthorizeApp()
  const { isAuthenticated } = useAuthentication()
  const { userNumber } = useAccount()

  const isNFID = React.useMemo(() => scope === "NFID", [scope])

  const { nextPersonaId, createPersona } = usePersona()

  const handleAuthorizePersona = React.useCallback(async () => {
    setIsPreparingDelegate(true)
    if (!secret || !scope) throw new Error("missing secret or scope")
    await remoteLogin({ secret, scope, persona_id: nextPersonaId })
    setIsPreparingDelegate(false)
  }, [nextPersonaId, remoteLogin, scope, secret])

  const handleNavigateToProfile = React.useCallback(() => {
    navigate(`${ProfileConstants.base}/${ProfileConstants.authenticate}`)
  }, [navigate])

  const handleNFIDLogin = React.useCallback(async () => {
    if (!secret) throw new Error("secret is missing from params")
    setIsPreparingDelegate(true)
    await remoteNFIDLogin({ secret })
    setIsPreparingDelegate(false)
    handleNavigateToProfile()
  }, [handleNavigateToProfile, remoteNFIDLogin, secret])

  const { setLoading, loading, challenge, requestCaptcha, registerAnchor } =
    useCaptcha({
      onApiError: async () => {
        setLoading(false)
      },
      onBadChallenge: async () => {
        await requestCaptcha()
        setLoading(false)
        setCaptchaError("Wrong captcha! Please try again")
      },
    })

  // TODO: as soon as we have global singleton auth state,
  // we can get rid of these eval side effects
  const authorizationStateRef = React.useRef<{
    delegateRequested: boolean
    personaRequested: boolean
  }>({ delegateRequested: false, personaRequested: false })

  React.useEffect(() => {
    if (isAuthenticated && userNumber) {
      if (!authorizationStateRef.current.personaRequested) {
        authorizationStateRef.current.personaRequested = true
        !isNFID &&
          createPersona({
            domain: `${window.location.protocol}//${scope}`,
          })
      }
      if (!authorizationStateRef.current.delegateRequested) {
        authorizationStateRef.current.delegateRequested = true
        isRemoteRegistration
          ? isNFID
            ? handleNFIDLogin()
            : handleAuthorizePersona()
          : handleNavigateToProfile()
      }
    }
  }, [
    createPersona,
    handleAuthorizePersona,
    handleNFIDLogin,
    handleNavigateToProfile,
    isAuthenticated,
    isNFID,
    isRemoteRegistration,
    scope,
    userNumber,
  ])

  React.useEffect(() => {
    if (
      isAuthenticated &&
      authorizationStateRef.current.delegateRequested &&
      !isPreparingDelegate
    ) {
      navigate(`${ProfileConstants.base}/${ProfileConstants.authenticate}`)
    }
  }, [isAuthenticated, isPreparingDelegate, navigate])

  const { applicationLogo, applicationName } = useMultipass()
  return (
    <Captcha
      isLoading={loading}
      applicationLogo={applicationLogo}
      applicationName={applicationName}
      successPath={`${ProfileConstants.base}/${ProfileConstants.authenticate}`}
      onRegisterAnchor={registerAnchor}
      onRequestNewCaptcha={requestCaptcha}
      challengeBase64={challenge?.png_base64}
      errorString={captchaError}
    />
  )
}
