import clsx from "clsx"
import ProfileContainer from "@nfid/ui/atoms/profile-container/Container"
import React from "react"

import { StepInput } from "@nfid/ui/atoms/step-input"
import { P } from "@nfid/ui/atoms/typography/paragraph"
import ProfileTemplate from "@nfid/ui/templates/profile-template/Template"
import { useTimer } from "@nfid/ui/utils/use-timer"

interface IProfileAddPhoneSMS {
  onResendCode: () => void
  onSubmit: (token: string) => Promise<void>
  responseError?: string
  resetResponseError?: () => void
  isLoading: boolean
  phone: string | number
  resendDelay?: number
}

const ProfileAddPhoneSMS: React.FC<IProfileAddPhoneSMS> = ({
  onResendCode,
  onSubmit,
  responseError,
  resetResponseError,
  isLoading,
  phone,
  resendDelay = 60,
}) => {
  const { counter, setCounter } = useTimer({ defaultCounter: resendDelay })

  const handleResend = () => {
    onResendCode?.()
    setCounter(resendDelay)
  }

  return (
    <ProfileTemplate
      pageTitle="SMS verification"
      isLoading={isLoading}
      showBackButton
    >
      <ProfileContainer>
        <div className="text-sm">
          <P>Please enter the verification code that was sent to {phone}.</P>
          <P className="mt-3">
            {counter > 0 ? (
              `Code can be resent in ${counter} sec`
            ) : (
              <>
                Didn't receive a code?{" "}
                <span
                  className="cursor-pointer text-blue"
                  onClick={handleResend}
                >
                  Resend
                </span>
              </>
            )}
          </P>
        </div>
        <div
          className={clsx(
            "mt-5 flex flex-col justify-between flex-1",
            "sm:block",
          )}
        >
          <StepInput
            onSubmit={onSubmit}
            buttonText="Complete"
            responseError={responseError}
            resetResponseError={resetResponseError}
          />
        </div>
      </ProfileContainer>
    </ProfileTemplate>
  )
}

export default ProfileAddPhoneSMS
