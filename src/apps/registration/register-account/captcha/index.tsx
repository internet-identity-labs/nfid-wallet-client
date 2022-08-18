import React from "react"
import { useParams } from "react-router-dom"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useAuthorizeApp } from "frontend/apps/authorization/use-authorize-app"
import { useMultipass } from "frontend/apps/identity-provider/use-app-meta"
import { deviceInfo } from "frontend/integration/device"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { Icon } from "frontend/integration/identity-manager/devices/state"
import { authState } from "frontend/integration/internet-identity"
import { Captcha } from "frontend/ui/pages/captcha"
import { useCaptcha, useChallenge } from "frontend/ui/pages/captcha/hook"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

interface RegisterAccountCopyRecoveryPhraseProps
  extends React.HTMLAttributes<HTMLDivElement> {
  isRemoteRegister?: boolean
}

export const RegisterAccountCaptcha: React.FC<
  RegisterAccountCopyRecoveryPhraseProps
> = ({ isRemoteRegister }) => {
  const { secret } = useParams()
  const [captchaError, setCaptchaError] = React.useState<string | undefined>(
    undefined,
  )
  const { setShouldStoreLocalAccount } = useAuthentication()
  const { remoteNFIDLogin } = useAuthorizeApp()
  const { createAccount } = useAccount()

  const { navigate } = useNFIDNavigate()

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
      console.debug("RegisterAccountCaptcha handleRegisterAnchor", { captcha })
      const response = await registerAnchor({ captcha })
      console.debug("RegisterAccountCaptcha handleRegisterAnchor", { response })

      if (response && response.kind === "loginSuccess") {
        const { user } = response
        const account = { anchor: response.userNumber }
        const accessPoint = {
          icon: (deviceInfo.isMobile ? "mobile" : "desktop") as Icon,
          device: deviceInfo.newDeviceName,
          browser: deviceInfo.browser.name ?? "Mobile",
          pubKey: Array.from(
            new Uint8Array(
              authState.get()?.delegationIdentity?.getPublicKey().toDer() ?? [],
            ),
          ),
        }
        console.debug("RouterRegisterDeviceDecider handleRegister", {
          account,
          accessPoint,
        })
        const profile = await createAccount(account, accessPoint)

        console.debug("RegisterAccountCaptcha handleRegisterAnchor", {
          profile,
        })

        if (isRemoteRegister) {
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
      isRemoteRegister,
      navigate,
      registerAnchor,
      remoteNFIDLogin,
      secret,
    ],
  )

  const handleRegisterAnchorWithGoogle = React.useCallback(
    async ({ captcha }: { captcha: string }) => {
      console.debug("handleRegisterAnchorWithGoogle", { captcha })
      const response = await registerAnchorFromGoogle({ captcha })
      console.debug("handleRegisterAnchorWithGoogle", { response })
      if (response && response.kind === "loginSuccess") {
        setShouldStoreLocalAccount(false)
        const { user } = response
        const account = { anchor: response.userNumber }
        const accessPoint = {
          // TODO: we need to create a google icon
          icon: "mobile" as Icon,
          device: "NFID Google device",
          browser: "cross platform",
          pubKey: Array.from(
            new Uint8Array(
              authState.get()?.delegationIdentity?.getPublicKey().toDer() ?? [],
            ),
          ),
        }
        await createAccount(account, accessPoint, false)
        console.debug("RouterRegisterDeviceDecider handleRegister", {
          account,
          accessPoint,
        })
        console.debug("handleRegisterAnchorWithGoogle", {
          isRemoteRegister,
          secret,
        })
        if (isRemoteRegister) {
          if (!secret)
            throw new Error(
              `RegisterAccountCaptcha.handleRegisterAnchorWithGoogle secret is missing from params`,
            )

          const loginResponse = await remoteNFIDLogin({
            secret,
            userNumberOverwrite: response.userNumber,
            userOverwrite: user,
          })
          console.debug("loginResponse", { loginResponse })
        }

        return navigate("/profile/authenticate")
      }
      console.error(
        "RegisterAccountCaptcha.handleRegisterAnchorWithGoogle",
        response,
      )
    },
    [
      createAccount,
      isRemoteRegister,
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
