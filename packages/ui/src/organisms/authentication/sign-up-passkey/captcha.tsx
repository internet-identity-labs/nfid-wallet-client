import { AuthAppMeta } from "packages/ui/src/organisms/authentication/app-meta"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { Button, IconCmpActions, IconCmpArrow, Input } from "@nfid-frontend/ui"

export const AuthSignUpCaptcha = ({
  onBack,
  applicationURL,
  onContinue,
  isCreatingWallet,
  withLogo,
  title,
  subTitle,
  getCaptcha,
  captcha,
  captchaLoading,
  error
}: {
  onBack: () => void
  applicationURL?: string
  onContinue: (value: string) => void
  isCreatingWallet?: boolean
  withLogo?: boolean
  title?: string
  subTitle?: string | JSX.Element
  getCaptcha?: () => unknown
  captchaLoading?: boolean
  captcha: string
  error?: string
}) => {
  const { register, handleSubmit, formState, setError, clearErrors } = useForm<{
    captcha: string
  }>()

  useEffect(() => {
    if (error) {
      setError("captcha", {
        message: error,
      })
    }
  }, [error])

  return (
    <div className="h-full flex-grow flex flex-col">
      <IconCmpArrow
        className="absolute w-6 transition-opacity cursor-pointer hover:opacity-50 shrink-0 top-5 left-5"
        onClick={onBack}
      />
      <AuthAppMeta
        applicationURL={applicationURL}
        withLogo={withLogo}
        title={title}
        subTitle={subTitle}
      />
      <div className="flex flex-col flex-1">
        <img
          className="my-auto"
          src={"data:image/png;base64," + captcha}
          alt="captcha"
        />
        <div className="mt-auto">
          <Input
            placeholder="Enter the characters you see above"
            className="mb-[10px]"
            errorText={formState.errors.captcha?.message}
            {...register("captcha", { required: "This field is required" })}
          />
          <Button
            className="mt-auto mb-[10px]"
            block
            disabled={isCreatingWallet}
            onClick={handleSubmit((data) => {
              onContinue(data.captcha)
            })}
            type="primary"
          >
            Continue
          </Button>
          <Button
            disabled={!!captchaLoading}
            icon={
              <IconCmpActions
                className={captchaLoading ? "animate-spin" : undefined}
              />
            }
            block
            onClick={getCaptcha}
            type="ghost"
          >
            Try a different image
          </Button>
        </div>
      </div>
    </div>
  )
}
