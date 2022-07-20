import { useCallback, useReducer, useEffect } from "react"
import { useForm } from "react-hook-form"

import { H5 } from "@internet-identity-labs/nfid-sdk-react"

import { ApplicationLogo } from "frontend/design-system/atoms/application-logo"
import { IconButton } from "frontend/design-system/atoms/button/icon-button"
import {
  LoginEventHandler,
  SignInWithGoogle,
} from "frontend/design-system/atoms/button/signin-with-google"
import TouchId from "frontend/design-system/atoms/icons/touch-id.svg"
import { Input } from "frontend/design-system/atoms/input"
import { Separator } from "frontend/design-system/atoms/separator"
import { ScreenResponsive } from "frontend/design-system/templates/screen-responsive"

import { anchorRules } from "frontend/utils/validations"

import SecurityKey from "./assets/security-key.svg"

import "./index.css"

interface RegisterAccountIntroProps {
  onRegister: () => void
  onSelectGoogleAuthorization: LoginEventHandler
  onSelectSecurityKeyAuthorization: (userNumber: number) => Promise<void> | void
  onSelectSameDeviceAuthorization: (userNumber: number) => Promise<void> | void
  applicationName?: string
  applicationLogo?: string
  isLoading: boolean
  authError?: string
}

export const RegisterAccountIntro: React.FC<RegisterAccountIntroProps> = ({
  onRegister,
  onSelectGoogleAuthorization,
  onSelectSecurityKeyAuthorization,
  onSelectSameDeviceAuthorization,
  applicationName = "this application",
  applicationLogo,
  isLoading,
  authError,
}) => {
  const [showAdvancedOptions, toggleAdvancedOptions] = useReducer(
    (state) => !state,
    false,
  )

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<{
    userNumber: number
  }>()

  useEffect(() => {
    if (authError && errors.userNumber?.message !== authError) {
      setError("userNumber", { message: authError })
    }
  }, [authError, errors.userNumber, setError])

  const handleSelectSecurityKeyAuthorization = useCallback(
    async ({ userNumber }) => {
      await onSelectSecurityKeyAuthorization(userNumber)
    },
    [onSelectSecurityKeyAuthorization],
  )

  const handleSelectSameDeviceAuthorization = useCallback(
    async ({ userNumber }) => {
      await onSelectSameDeviceAuthorization(userNumber)
    },
    [onSelectSameDeviceAuthorization],
  )

  return (
    <ScreenResponsive
      className="flex flex-col items-center"
      isLoading={isLoading}
    >
      {applicationLogo && (
        <ApplicationLogo
          src={applicationLogo}
          appliactionName={applicationName}
        />
      )}
      <H5>Sign in</H5>
      <p className="mt-3 text-center">
        Choose how you'd like to sign in to {applicationName}
      </p>
      <div className="flex flex-col w-full mt-8 space-y-1">
        {!showAdvancedOptions ? (
          <>
            <SignInWithGoogle onLogin={onSelectGoogleAuthorization} />
            <Separator className="max-w-[400px]" />

            <IconButton
              title="Create a new NFID"
              subtitle="Use passkey on this device"
              img={<img src={TouchId} alt="passkey" />}
              onClick={onRegister}
            />
          </>
        ) : (
          <>
            <Input
              errorText={errors.userNumber?.message}
              labelText="Your NFID number"
              className="w-full my-4"
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
        )}

        <p
          className="py-4 text-sm text-center cursor-pointer text-blue-base"
          onClick={toggleAdvancedOptions}
        >
          {showAdvancedOptions ? "Back" : "Other sign in options"}
        </p>
      </div>
    </ScreenResponsive>
  )
}
