import React from "react"
import { useForm } from "react-hook-form"

import { ApplicationLogo } from "frontend/design-system/atoms/application-logo"
import { IconButton } from "frontend/design-system/atoms/button/icon-button"
import { SignInWithGoogle } from "frontend/design-system/atoms/button/signin-with-google"
import TouchId from "frontend/design-system/atoms/icons/touch-id.svg"
import { Input } from "frontend/design-system/atoms/input"
import { H5 } from "frontend/design-system/atoms/typography"
import { ScreenResponsive } from "frontend/design-system/templates/screen-responsive"

import { anchorRules } from "frontend/utils/validations"

import QRCode from "./assets/qrcode.svg"
import SecurityKey from "./assets/security-key.svg"

export interface AuthorizeAppUnknownDeviceProps {
  onSelectRemoteAuthorization: () => Promise<void> | void
  onSelectSameDeviceRegistration: () => Promise<void> | void
  onSelectSameDeviceAuthorization: (userNumber: number) => Promise<void> | void
  onSelectSecurityKeyAuthorization: (userNumber: number) => Promise<void> | void
  onToggleAdvancedOptions: () => void
  authError?: string
  isLoading?: boolean
  showAdvancedOptions?: boolean
  applicationName?: string
  applicationLogo?: string
}

export const AuthorizeDecider: React.FC<AuthorizeAppUnknownDeviceProps> = ({
  onSelectRemoteAuthorization,
  onSelectSameDeviceRegistration,
  onSelectSameDeviceAuthorization,
  onSelectSecurityKeyAuthorization,
  onToggleAdvancedOptions,
  applicationName,
  applicationLogo,
  showAdvancedOptions,
  isLoading,
  authError,
}) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<{
    userNumber: number
  }>()

  React.useEffect(() => {
    if (authError && errors.userNumber?.message !== authError) {
      setError("userNumber", { message: authError })
    }
  }, [authError, errors.userNumber, setError])

  const handleSelectSameDeviceAuthorization = React.useCallback(
    async ({ userNumber }) => {
      await onSelectSameDeviceAuthorization(userNumber)
    },
    [onSelectSameDeviceAuthorization],
  )

  const handleSelectSecurityKeyAuthorization = React.useCallback(
    async ({ userNumber }) => {
      await onSelectSecurityKeyAuthorization(userNumber)
    },
    [onSelectSecurityKeyAuthorization],
  )

  return (
    <ScreenResponsive
      className="flex flex-col items-center"
      isLoading={isLoading}
    >
      {applicationLogo && (
        <ApplicationLogo
          src={applicationLogo}
          applicationName={applicationName}
        />
      )}
      <H5>Sign in</H5>
      <p className="mt-3 text-center">
        Choose how you'd like to sign in to {applicationName}
      </p>
      {showAdvancedOptions && (
        <Input
          errorText={errors.userNumber?.message}
          labelText="Your NFID number"
          className="w-full mt-8"
          {...register("userNumber", {
            required: "userNumber is required",
            pattern: {
              value: anchorRules.regex,
              message: anchorRules.errorMessages.pattern,
            },
            minLength: {
              value: anchorRules.minLength,
              message: anchorRules.errorMessages.length,
            },
          })}
        />
      )}

      <SignInWithGoogle
        onLogin={(credential) => console.log(">> ", { credential })}
      />

      <div className="flex flex-col w-full mt-8 space-y-1">
        {showAdvancedOptions ? (
          <>
            <IconButton
              title="Platform auth on this device"
              subtitle="Use this device if previously registered"
              img={<img src={TouchId} alt="touch-id" />}
              onClick={handleSubmit(handleSelectSameDeviceAuthorization)}
            />
            <IconButton
              title="Security key"
              subtitle="Use a previously registered security key"
              img={<img src={SecurityKey} alt="touch-id" />}
              onClick={handleSubmit(handleSelectSecurityKeyAuthorization)}
            />
          </>
        ) : (
          <IconButton
            title="iPhone, iPad, or Android device"
            subtitle="Use passkey from a device with a camera"
            img={<img src={QRCode} alt="qrcode" />}
            onClick={onSelectRemoteAuthorization}
          />
        )}
        <p
          className="pt-4 text-sm text-center cursor-pointer text-blue-base"
          onClick={onToggleAdvancedOptions}
        >
          {showAdvancedOptions ? "Back" : "Other sign in options"}
        </p>
      </div>
    </ScreenResponsive>
  )
}
