import clsx from "clsx"
import React from "react"
import { useForm } from "react-hook-form"

import { Button, Input } from "@internet-identity-labs/nfid-sdk-react"

import { H5 } from "frontend/design-system/atoms/typography"
import { Challenge } from "frontend/design-system/molecules/challenge"
import { ScreenResponsive } from "frontend/design-system/templates/screen-responsive"

import { ProfileConstants } from "frontend/flows/screens-app/profile/routes"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAuthorization } from "frontend/hooks/use-authorization"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { ElementProps } from "frontend/types/react"
import { captchaRules } from "frontend/utils/validations"

import { useUnknownDeviceConfig } from "../remote-authorize-app-unknown-device/hooks/use-unknown-device.config"
import { useCaptcha } from "./hook"

interface CaptchaProps extends ElementProps<HTMLDivElement> {
  successPath?: string
}

export const Captcha: React.FC<CaptchaProps> = ({
  className,
  successPath = `${ProfileConstants.base}`,
}) => {
  const { scope } = useUnknownDeviceConfig()
  const {
    register,
    formState: { errors, dirtyFields },
    handleSubmit,
    setError,
    setValue,
  } = useForm({
    mode: "onTouched",
  })

  const isFormComplete = ["captcha"].every((field) => dirtyFields[field])

  const { setLoading, loading, challenge, requestCaptcha, registerAnchor } =
    useCaptcha({
      onApiError: async () => {
        setLoading(false)
      },
      onBadChallenge: async () => {
        setValue("captcha", "")
        await requestCaptcha()
        setLoading(false)
        setError("captcha", {
          type: "manual",
          message: "Wrong captcha! Please try again",
        })
      },
    })

  const { navigate } = useNFIDNavigate()

  const { userNumber } = useAccount()

  const { isAuthenticated } = useAuthentication()
  const { authorizeApp } = useAuthorization({
    userNumber,
  })

  const { nextPersonaId, createPersona } = usePersona()

  const handleAuthorizePersona = React.useCallback(async () => {
    setLoading(true)
    console.log(">> handleAuthorizePersona", { scope })

    const response = await createPersona({ domain: scope })

    if (response?.status_code === 200) {
      await authorizeApp({ persona_id: nextPersonaId, domain: scope })
      navigate(successPath)
      setLoading(false)
    }
    console.error(response)
  }, [
    authorizeApp,
    createPersona,
    navigate,
    nextPersonaId,
    scope,
    setLoading,
    successPath,
  ])

  const onSubmit = React.useCallback(
    async (form: any) => {
      const result = await registerAnchor(form)
      if (result.kind === "loginSuccess") {
      }
      console.log(">> onSubmit", { result })
    },
    [registerAnchor],
  )

  React.useEffect(() => {
    if (isAuthenticated && userNumber) {
      handleAuthorizePersona()
    }
  }, [handleAuthorizePersona, isAuthenticated, userNumber])

  const { applicationLogo, applicationName } = useMultipass()

  return (
    <ScreenResponsive
      className={clsx("flex flex-col items-center", className)}
      isLoading={loading}
    >
      {applicationLogo && <img src={applicationLogo} alt="logo" />}
      <H5 className="mt-4">Complete NFID registration</H5>
      <p className="mt-1 text-center">
        to continue {applicationName && `to ${applicationName}`}
      </p>
      <form className="flex flex-col w-full mt-5">
        <Challenge
          src={challenge && `data:image/png;base64,${challenge.png_base64}`}
          refresh={async () => {
            setValue("captcha", "")
            await requestCaptcha()
            setLoading(false)
          }}
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
          disabled={!isFormComplete || loading}
          onClick={handleSubmit(onSubmit)}
          data-captcha-key={challenge?.challenge_key}
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
