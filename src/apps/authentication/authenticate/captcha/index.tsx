import React from "react"

import { Captcha } from "frontend/design-system/pages/captcha"
import {
  useCaptcha,
  useChallenge,
} from "frontend/design-system/pages/captcha/hook"
import { useUnknownDeviceConfig } from "frontend/design-system/pages/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"

import { useAuthorization } from "frontend/apps/authorization/use-authorization"
import { useMultipass } from "frontend/apps/identity-provider/use-app-meta"
import { im } from "frontend/comm/actors"
import { useAccount } from "frontend/comm/services/identity-manager/account/hooks"
import { usePersona } from "frontend/comm/services/identity-manager/persona/hooks"
import { useNFIDNavigate } from "frontend/utils/use-nfid-navigate"

import { useAuthentication } from "../../use-authentication"

interface RouteCaptchaProps {
  successPath: string
}

export const RouteCaptcha: React.FC<RouteCaptchaProps> = ({ successPath }) => {
  const { scope } = useUnknownDeviceConfig()

  const [captchaError, setCaptchaError] = React.useState<string | undefined>(
    undefined,
  )

  const {
    challenge,
    isLoading: isChallengeLoading,
    loadNewChallenge,
  } = useChallenge()

  const {
    setLoading,
    registerPayload: { isGoogle },
    loading,
    registerAnchor,
    registerAnchorFromGoogle,
  } = useCaptcha({
    onApiError: async () => {
      setLoading(false)
      setCaptchaError("API Error, please try again")
    },
    onBadChallenge: async () => {
      setLoading(false)
      loadNewChallenge()
      setCaptchaError("Wrong captcha! Please try again")
    },
  })

  const { navigate } = useNFIDNavigate()

  const { userNumber, createAccount } = useAccount()

  const { setShouldStoreLocalAccount } = useAuthentication()
  const { authorizeApp } = useAuthorization({
    userNumber,
  })

  const { nextPersonaId, createPersona } = usePersona()

  const handleRegisterAnchor = React.useCallback(
    async ({ captcha }: { captcha: string }) => {
      const response = await registerAnchor({ captcha })

      if (response && response.kind === "loginSuccess") {
        await createAccount({ anchor: response.userNumber })
        await Promise.all([
          createPersona({ domain: scope }),
          authorizeApp({
            persona_id: nextPersonaId,
            domain: scope,
            anchor: response.userNumber,
          }),
        ])
        return navigate(successPath)
      }
      console.error(">> handleRegisterAnchor", response)
    },
    [
      authorizeApp,
      createAccount,
      createPersona,
      navigate,
      nextPersonaId,
      registerAnchor,
      scope,
      successPath,
    ],
  )

  const handleRegisterAnchorWithGoogle = React.useCallback(
    async ({ captcha }: { captcha: string }) => {
      console.debug(">> handleRegisterAnchorWithGoogle", { captcha })

      const response = await registerAnchorFromGoogle({ captcha })
      console.debug(">> handleRegisterAnchorWithGoogle", { response })

      if (response && response.kind === "loginSuccess") {
        setShouldStoreLocalAccount(false)
        await im.create_account({
          anchor: response.userNumber,
        })
        if (!scope) throw new Error("scope is required")
        await Promise.all([
          im.create_persona({
            domain: scope,
            persona_id: nextPersonaId,
            persona_name: "",
          }),
          authorizeApp({
            persona_id: nextPersonaId,
            domain: scope,
            anchor: response.userNumber,
          }),
        ])
        return navigate(successPath)
      }
      console.error(">> handleRegisterAnchorWithGoogle", response)
    },
    [
      authorizeApp,
      navigate,
      nextPersonaId,
      registerAnchorFromGoogle,
      scope,
      setShouldStoreLocalAccount,
      successPath,
    ],
  )

  const { applicationLogo, applicationName } = useMultipass()

  return (
    <Captcha
      isLoading={loading}
      isChallengeLoading={isChallengeLoading}
      applicationLogo={applicationLogo}
      applicationName={applicationName}
      successPath={successPath}
      onRegisterAnchor={
        isGoogle ? handleRegisterAnchorWithGoogle : handleRegisterAnchor
      }
      onRequestNewCaptcha={loadNewChallenge}
      challengeBase64={challenge?.png_base64}
      errorString={captchaError}
    />
  )
}
