import { useState } from "react"

import { AuthSignUpCaptcha } from "./captcha"
import { AuthSignUpCreatePasskey } from "./create-passkey"

export function AuthSignUpPassKey({
  getCaptcha,
  onPasskeyCreate,
  isPasskeyCreating,
  applicationURL,
  captcha,
  isCaptchaLoading,
  onBack,
  withLogo,
  title,
  subTitle,
  createPasskeyError
}: {
  getCaptcha: () => unknown
  onPasskeyCreate: (walletName: string, captchaVal: string) => unknown
  isPasskeyCreating?: boolean
  createPasskeyError?: string
  applicationURL?: string
  isCaptchaLoading?: boolean
  captcha?: string
  onBack: () => unknown
  withLogo?: boolean
  title?: string
  subTitle?: string
}) {
  const [walletName, setWalletName] = useState("")

  if (walletName)
    return (
      <AuthSignUpCaptcha
        onBack={onBack}
        withLogo={withLogo}
        title={title}
        subTitle={subTitle}
        captcha={captcha}
        onContinue={(val) => {
          onPasskeyCreate(walletName, val)
        }}
        getCaptcha={getCaptcha}
        applicationURL={applicationURL}
        isLoading={!!isCaptchaLoading}
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
      onCreate={setWalletName}
      isCreating={isPasskeyCreating}
      applicationURL={applicationURL}
    />
  )
}
