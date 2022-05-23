import {
  Card,
  CardBody,
  H2,
  P,
  Button,
  RefreshIcon,
  Input,
  Loader,
} from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { useForm } from "react-hook-form"

import { Challenge } from "frontend/design-system/molecules/challenge"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useDeviceInfo } from "frontend/hooks/use-device-info"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { captchaRules } from "frontend/utils/validations"

import { useCaptcha } from "./hook"

interface CaptchaProps {
  successPath: string
}

export const Captcha: React.FC<CaptchaProps> = ({ successPath }) => {
  const { navigate } = useNFIDNavigate()
  const { isMobile } = useDeviceInfo()
  const {
    register,
    formState: { errors, dirtyFields },
    handleSubmit,
    setError,
    setValue,
  } = useForm({
    mode: "onTouched",
  })

  const {
    account,
    loading,
    setLoading,
    challenge,
    requestCaptcha,
    recoveryPhrase,
    registerAnchor,
  } = useCaptcha({
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

  const isFormComplete = ["captcha"].every((field) => dirtyFields[field])

  React.useEffect(() => {
    if (account && recoveryPhrase) {
      navigate(successPath, {
        state: {
          recoveryPhrase,
        },
      })
    }
  }, [account, navigate, recoveryPhrase, successPath])
  return (
    <AppScreen isFocused>
      <main className={clsx("flex flex-1 overflow-hidden")}>
        <div className="container px-6 py-0 mx-auto sm:py-4">
          <Card
            className={`grid grid-cols-12 lg:mt-[56px] ${
              isMobile ? `mobile` : ``
            }`}
          >
            <CardBody className="col-span-12 py-0 md:col-span-9 lg:col-span-6 xl:col-span-5 sm:py-6">
              <H2 className="my-4 leading-10">Captcha protected</H2>

              <P>Type the characters you see in the image.</P>

              <div>
                <Challenge
                  src={
                    challenge && `data:image/png;base64,${challenge.png_base64}`
                  }
                />

                <Button
                  text
                  className="flex items-center space-x-2 !my-1 ml-auto"
                  disabled={loading || !challenge}
                  onClick={requestCaptcha}
                >
                  <RefreshIcon />
                  <span>Try a different image</span>
                </Button>

                <Input
                  errorText={errors.captcha?.message}
                  placeholder="Captcha"
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
              </div>

              <div className="my-3">
                <Button
                  large
                  block
                  secondary
                  disabled={!isFormComplete || loading}
                  onClick={handleSubmit(registerAnchor)}
                  data-captcha-key={challenge?.challenge_key}
                >
                  <span>Verify</span>
                </Button>
                <Loader isLoading={loading} />
              </div>
            </CardBody>
          </Card>
        </div>
      </main>
    </AppScreen>
  )
}
