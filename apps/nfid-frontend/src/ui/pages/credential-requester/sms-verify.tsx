import clsx from "clsx"
import React from "react"

import { Button, SDKApplicationMeta } from "@nfid-frontend/ui"

import { StepInput } from "frontend/ui/atoms/step-input"
import { P } from "frontend/ui/atoms/typography/paragraph"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"
import { useTimer } from "frontend/ui/utils/use-timer"

interface CredentialRequesterSMSVerifyProps {
  applicationLogo?: string
  applicationName?: string
  onSubmit: (value: string) => Promise<void>
  onResendCode: () => void
  phone?: string | number
  responseError?: string
  onChangePhone: () => void
  isLoading?: boolean
  loadingMessage?: string
}

export const CredentialRequesterSMSVerify: React.FC<
  CredentialRequesterSMSVerifyProps
> = ({
  applicationLogo,
  applicationName,
  onResendCode,
  phone,
  onSubmit,
  responseError,
  onChangePhone,
  isLoading,
  loadingMessage,
}) => {
  const { counter, setCounter } = useTimer({ defaultCounter: 3 })

  const handleResend = () => {
    onResendCode && onResendCode()
    setCounter(60)
  }

  return (
    <BlurredLoader isLoading={isLoading} loadingMessage={loadingMessage}>
      <SDKApplicationMeta
        applicationLogo={applicationLogo}
        applicationName={applicationName}
        title="SMS verification"
      />
      <div
        className={clsx(
          "mt-5 flex flex-col justify-between flex-1",
          "sm:block",
        )}
      >
        <div className="mt-3 text-sm sm:mt-14">
          Please enter the verification code that was sent to {phone}.
          <br />
          {counter > 0 ? (
            <P className="mt-3">Code can be resent in {counter} sec</P>
          ) : (
            <P className="mt-3">
              Didn’t receive a code?{" "}
              <span className="cursor-pointer text-blue" onClick={handleResend}>
                Resend
              </span>
            </P>
          )}
        </div>
        <StepInput
          className="justify-between"
          onSubmit={onSubmit}
          errorClasses="text-center"
          buttonText="Verify phone number"
          responseError={responseError}
          buttonClassName="w-full"
        />
        <Button
          text
          onClick={onChangePhone}
          className="w-full mt-4 mb-8 text-sm text-center cursor-pointer text-blue hover:text-blue-hover"
        >
          Change phone number
        </Button>
      </div>
    </BlurredLoader>
  )
}
