import { IconButton } from "packages/ui/src/molecules/button/icon-button"
import { AuthAppMeta } from "packages/ui/src/organisms/authentication/app-meta"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import {
  BlurredLoader,
  IconCmpArrow,
  IconCmpTouchId,
  IconCmpUsb,
  Input,
} from "@nfid-frontend/ui"

export interface AuthOtherSignOptionsProps {
  onBack: () => void
  applicationUrl?: string
  handleAuth: (data: { anchor: number; withSecurityDevices: boolean }) => void
  isLoading: boolean
  profileAnchor?: number
  withLogo?: boolean
  title?: string
  subTitle?: string | JSX.Element
  onAuthWithRecoveryPhrase?: () => unknown
}

export const AuthOtherSignOptions = ({
  onBack,
  applicationUrl,
  handleAuth,
  isLoading,
  profileAnchor,
  withLogo,
  title,
  subTitle,
  onAuthWithRecoveryPhrase,
}: AuthOtherSignOptionsProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<{
    userNumber: number
  }>()

  useEffect(() => {
    if (profileAnchor) setValue("userNumber", profileAnchor)
  }, [profileAnchor, setValue])

  if (isLoading) return <BlurredLoader isLoading />

  return (
    <div className="flex-grow h-full">
      <IconCmpArrow
        className="absolute w-6 transition-opacity cursor-pointer hover:opacity-50 shrink-0 top-5 left-5 dark:text-white"
        onClick={onBack}
      />
      <AuthAppMeta
        applicationURL={applicationUrl}
        withLogo={withLogo}
        title={title}
        subTitle={subTitle}
      />
      <IconButton
        id={"continue-recovery-phrase"}
        className="mt-[10px] mb-[20px] dark:text-white"
        title="Continue with recovery phrase"
        subtitle="Use your saved recovery phrase"
        img={<IconCmpUsb />}
        onClick={() => onAuthWithRecoveryPhrase?.()}
      />
      <p className="text-center text-sm text-gray-400 mb-[10px] uppercase">
        or
      </p>
      <Input
        {...register("userNumber", {
          required: "Please enter your NFID number",
        })}
        labelText="Your NFID number"
        className="mb-[20px]"
        errorText={errors.userNumber?.message}
      />
      <div className="space-y-2.5">
        <IconButton
          title="Continue with your device"
          subtitle="Use a Passkey on this device"
          img={<IconCmpTouchId />}
          onClick={handleSubmit((data) =>
            handleAuth({ anchor: data.userNumber, withSecurityDevices: false }),
          )}
        />
        <IconButton
          title="Continue with security key"
          subtitle="Use a Passkey on a security key"
          img={<IconCmpUsb />}
          onClick={handleSubmit((data) =>
            handleAuth({ anchor: data.userNumber, withSecurityDevices: true }),
          )}
        />
      </div>
    </div>
  )
}
