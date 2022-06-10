import React from "react"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAuthorization } from "frontend/hooks/use-authorization"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { Captcha } from "frontend/screens/captcha"
import { useCaptcha } from "frontend/screens/captcha/hook"
import { useUnknownDeviceConfig } from "frontend/screens/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"

interface RouteCaptchaProps {
  successPath: string
}

export const RouteCaptcha: React.FC<RouteCaptchaProps> = ({ successPath }) => {
  const { scope } = useUnknownDeviceConfig()

  const [captchaError, setCaptchaError] = React.useState<string | undefined>(
    undefined,
  )

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

  const { navigate } = useNFIDNavigate()

  const { userNumber } = useAccount()

  const { user } = useAuthentication()
  const { isLoading: isPreparingDelegate, authorizeApp } = useAuthorization({
    userNumber,
  })

  const { nextPersonaId, createPersona } = usePersona()

  // TODO: as soon as we have global singleton auth state,
  // we can get rid of these eval side effects
  const authorizationStateRef = React.useRef<{
    delegateRequested: boolean
    personaRequested: boolean
  }>({ delegateRequested: false, personaRequested: false })

  React.useEffect(() => {
    if (user && userNumber) {
      if (!authorizationStateRef.current.personaRequested) {
        authorizationStateRef.current.personaRequested = true
        createPersona({ domain: scope })
      }
      if (!authorizationStateRef.current.delegateRequested) {
        authorizationStateRef.current.delegateRequested = true
        authorizeApp({ persona_id: nextPersonaId, domain: scope })
      }
    }
  }, [
    authorizeApp,
    createPersona,
    user,
    loading,
    nextPersonaId,
    scope,
    userNumber,
  ])

  React.useEffect(() => {
    if (
      user &&
      authorizationStateRef.current.delegateRequested &&
      !isPreparingDelegate
    ) {
      navigate(successPath)
    }
  }, [user, isPreparingDelegate, navigate, successPath])

  const { applicationLogo, applicationName } = useMultipass()
  return (
    <Captcha
      isLoading={loading}
      applicationLogo={applicationLogo}
      applicationName={applicationName}
      successPath={successPath}
      onRegisterAnchor={registerAnchor}
      onRequestNewCaptcha={requestCaptcha}
      challengeBase64={challenge?.png_base64}
      errorString={captchaError}
    />
  )
}
