import { useEffect } from "react"

import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import { AuthSignUpCaptcha } from "./captcha"
import { AuthSignUpCreatePasskey } from "./create-passkey"

export function AuthSignUpPassKey({
  getCaptcha,
  onPasskeyCreate,
  isPasskeyCreating,
  applicationURL,
  captcha,
  isLoading,
  onBack,
  withLogo,
  title,
  subTitle,
  captchaEntered,
  onCaptchaEntered,
}: {
  getCaptcha: () => unknown
  onPasskeyCreate: (walletName: string) => unknown
  isPasskeyCreating?: boolean
  createPasskeyError?: string
  applicationURL?: string
  isLoading?: boolean
  captcha?: string
  onBack: () => unknown
  withLogo?: boolean
  title?: string
  subTitle?: string
  captchaEntered?: boolean
  onCaptchaEntered: (value: string) => unknown
}) {
  useEffect(() => {
    if (!captcha && !isLoading) {
      getCaptcha()
    }
  }, [getCaptcha, captcha, isLoading])

  if (isLoading && !captcha) return <BlurredLoader isLoading />

  if (captchaEntered || (!captcha && !isLoading)) {
    return (
      <AuthSignUpCreatePasskey
        onBack={onBack}
        withLogo={withLogo}
        title={title}
        subTitle={subTitle}
        onCreate={onPasskeyCreate}
        isCreating={isPasskeyCreating}
        applicationURL={applicationURL}
      />
    )
  }

  if (captcha)
    return (
      <AuthSignUpCaptcha
        onBack={onBack}
        withLogo={withLogo}
        title={title}
        subTitle={subTitle}
        isLoading={!!isLoading}
        captcha={captcha}
        onContinue={onCaptchaEntered}
        onRetry={getCaptcha}
        applicationURL={applicationURL}
      />
    )

  return null
}
