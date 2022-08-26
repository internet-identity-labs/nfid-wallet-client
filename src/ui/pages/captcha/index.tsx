import clsx from "clsx"
import React from "react"
import { useForm } from "react-hook-form"

import { ElementProps } from "frontend/types/react"
import { ApplicationLogo } from "frontend/ui/atoms/application-logo"
import { Button } from "frontend/ui/atoms/button"
import { Input } from "frontend/ui/atoms/input"
import { H5 } from "frontend/ui/atoms/typography"
import { Challenge } from "frontend/ui/molecules/challenge"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"
import { captchaRules } from "frontend/ui/utils/validations"

interface CaptchaProps extends ElementProps<HTMLDivElement> {
  successPath?: string
  applicationName?: string
  applicationLogo?: string
  loadingMessage?: string
  isLoading?: boolean
  isChallengeLoading?: boolean
  challengeBase64?: string
  errorString?: string
  onRegisterAnchor: ({ captcha }: { captcha: string }) => Promise<any>
  onRequestNewCaptcha: () => void
}

export const Captcha: React.FC<CaptchaProps> = ({
  className,
  challengeBase64,
  applicationName,
  applicationLogo,
  loadingMessage,
  isLoading,
  isChallengeLoading,
  onRequestNewCaptcha,
  onRegisterAnchor,
  errorString,
}) => {
  const {
    register,
    formState: { errors, dirtyFields },
    handleSubmit,
    setError,
    setValue,
  } = useForm<{ captcha: string }>()

  React.useEffect(() => {
    if (errorString) {
      setValue("captcha", "")
      setError("captcha", {
        type: "manual",
        message: errorString,
      })
    }
  }, [errorString, setError, setValue])

  const isFormComplete = !!dirtyFields.captcha

  return (
    <ScreenResponsive
      className={clsx("flex flex-col items-center", className)}
      isLoading={isLoading}
      loadingMessage={loadingMessage}
    >
      {applicationLogo && (
        <ApplicationLogo
          src={applicationLogo}
          applicationName={applicationName}
        />
      )}
      <H5>Complete NFID registration</H5>
      <p className="mt-1 text-center">
        to continue {applicationName && `to ${applicationName}`}
      </p>
      <form className="flex flex-col w-full mt-5">
        <Challenge
          isLoading={isChallengeLoading}
          src={challengeBase64 && `data:image/png;base64,${challengeBase64}`}
          refresh={onRequestNewCaptcha}
        />
        <Input
          id="enter-captcha"
          autoFocus
          placeholder="Enter characters"
          errorText={errors.captcha?.message}
          {...register("captcha", {
            required: captchaRules.errorMessages.required,
            minLength: {
              value: captchaRules.minLength,
              message: captchaRules.errorMessages.length,
            },
            maxLength: {
              value: captchaRules.maxLength,
              message: captchaRules.errorMessages.length,
            },
            pattern: {
              value: captchaRules.regex,
              message: captchaRules.errorMessages.pattern,
            },
          })}
        />
        <Button
          id="create-nfid"
          secondary
          className="mt-4 mb-6"
          block
          disabled={!isFormComplete || isLoading}
          onClick={handleSubmit(onRegisterAnchor)}
        >
          Create NFID
        </Button>
      </form>
    </ScreenResponsive>
  )
}
