import clsx from "clsx"
import React from "react"

import { P } from "@internet-identity-labs/nfid-sdk-react"

import { Button } from "frontend/ui/atoms/button"
import { StepInput } from "frontend/ui/atoms/step-input"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"
import { useTimer } from "frontend/ui/utils/use-timer"

interface CredentialRequesterSMSVerifyProps {
  applicationLogo?: string
  applicationName?: string
  onSubmit: (value: string) => Promise<void>
  onResendCode: () => void
  phone?: string | number
  responseError?: string
  onChangePhone: () => void
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
}) => {
  const { counter, setCounter } = useTimer({ defaultCounter: 3 })

  const handleResend = () => {
    onResendCode && onResendCode()
    setCounter(60)
  }

  return (
    <ScreenResponsive
      applicationLogo={applicationLogo}
      applicationName={applicationName}
      title="SMS verification"
      subTitle={`to continue to ${applicationName}`}
    >
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
              <span
                className="cursor-pointer text-blue-base"
                onClick={handleResend}
              >
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
        />
        <Button
          text
          onClick={onChangePhone}
          className="w-full mt-4 mb-8 text-sm text-center cursor-pointer text-blue-base hover:text-blue-hover"
        >
          Change phone number
        </Button>
      </div>
    </ScreenResponsive>
  )
}
