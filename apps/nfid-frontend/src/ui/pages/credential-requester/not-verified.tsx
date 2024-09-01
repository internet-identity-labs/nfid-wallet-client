import clsx from "clsx"
import { ButtonAlt } from "packages/ui/src/atoms/button"
import React from "react"
import { useForm } from "react-hook-form"

import { Input, phoneRules, SDKApplicationMeta } from "@nfid-frontend/ui"

import { P } from "frontend/ui/atoms/typography/paragraph"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

interface CredentialRequesterNotVerifiedProps {
  children?: React.ReactNode
  applicationLogo?: string
  applicationName?: string
  onSubmit: (values: { phone: string }) => void
  isLoading?: boolean
  loadingMessage?: string
  error?: string
  phoneNumber?: string
}

export const CredentialRequesterNotVerified: React.FC<
  CredentialRequesterNotVerifiedProps
> = ({
  applicationLogo,
  applicationName,
  onSubmit,
  isLoading,
  loadingMessage,
  error,
  phoneNumber,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    mode: "all",
    defaultValues: {
      phone: phoneNumber || "",
    },
  })

  return (
    <BlurredLoader loadingMessage={loadingMessage} isLoading={isLoading}>
      <SDKApplicationMeta
        applicationName={applicationName}
        applicationLogo={applicationLogo}
        title={"Verification request"}
        subTitle={`to continue to ${applicationName ?? "the application"}`}
      />
      <P className="text-sm mt-7">
        This application is requesting you verify a non-VOIP phone number with
        NFID to continue.
      </P>
      <P className="mt-2 text-sm">
        To register it with your existing Internet Identity anchor please see
        these{" "}
        <a
          className="transition-opacity cursor-pointer text-blue hover:opacity-75"
          href="https://docs.nfid.one/sign-in-with-ii-and-nfid"
          target="_blank"
          rel="noreferrer"
        >
          instructions
        </a>
        .
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
            errorText={error || errors.phone?.message}
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
        <ButtonAlt
          primary
          className="px-10 sm:mt-2"
          block
          onClick={handleSubmit(onSubmit)}
          disabled={!isDirty || !!errors.phone}
        >
          Verify phone number
        </ButtonAlt>
      </form>
    </BlurredLoader>
  )
}
