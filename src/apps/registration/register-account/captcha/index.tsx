import React from "react"
import { useParams } from "react-router-dom"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useAuthorizeApp } from "frontend/apps/authorization/use-authorize-app"
import { useMultipass } from "frontend/apps/identity-provider/use-app-meta"
import { im } from "frontend/integration/actors"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { Captcha } from "frontend/ui/pages/captcha"
import { useCaptcha, useChallenge } from "frontend/ui/pages/captcha/hook"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

interface RegisterAccountCopyRecoveryPhraseProps
  extends React.HTMLAttributes<HTMLDivElement> {
  isRemoteRegiser?: boolean
}

export const RegisterAccountCaptcha: React.FC<
  RegisterAccountCopyRecoveryPhraseProps
> = ({ isRemoteRegiser }) => {
  const { secret } = useParams()
  const [captchaError, setCaptchaError] = React.useState<string | undefined>(
    undefined,
  )
  const { setShouldStoreLocalAccount } = useAuthentication()
  const { remoteNFIDLogin } = useAuthorizeApp()
  const { createAccount } = useAccount()

  const { navigate } = useNFIDNavigate()

  console.debug("RegisterAccountCaptcha", {
    isRemoteRegiser,
  })

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
          if (!secret)
            throw new Error(
              `RegisterAccountCaptcha.handleRegisterAnchor secret is missing from params`,
            )

          await remoteNFIDLogin({
            secret,
            userNumberOverwrite: response.userNumber,
            userOverwrite: user,
          })
          return navigate("/profile/authenticate")
        }

        navigate("/profile/authenticate")
      }
    },
    [
      createAccount,
      isRemoteRegiser,
      navigate,
      registerAnchor,
      remoteNFIDLogin,
      secret,
    ],
  )

  const handleRegisterAnchorWithGoogle = React.useCallback(
    async ({ captcha }: { captcha: string }) => {
      const response = await registerAnchorFromGoogle({ captcha })
      if (response && response.kind === "loginSuccess") {
        setShouldStoreLocalAccount(false)
        const { user } = response
        await im
          .create_account({
            anchor: response.userNumber,
          })
          .catch((e) => {
            throw new Error(
              `handleRegisterAnchorWithGoogle im.create_account: ${e.message}`,
            )
          })
        if (isRemoteRegiser) {
          if (!secret)
            throw new Error(
              `RegisterAccountCaptcha.handleRegisterAnchorWithGoogle secret is missing from params`,
            )

          await remoteNFIDLogin({
            secret,
            userNumberOverwrite: response.userNumber,
            userOverwrite: user,
          })
        }

        return navigate("/profile/authenticate")
      }
      console.error(
        "RegisterAccountCaptcha.handleRegisterAnchorWithGoogle",
        response,
      )
    },
    [
      isRemoteRegiser,
      navigate,
      registerAnchorFromGoogle,
      remoteNFIDLogin,
      secret,
      setShouldStoreLocalAccount,
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
