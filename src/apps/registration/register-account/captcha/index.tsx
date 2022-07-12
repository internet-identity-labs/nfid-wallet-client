import React from "react"
import { useParams } from "react-router-dom"

import { Captcha } from "frontend/design-system/pages/captcha"
import {
  useCaptcha,
  useChallenge,
} from "frontend/design-system/pages/captcha/hook"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useAuthorization } from "frontend/apps/authorization/use-authorization"
import { useAuthorizeApp } from "frontend/apps/authorization/use-authorize-app"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { useMultipass } from "frontend/apps/identity-provider/use-app-meta"
import { im } from "frontend/comm/actors"
import { useAccount } from "frontend/comm/services/identity-manager/account/hooks"
import { usePersona } from "frontend/comm/services/identity-manager/persona/hooks"
import { useNFIDNavigate } from "frontend/utils/use-nfid-navigate"

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
  const {
    challenge,
    isLoading: isChallengeLoading,
    loadNewChallenge,
  } = useChallenge()

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
      loadNewChallenge()
      setCaptchaError("Wrong captcha! Please try again")
    },
  })

  const handleRegisterAnchor = React.useCallback(
    async ({ captcha }: { captcha: string }) => {
      const response = await registerAnchor({ captcha })

      if (response && response.kind === "loginSuccess") {
        const { user } = response
        await createAccount({ anchor: response.userNumber })

        if (isRemoteRegiser) {
          if (!secret) throw new Error("secret is missing from params")

          if (isNFID) {
            await remoteNFIDLogin({
              secret,
              userNumberOverwrite: response.userNumber,
              userOverwrite: user,
            })
            return navigate("/profile/authenticate")
          }

          if (!scope) throw new Error("scope is missing from params")
          await Promise.all([
            createPersona({
              domain: scope,
            }),
            remoteLogin({
              secret,
              scope,
              persona_id: nextPersonaId,
              userNumberOverwrite: response.userNumber,
              chain: response.chain,
              sessionKey: response.sessionKey,
            }),
          ])
        }

        navigate("/profile/authenticate")
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
  const { setShouldStoreLocalAccount } = useAuthentication()

  const handleRegisterAnchorWithGoogle = React.useCallback(
    async ({ captcha }: { captcha: string }) => {
      const response = await registerAnchorFromGoogle({ captcha })
      if (response && response.kind === "loginSuccess") {
        setShouldStoreLocalAccount(false)
        const { user } = response
        await im.create_account({
          anchor: response.userNumber,
        })
        if (isRemoteRegiser) {
          if (!secret) throw new Error("secret is missing from params")

          if (isNFID) {
            await remoteNFIDLogin({
              secret,
              userNumberOverwrite: response.userNumber,
              userOverwrite: user,
            })
            return navigate(successPath)
          }

          if (!scope) throw new Error("scope is required")
          await Promise.all([
            im.create_persona({
              domain: scope,
              persona_id: nextPersonaId,
              persona_name: "",
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
          return navigate(successPath)
        }

        if (!isNFID) {
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
        }
        return navigate(successPath)
      }
      console.error(">> handleRegisterAnchor", response)
    },
    [
      authorizeApp,
      isNFID,
      isRemoteRegiser,
      navigate,
      nextPersonaId,
      registerAnchorFromGoogle,
      remoteLogin,
      remoteNFIDLogin,
      scope,
      secret,
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
      successPath={"/profile/authenticate"}
      onRegisterAnchor={
        isGoogle ? handleRegisterAnchorWithGoogle : handleRegisterAnchor
      }
      onRequestNewCaptcha={loadNewChallenge}
      challengeBase64={challenge?.png_base64}
      errorString={captchaError}
    />
  )
}
