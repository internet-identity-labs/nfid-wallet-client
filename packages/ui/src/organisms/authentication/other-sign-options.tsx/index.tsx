import clsx from "clsx"
import { AuthAppMeta } from "packages/ui/src/organisms/authentication/app-meta"
import { useForm } from "react-hook-form"

import {
  BlurredLoader,
  IconCmpArrow,
  IconCmpTouchId,
  IconCmpUsb,
  IconCmpWarning,
  Input,
} from "@nfid-frontend/ui"

import { IconButton } from "frontend/ui/atoms/button/icon-button"

export interface AuthOtherSignOptionsProps {
  onBack: () => void
  appMeta?: AuthorizingAppMeta
  handleAuth: (data: { anchor: number; withSecurityDevices: boolean }) => void
  isLoading: boolean
  loadProfileFromLocalStorage: () => { anchor: number } | undefined
}

interface AuthorizingAppMeta {
  name?: string
  url?: string
  logo?: string
}

export const AuthOtherSignOptions = ({
  onBack,
  appMeta,
  handleAuth,
  isLoading,
  loadProfileFromLocalStorage,
}: AuthOtherSignOptionsProps) => {
  const { register, handleSubmit } = useForm<{
    userNumber: number
  }>({
    defaultValues: {
      userNumber: loadProfileFromLocalStorage()?.anchor ?? undefined,
    },
  })
  if (isLoading) return <BlurredLoader isLoading />

  return (
    <div>
      <IconCmpArrow
        className="absolute w-6 transition-opacity cursor-pointer hover:opacity-50 shrink-0"
        onClick={onBack}
      />
      <AuthAppMeta
        applicationLogo={appMeta?.logo}
        applicationURL={appMeta?.url}
        applicationName={appMeta?.name}
      />
      <div
        className={clsx(
          "grid grid-cols-[22px,1fr] space-x-[10px] text-sm",
          "bg-orange-50 p-[15px] mt-4 rounded-md",
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
              https://nfid.one/profile/security
            </a>
            .
          </p>
        </div>
      </div>
      <Input
        {...register("userNumber")}
        labelText="Your NFID number"
        className="my-4"
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
