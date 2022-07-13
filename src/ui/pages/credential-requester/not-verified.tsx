import clsx from "clsx"
import React from "react"
import { useForm } from "react-hook-form"

import { Button, P } from "@internet-identity-labs/nfid-sdk-react"

import { Input } from "frontend/ui/atoms/input"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"
import { phoneRules } from "frontend/ui/utils/validations"

interface CredentialRequesterNotVerifiedProps {
  children?: React.ReactNode
  applicationLogo?: string
  applicationName?: string
  onSubmit: (values: { phone: string }) => void
}

export const CredentialRequesterNotVerified: React.FC<
  CredentialRequesterNotVerifiedProps
> = ({ children, applicationLogo, applicationName, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
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
            errorText={errors.phone?.message}
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
        <Button
          primary
          className="px-10 sm:mt-2"
          block
          onClick={handleSubmit(onSubmit)}
        >
          Verify phone number
        </Button>
      </form>
    </ScreenResponsive>
  )
}
