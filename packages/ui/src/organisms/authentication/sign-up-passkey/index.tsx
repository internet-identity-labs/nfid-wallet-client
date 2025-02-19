import { IconCmpArrow } from "packages/ui/src/atoms/icons"
import { useEffect } from "react"

import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import { AuthAppMeta } from "../app-meta"
import { AuthSignUpCaptcha } from "./captcha"
import { AuthSignUpCreatePasskey } from "./create-passkey"

export function AuthSignUpPassKey({
  getAnchor,
  validateCaptcha,
  onPasskeyCreate,
  isPasskeyCreating,
  applicationURL,
  anchor,
  captcha,
  captchaIsValid,
  captchaIsValidating,
  isLoading,
  onBack,
  withLogo,
  title,
  subTitle,
  createPasskeyError
}: {
  getAnchor: () => unknown
  onPasskeyCreate: (walletName: string) => unknown
  isPasskeyCreating?: boolean
  createPasskeyError?: string
  applicationURL?: string
  isLoading?: boolean
  captcha?: string
  captchaIsValid?: boolean
  captchaIsValidating?: boolean
  anchor?: string
  onBack: () => unknown
  withLogo?: boolean
  title?: string
  subTitle?: string
  validateCaptcha: (value: string) => unknown
}) {
  useEffect(() => {
    if (!anchor) {
      getAnchor()
    }
  }, [getAnchor, anchor])

  if (isLoading && !captcha) return <BlurredLoader className="min-h-[536px]" isLoading />

  if (captchaIsValid) {
    return (
      <AuthSignUpCreatePasskey
        onBack={onBack}
        withLogo={withLogo}
        title={title}
        subTitle={subTitle}
        onCreate={onPasskeyCreate}
        isCreating={isPasskeyCreating}
        error={createPasskeyError}
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
        onContinue={validateCaptcha}
        onRetry={getAnchor}
        validateError={!!(captchaIsValid && captchaIsValid !== undefined)}
        isValidating={captchaIsValidating}
        applicationURL={applicationURL}
      />
    )

  return null
}
