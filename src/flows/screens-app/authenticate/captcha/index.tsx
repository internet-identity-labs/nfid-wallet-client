import React from "react"

import { im } from "frontend/api/actors"
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

  const {
    setLoading,
    registerPayload: { isGoogle },
    loading,
    challenge,
    requestCaptcha,
    registerAnchor,
    registerAnchorFromGoogle,
  } = useCaptcha({
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

  const { userNumber, createAccount } = useAccount()

  const { authorizeApp } = useAuthorization({
    userNumber,
  })

  const { nextPersonaId, createPersona } = usePersona()

  const handleRegisterAnchor = React.useCallback(
    async ({ captcha }: { captcha: string }) => {
      const response = await registerAnchor({ captcha })
      if (response.kind === "loginSuccess") {
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
      if (!scope) throw new Error("scope is required")

      const response = await registerAnchorFromGoogle({ captcha })
      if (response.kind === "loginSuccess") {
        await im.create_account({
          anchor: response.userNumber,
        })
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
      console.error(">> handleRegisterAnchor", response)
    },
    [
      authorizeApp,
      navigate,
      nextPersonaId,
      registerAnchorFromGoogle,
      scope,
      successPath,
    ],
  )

  const { applicationLogo, applicationName } = useMultipass()
  return (
    <Captcha
      isLoading={loading}
      applicationLogo={applicationLogo}
      applicationName={applicationName}
      successPath={successPath}
      onRegisterAnchor={
        isGoogle ? handleRegisterAnchorWithGoogle : handleRegisterAnchor
      }
      onRequestNewCaptcha={requestCaptcha}
      challengeBase64={challenge?.png_base64}
      errorString={captchaError}
    />
  )
}
