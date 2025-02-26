import { useState } from "react"

import { AuthSignUpCaptcha } from "./captcha"
import { AuthSignUpCreatePasskey } from "./create-passkey"

export function AuthSignUpPassKey({
  getCaptcha,
  onPasskeyCreate,
  isPasskeyCreating,
  applicationURL,
  onBack,
  withLogo,
  title,
  subTitle,
  createPasskeyError,
  clearError,
}: {
  getCaptcha: () => Promise<{
    png_base64: [] | [string]
    challenge_key: string
  }>
  onPasskeyCreate: (val: {
    walletName: string
    enteredCaptcha?: string
    challengeKey: string
  }) => unknown
  isPasskeyCreating?: boolean
  createPasskeyError?: string
  applicationURL?: string
  onBack: () => unknown
  withLogo?: boolean
  title?: string
  subTitle?: string
  clearError: () => unknown
}) {
  const [walletName, setWalletName] = useState("")
  const [captcha, setCaptcha] = useState<
    { png_base64: [] | [string]; challenge_key: string } | undefined
  >()
  const [captchaLoading, setCaptchaLoading] = useState(false)

  if (captcha?.png_base64.length)
    return (
      <AuthSignUpCaptcha
        onBack={onBack}
        withLogo={withLogo}
        title={title}
        subTitle={subTitle}
        captcha={captcha?.png_base64[0]}
        onContinue={(val) => {
          clearError()
          onPasskeyCreate({
            walletName,
            enteredCaptcha: val,
            challengeKey: captcha.challenge_key,
          })
        }}
        getCaptcha={() => {
          setCaptchaLoading(true)
          clearError()
          getCaptcha()
            .then(setCaptcha)
            .finally(() => {
              setCaptchaLoading(false)
            })
        }}
        applicationURL={applicationURL}
        captchaLoading={captchaLoading}
        isCreatingWallet={isPasskeyCreating}
        error={createPasskeyError}
      />
    )

  return (
    <AuthSignUpCreatePasskey
      onBack={onBack}
      withLogo={withLogo}
      title={title}
      subTitle={subTitle}
      onCreate={(walletName) => {
        setCaptchaLoading(true)
        getCaptcha()
          .then((captcha) => {
            if (!captcha.png_base64.length) {
              onPasskeyCreate({
                walletName,
                challengeKey: captcha.challenge_key,
              })
            } else {
              setCaptcha(captcha)
              setWalletName(walletName)
            }
          })
          .finally(() => {
            setCaptchaLoading(false)
          })
      }}
      isCreating={captchaLoading || isPasskeyCreating}
      applicationURL={applicationURL}
    />
  )
}
