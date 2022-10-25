import React from "react"
import { useForm } from "react-hook-form"

import { IconButton } from "frontend/ui/atoms/button/icon-button"
import {
  LoginEventHandler,
  SignInWithGoogle,
} from "frontend/ui/atoms/button/signin-with-google"
import TouchId from "frontend/ui/atoms/icons/touch-id.svg"
import { Input } from "frontend/ui/atoms/input"
import { Separator } from "frontend/ui/atoms/separator"
import { ApplicationMeta } from "frontend/ui/molecules/application-meta"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"
import { anchorRules } from "frontend/ui/utils/validations"

import QRCode from "./assets/qrcode.svg"
import SecurityKey from "./assets/security-key.svg"

export interface AuthorizeAppUnknownDeviceProps {
  onSelectRemoteAuthorization: () => Promise<void> | void
  onSelectSameDeviceAuthorization: (userNumber: number) => Promise<void> | void
  onSelectSecurityKeyAuthorization: (userNumber: number) => Promise<void> | void
  onSelectGoogleAuthorization: LoginEventHandler
  onToggleAdvancedOptions: () => void
  authError?: string
  isLoading?: boolean
  showAdvancedOptions?: boolean
  applicationName?: string
  applicationLogo?: string
}

export const AuthorizeDecider: React.FC<AuthorizeAppUnknownDeviceProps> = ({
  onSelectRemoteAuthorization,
  onSelectSameDeviceAuthorization,
  onSelectSecurityKeyAuthorization,
  onSelectGoogleAuthorization,
  onToggleAdvancedOptions,
  applicationName,
  applicationLogo,
  showAdvancedOptions,
  isLoading,
  authError,
}) => {
  React.useEffect(
    () =>
      console.debug("AuthorizeDecider", {
        applicationName,
        applicationLogo,
        showAdvancedOptions,
        isLoading,
        authError,
      }),
    [
      applicationName,
      applicationLogo,
      showAdvancedOptions,
      isLoading,
      authError,
    ],
  )

  const containerRef = React.useRef<HTMLDivElement | null>(null)
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
    async ({ userNumber }: { userNumber: number }) => {
      await onSelectSameDeviceAuthorization(userNumber)
    },
    [onSelectSameDeviceAuthorization],
  )

  const handleSelectSecurityKeyAuthorization = React.useCallback(
    async ({ userNumber }: { userNumber: number }) => {
      await onSelectSecurityKeyAuthorization(userNumber)
    },
    [onSelectSecurityKeyAuthorization],
  )

  return (
    <BlurredLoader isLoading={isLoading}>
      <ApplicationMeta
        applicationName={applicationName}
        applicationLogo={applicationLogo}
        title="Sign in"
        subTitle={`Choose how you'd like to sign in to ${applicationName}`}
      />
      <div
        className="flex flex-col items-center w-full mt-8 space-y-1"
        ref={containerRef}
      >
        {showAdvancedOptions && (
          <div className="w-full max-w-[400px]">
            <Input
              errorText={errors.userNumber?.message}
              labelText="Your NFID number"
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
          </div>
        )}
        {!showAdvancedOptions ? (
          <div className="w-full max-w-[400px]">
            <SignInWithGoogle onLogin={onSelectGoogleAuthorization} />
            <Separator />

            <IconButton
              title="iPhone, iPad, or Android device"
              subtitle="Use passkey from a device with a camera"
              img={<img src={QRCode} alt="qrcode" />}
              onClick={onSelectRemoteAuthorization}
            />
          </div>
        ) : (
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
        )}

        <p
          className="py-4 text-sm text-center cursor-pointer text-blue-base"
          onClick={onToggleAdvancedOptions}
        >
          {showAdvancedOptions ? "Back" : "Other sign in options"}
        </p>
      </div>
    </BlurredLoader>
  )
}
