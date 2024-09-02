import { IconButton } from "packages/ui/src/atoms/button/icon-button"
import {
  LoginEventHandler,
  SignInWithGoogle,
} from "packages/ui/src/atoms/button/signin-with-google"
import React from "react"
import { useForm } from "react-hook-form"

import { anchorRules, Input, SDKApplicationMeta } from "@nfid-frontend/ui"

import IIIcon from "frontend/assets/dfinity.svg"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import { ReactComponent as QRCode } from "./assets/qrcode.svg"
import { ReactComponent as SecurityKey } from "./assets/security-key.svg"
import { ReactComponent as TouchId } from "./assets/touch-id.svg"

import "./wallet-connect.css"

export interface AuthorizeAppUnknownDeviceProps {
  onSelectRemoteAuthorization: () => Promise<void> | void
  onSelectSameDeviceAuthorization: (userNumber: number) => Promise<void> | void
  onSelectSecurityKeyAuthorization: (userNumber: number) => Promise<void> | void
  onSelectIIAuthorization: () => void
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
  onSelectIIAuthorization,
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
    <BlurredLoader isLoading={isLoading} className="flex flex-col">
      <SDKApplicationMeta
        applicationName={applicationName}
        applicationLogo={applicationLogo}
        title="Create an NFID"
        subTitle={
          showAdvancedOptions
            ? `Sign in to ${applicationName} with your Passkey`
            : `to continue to ${applicationName ?? "the application"}`
        }
      />

      <div className="flex items-center flex-1 w-full mt-8">
        <div className="flex flex-col items-center w-full" ref={containerRef}>
          {showAdvancedOptions && (
            <div className="w-full">
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

              <div className="grid h-12 grid-cols-3 gap-4 my-2.5">
                <IconButton
                  img={<img src={IIIcon} alt="ii" />}
                  onClick={onSelectIIAuthorization}
                  className="flex justify-center"
                />
              </div>

              <IconButton
                title="iPhone, iPad, or Android device"
                subtitle="Use Passkey from a device with a camera"
                img={<QRCode />}
                onClick={onSelectRemoteAuthorization}
              />
            </div>
          ) : (
            <div className="space-y-2.5 mt-7 w-full">
              <IconButton
                title="Platform auth on this device"
                subtitle="Use this device if previously registered"
                img={<TouchId />}
                onClick={handleSubmit(handleSelectSameDeviceAuthorization)}
              />
              <IconButton
                title="Security key"
                subtitle="Use a previously registered security key"
                img={<SecurityKey />}
                onClick={handleSubmit(handleSelectSecurityKeyAuthorization)}
              />
            </div>
          )}

          <p
            className="py-4 text-sm text-center cursor-pointer text-linkColor"
            onClick={onToggleAdvancedOptions}
          >
            {showAdvancedOptions ? "Back" : "Other sign in options"}
          </p>
        </div>
      </div>
    </BlurredLoader>
  )
}
