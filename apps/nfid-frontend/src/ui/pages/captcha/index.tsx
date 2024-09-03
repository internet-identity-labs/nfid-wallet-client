import React from "react"
import { useForm } from "react-hook-form"

import {
  Button,
  captchaRules,
  Input,
  SDKApplicationMeta,
} from "@nfid-frontend/ui"

import { ElementProps } from "frontend/types/react"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"
import { Challenge } from "frontend/ui/molecules/challenge"

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
      onRequestNewCaptcha()
    }
  }, [errorString, onRequestNewCaptcha, setError, setValue])

  const isFormComplete = !!dirtyFields.captcha

  return (
    <BlurredLoader isLoading={isLoading} loadingMessage={loadingMessage}>
      <SDKApplicationMeta
        applicationName={applicationName}
        applicationLogo={applicationLogo}
        title="Complete NFID registration"
        subTitle={`to continue ${applicationName && `to ${applicationName}`}`}
      />
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
          disabled={isChallengeLoading}
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
          className="mt-4 mb-6"
          block
          disabled={!isFormComplete || isLoading}
          onClick={handleSubmit(onRegisterAnchor)}
        >
          Create NFID
        </Button>
      </form>
    </BlurredLoader>
  )
}
