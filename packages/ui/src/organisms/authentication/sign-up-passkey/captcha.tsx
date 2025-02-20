import { AuthAppMeta } from "packages/ui/src/organisms/authentication/app-meta"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { Button, IconCmpActions, IconCmpArrow, Input } from "@nfid-frontend/ui"

export const AuthSignUpCaptcha = ({
  onBack,
  applicationURL,
  onContinue,
  isLoading,
  isValidating,
  withLogo,
  title,
  subTitle,
  onRetry,
  captcha,
  validateError,
}: {
  onBack: () => void
  applicationURL?: string
  onContinue: (value: string) => void
  isLoading: boolean
  isValidating?: boolean
  withLogo?: boolean
  title?: string
  subTitle?: string | JSX.Element
  onRetry?: () => unknown
  captcha?: string
  validateError?: boolean
}) => {
  const { register, handleSubmit, formState, setError, clearErrors } = useForm<{
    captcha: string
  }>()

  useEffect(() => {
    if (validateError) {
      setError("captcha", {
        message: "Incorrect captcha entered. Please try again.",
      })
    } else {
      clearErrors()
    }
  }, [validateError])

  return (
    <div className="min-h-[536px] flex-grow flex flex-col">
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
            disabled={isValidating}
            onClick={handleSubmit((data) => onContinue(data.captcha))}
            type="primary"
          >
            Continue
          </Button>
          <Button
            disabled={isLoading}
            icon={<IconCmpActions />}
            block
            onClick={onRetry}
            type="ghost"
          >
            Try a different image
          </Button>
        </div>
      </div>
    </div>
  )
}
