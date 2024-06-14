import clsx from "clsx"
import React from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import {
  BlurredLoader,
  IconCmpArrow,
  IconCmpTouchId,
  IconCmpUsb,
  IconCmpWarning,
  Input,
} from "@nfid-frontend/ui"
import { loadProfileFromLocalStorage } from "@nfid/integration"

import { AbstractAuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"
import { IconButton } from "frontend/ui/atoms/button/icon-button"

import { AuthAppMeta } from "../../ui/app-meta"
import { authWithAnchor } from "./services"

export interface AuthOtherSignOptionsProps {
  onBack: () => void
  appMeta?: AuthorizingAppMeta
  onSuccess: (authSession: AbstractAuthSession) => void
  authRequest?: AuthorizationRequest
}

export const AuthOtherSignOptions = ({
  onBack,
  appMeta,
  onSuccess,
  authRequest,
}: AuthOtherSignOptionsProps) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const { register, handleSubmit } = useForm<{
    userNumber: number
  }>({
    defaultValues: {
      userNumber: loadProfileFromLocalStorage()?.anchor ?? undefined,
    },
  })

  const handleAuth = React.useCallback(
    async (data: { anchor: number; withSecurityDevices: boolean }) => {
      try {
        setIsLoading(true)
        const res = await authWithAnchor(data)
        onSuccess(res)
      } catch (e: any) {
        toast.error(e.message)
      } finally {
        setIsLoading(false)
      }
    },
    [onSuccess],
  )

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
          "grid grid-cols-[22px,1fr] space-x-1.5 text-sm",
          "bg-orange-50 pl-[15px] py-[15px] mt-4 rounded-md",
        )}
      >
        <div>
          <IconCmpWarning className="text-orange-500" />
        </div>
        <div>
          <p className="font-bold leading-[22px]">Attention required</p>
          <p className="mt-2.5 text-sm">
            NFID’s two-factor authentication has been upgraded. Update your
            settings in the Security section of your profile at{" "}
            <a
              href="https://nfid.one/profile/security"
              target="_blank"
              rel="noreferrer"
              className="text-linkColor"
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
