import clsx from "clsx"
import React from "react"
import { useForm } from "react-hook-form"

import { Button, P } from "@internet-identity-labs/nfid-sdk-react"

import { Input } from "frontend/design-system/atoms/input"
import { ScreenResponsive } from "frontend/design-system/templates/screen-responsive"

import { phoneRules } from "frontend/utils/validations"

interface CredentialRequesterNotVerifiedProps {
  applicationLogo?: string
  applicationName?: string
  onSubmit: (values: { phone: string }) => void
  onSkip: () => void
}

export const CredentialRequesterNotVerified: React.FC<
  CredentialRequesterNotVerifiedProps
> = ({ children, applicationLogo, applicationName, onSubmit, onSkip }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      phone: "",
    },
  })
  return (
    <ScreenResponsive
      applicationLogo={applicationLogo}
      applicationName={applicationName}
      title="Verification request"
      subTitle={`to continue to ${applicationName}`}
    >
      <P className="text-sm mt-7">
        You haven't yet verified your phone number. Would you like to do it now?
        Your phone number is never shared with anyone and only accessible to
        you.
      </P>
      <form
        className={clsx(
          "mt-6 flex flex-col justify-between flex-1",
          "sm:block",
        )}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-2">
          <Input
            type="text"
            labelText="Phone number"
            placeholder="+XX XXX XXX XX XX"
            {...register("phone", {
              required: phoneRules.errorMessages.required,
              pattern: {
                value: phoneRules.regex,
                message: phoneRules.errorMessages.pattern,
              },
              minLength: {
                value: phoneRules.minLength,
                message: phoneRules.errorMessages.length,
              },
              maxLength: {
                value: phoneRules.maxLength,
                message: phoneRules.errorMessages.length,
              },
            })}
          />
        </div>
        <Button primary className="px-10 sm:mt-2" block>
          Verify phone number
        </Button>
      </form>
      <p
        className="my-6 text-sm text-center cursor-pointer text-blue-base"
        onClick={onSkip}
      >
        Skip for now
      </p>
    </ScreenResponsive>
  )
}
