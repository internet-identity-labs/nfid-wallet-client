import { AuthAppMeta } from "packages/ui/src/organisms/authentication/app-meta"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { Button, IconCmpActions, IconCmpArrow, Input } from "@nfid-frontend/ui"

import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

export const AuthSignUpCaptcha = ({
  onBack,
  applicationURL,
  onContinue,
  isLoading,
  isCreatingWallet,
  withLogo,
  title,
  subTitle,
  getCaptcha,
  captcha,
  error,
}: {
  onBack: () => void
  applicationURL?: string
  onContinue: (value: string) => void
  isLoading: boolean
  isCreatingWallet?: boolean
  withLogo?: boolean
  title?: string
  subTitle?: string | JSX.Element
  getCaptcha?: () => unknown
  captcha?: string
  error?: string
}) => {
  const { register, handleSubmit, formState, setError, clearErrors } = useForm<{
    captcha: string
  }>()

  useEffect(() => {
    if (!captcha) getCaptcha?.()
  }, [captcha])

  useEffect(() => {
    if (error) {
      setError("captcha", {
        message: error,
      })
    } else {
      clearErrors()
    }
  }, [error])

  if (!captcha) return <BlurredLoader isLoading />

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
            disabled={isCreatingWallet}
            onClick={handleSubmit((data) => onContinue(data.captcha))}
            type="primary"
          >
            Continue
          </Button>
          <Button
            disabled={isLoading}
            icon={<IconCmpActions />}
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
