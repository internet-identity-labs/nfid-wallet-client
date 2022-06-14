import { Ed25519KeyIdentity } from "@dfinity/identity"
import React from "react"

import { ii } from "frontend/api/actors"
import { ChallengeResult } from "frontend/api/idl/internet_identity_types"
import { useAuthorization } from "frontend/hooks/use-authorization"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { Captcha } from "frontend/screens/captcha"
import { useCaptcha } from "frontend/screens/captcha/hook"
import { useUnknownDeviceConfig } from "frontend/screens/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"

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
    registerPayload: { deviceName, identity, isGoogle },
    loading,
    challenge,
    requestCaptcha,
    registerAnchor,
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

  const { userNumber } = useAccount()

  const { authorizeApp } = useAuthorization({
    userNumber,
  })

  const { nextPersonaId, createPersona } = usePersona()

  const handleRegisterAnchor = React.useCallback(
    async ({ captcha }: { captcha: string }) => {
      await registerAnchor({ captcha })
      await Promise.all([
        createPersona({ domain: scope }),
        authorizeApp({ persona_id: nextPersonaId, domain: scope }),
      ])
      navigate(successPath)
    },
    [
      authorizeApp,
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
      if (!challenge) throw new Error("No challenge")
      const challengeResult: ChallengeResult = {
        chars: captcha,
        key: challenge.challenge_key,
      }
      const googleIdentity = Ed25519KeyIdentity.fromJSON(identity)

      await IIConnection.fromGoogleDevice(googleIdentity)

      const registerResponse = await ii.register(
        {
          alias: deviceName,
          pubkey: Array.from(
            new Uint8Array(googleIdentity.getPublicKey().toDer()),
          ),
          credential_id: [],
          key_type: { unknown: null },
          purpose: { authentication: null },
        },
        challengeResult,
      )
      console.log(">> ", { registerResponse })
    },
    [challenge, deviceName, identity],
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
