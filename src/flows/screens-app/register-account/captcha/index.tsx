import React from "react"
import { useParams } from "react-router-dom"

import { im } from "frontend/api/actors"
import { ProfileConstants } from "frontend/flows/screens-app/profile/routes"
import { useAuthorization } from "frontend/hooks/use-authorization"
import { useAuthorizeApp } from "frontend/hooks/use-authorize-app"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { Captcha } from "frontend/screens/captcha"
import { useCaptcha, useChallenge } from "frontend/screens/captcha/hook"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"

interface RegisterAccountCopyRecoveryPhraseProps
  extends React.HTMLAttributes<HTMLDivElement> {
  isRemoteRegiser?: boolean
  isNFIDProp?: boolean
  successPath: string
}

export const RegisterAccountCaptcha: React.FC<
  RegisterAccountCopyRecoveryPhraseProps
> = ({ isRemoteRegiser, isNFIDProp, successPath }) => {
  const { secret, scope } = useParams()
  const [captchaError, setCaptchaError] = React.useState<string | undefined>(
    undefined,
  )
  const { remoteLogin, remoteNFIDLogin } = useAuthorizeApp()
  const { createAccount } = useAccount()

  const { navigate } = useNFIDNavigate()

  const isNFID = React.useMemo(
    () => scope === "NFID" || isNFIDProp,
    [isNFIDProp, scope],
  )

  const { nextPersonaId, createPersona } = usePersona()
  const { challenge, loadNewChallenge } = useChallenge()

  const {
    setLoading,
    registerPayload: { isGoogle },
    loading,
    registerAnchorFromGoogle,
    registerAnchor,
  } = useCaptcha({
    onApiError: async () => {
      setLoading(false)
    },
    onBadChallenge: async () => {
      setLoading(false)
      setCaptchaError("Wrong captcha! Please try again")
    },
  })

  const handleRegisterAnchor = React.useCallback(
    async ({ captcha }: { captcha: string }) => {
      const { user, ...response } = await registerAnchor({ captcha })

      if (response.kind === "loginSuccess") {
        await createAccount({ anchor: response.userNumber })

        if (isNFID) {
          if (isRemoteRegiser) {
            if (!secret) throw new Error("secret is missing from params")
            await remoteNFIDLogin({
              secret,
              userNumberOverwrite: response.userNumber,
              userOverwrite: user,
            })
          }
          return navigate(
            `${ProfileConstants.base}/${ProfileConstants.authenticate}`,
          )
        }

        if (!secret) throw new Error("secret is missing from params")
        if (!scope) throw new Error("scope is missing from params")

        await Promise.all([
          createPersona({
            domain: `${window.location.protocol}//${scope}`,
          }),
          remoteLogin({
            secret,
            scope,
            persona_id: nextPersonaId,
            userNumberOverwrite: response.userNumber,
            connection: response.internetIdentity,
            chain: response.chain,
            sessionKey: response.sessionKey,
          }),
        ])

        navigate(`${ProfileConstants.base}/${ProfileConstants.authenticate}`)
      }
    },
    [
      createAccount,
      createPersona,
      isNFID,
      isRemoteRegiser,
      navigate,
      nextPersonaId,
      registerAnchor,
      remoteLogin,
      remoteNFIDLogin,
      scope,
      secret,
    ],
  )
  const { userNumber } = useAccount()
  const { authorizeApp } = useAuthorization({
    userNumber,
  })

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
  console.log(">> ", { isGoogle })

  return (
    <Captcha
      isLoading={loading}
      applicationLogo={applicationLogo}
      applicationName={applicationName}
      successPath={`${ProfileConstants.base}/${ProfileConstants.authenticate}`}
      onRegisterAnchor={
        isGoogle ? handleRegisterAnchorWithGoogle : handleRegisterAnchor
      }
      onRequestNewCaptcha={loadNewChallenge}
      challengeBase64={challenge?.png_base64}
      errorString={captchaError}
    />
  )
}
