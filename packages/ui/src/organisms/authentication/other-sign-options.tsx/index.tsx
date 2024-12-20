import clsx from "clsx"
import { IconButton } from "packages/ui/src/molecules/button/icon-button"
import { AuthAppMeta } from "packages/ui/src/organisms/authentication/app-meta"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import {
  BlurredLoader,
  IconCmpArrow,
  IconCmpTouchId,
  IconCmpUsb,
  IconCmpWarning,
  Input,
} from "@nfid-frontend/ui"

export interface AuthOtherSignOptionsProps {
  onBack: () => void
  appMeta?: string
  handleAuth: (data: { anchor: number; withSecurityDevices: boolean }) => void
  isLoading: boolean
  profileAnchor?: number
  withLogo?: boolean
  title?: string
  subTitle?: string | JSX.Element
}

export const AuthOtherSignOptions = ({
  onBack,
  appMeta,
  handleAuth,
  isLoading,
  profileAnchor,
  withLogo,
  title,
  subTitle,
}: AuthOtherSignOptionsProps) => {
  const { register, handleSubmit, setValue } = useForm<{
    userNumber: number
  }>()

  useEffect(() => {
    if (profileAnchor) setValue("userNumber", profileAnchor)
  }, [profileAnchor])

  if (isLoading) return <BlurredLoader isLoading />

  return (
    <div>
      <IconCmpArrow
        className="absolute w-6 transition-opacity cursor-pointer hover:opacity-50 shrink-0 top-5 left-5"
        onClick={onBack}
      />
      <AuthAppMeta
        applicationURL={appMeta}
        withLogo={withLogo}
        title={title}
        subTitle={subTitle}
      />
      <div
        className={clsx(
          "grid grid-cols-[22px,1fr] space-x-[10px] text-sm",
          "bg-orange-50 p-[15px] mt-[44px] rounded-[12px]",
        )}
      >
        <div>
          <IconCmpWarning className="text-orange-900" />
        </div>
        <div>
          <p className="font-bold leading-[22px] text-orange-900">
            Attention required
          </p>
          <p className="mt-2.5 text-sm text-orange-900">
            NFID’s two-factor authentication has been upgraded. Update your
            settings in the Security section of your profile at{" "}
            <a
              href="https://nfid.one/profile/security"
              target="_blank"
              rel="noreferrer"
              className="text-primaryButtonColor"
            >
              https://nfid.one/security
            </a>
            .
          </p>
        </div>
      </div>
      <Input
        {...register("userNumber")}
        labelText="Your NFID number"
        className="my-[20px]"
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
