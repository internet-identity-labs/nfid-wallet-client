import { useCallback, useEffect } from "react"
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

import SecurityKey from "./assets/security-key.svg"

interface RegisterAccountIntroProps {
  onRegister: () => void
  onSelectGoogleAuthorization: LoginEventHandler
  onSelectSecurityKeyAuthorization: (userNumber: number) => Promise<void> | void
  onSelectSameDeviceAuthorization: (userNumber: number) => Promise<void> | void
  onToggleAdvancedOptions: () => void
  showAdvancedOptions?: Boolean
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
  onToggleAdvancedOptions,
  showAdvancedOptions,
  applicationName = "this application",
  applicationLogo,
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

  useEffect(() => {
    if (authError && errors.userNumber?.message !== authError) {
      setError("userNumber", { message: authError })
    }
  }, [authError, errors.userNumber, setError])

  const handleSelectSecurityKeyAuthorization = useCallback(
    async ({ userNumber }: { userNumber: number }) => {
      await onSelectSecurityKeyAuthorization(userNumber)
    },
    [onSelectSecurityKeyAuthorization],
  )

  const handleSelectSameDeviceAuthorization = useCallback(
    async ({ userNumber }: { userNumber: number }) => {
      await onSelectSameDeviceAuthorization(userNumber)
    },
    [onSelectSameDeviceAuthorization],
  )

  return (
    // TODO: add loading message
    <BlurredLoader isLoading={isLoading}>
      <ApplicationMeta
        applicationName={applicationName}
        applicationLogo={applicationLogo}
        title="Sign in"
        subTitle={`Choose how you'd like to sign in to ${applicationName}`}
      />
      <div className="flex flex-col w-full mt-8 space-y-1">
        {!showAdvancedOptions ? (
          <>
            <SignInWithGoogle onLogin={onSelectGoogleAuthorization} />
            <Separator className="max-w-[400px]" />

            <IconButton
              id="continue-with-enhanced-security"
              title="Continue with enhanced security"
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
          onClick={onToggleAdvancedOptions}
        >
          {showAdvancedOptions ? "Back" : "Other sign in options"}
        </p>
      </div>
    </BlurredLoader>
  )
}
