import clsx from "clsx"
import React from "react"

import { P } from "@internet-identity-labs/nfid-sdk-react"

import { StepInput } from "frontend/design-system/atoms/step-input"
import { ScreenResponsive } from "frontend/design-system/templates/screen-responsive"

import { useTimer } from "frontend/hooks/use-timer"

interface CredentialRequesterSMSVerifyProps {
  applicationLogo?: string
  applicationName?: string
  onSubmit: (value: string) => boolean
  onResendCode: () => void
  phone?: string | number
}

export const CredentialRequesterSMSVerify: React.FC<
  CredentialRequesterSMSVerifyProps
> = ({ applicationLogo, applicationName, onResendCode, phone, onSubmit }) => {
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
      <P className="mt-3 text-sm sm:mt-14">
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
      </P>
      <div
        className={clsx(
          "mt-5 flex flex-col justify-between flex-1",
          "sm:block",
        )}
      >
        <StepInput className="justify-between" onSubmit={onSubmit} />
      </div>
    </ScreenResponsive>
  )
}
