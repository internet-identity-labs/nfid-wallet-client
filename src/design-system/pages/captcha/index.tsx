import clsx from "clsx"
import React from "react"
import { useForm } from "react-hook-form"

import { Button, Input } from "@internet-identity-labs/nfid-sdk-react"

import { ApplicationLogo } from "frontend/design-system/atoms/application-logo"
import { H5 } from "frontend/design-system/atoms/typography"
import { Challenge } from "frontend/design-system/molecules/challenge"
import { ScreenResponsive } from "frontend/design-system/templates/screen-responsive"

import { ElementProps } from "frontend/types/react"
import { captchaRules } from "frontend/utils/validations"

interface CaptchaProps extends ElementProps<HTMLDivElement> {
  successPath?: string
  applicationName?: string
  applicationLogo?: string
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
          secondary
          className="mt-4"
          block
          disabled={!isFormComplete || isLoading}
          onClick={handleSubmit(onRegisterAnchor)}
        >
          Create NFID
        </Button>
        <p className="py-6 text-sm text-center">
          Already have an account?{" "}
          {/* <a href="#" className="text-blue-base">
            Sign in
          </a> */}
        </p>
      </form>
    </ScreenResponsive>
  )
}
