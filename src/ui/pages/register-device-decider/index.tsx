import clsx from "clsx"
import React from "react"

import { useDeviceInfo } from "frontend/apps/device/use-device-info"
import { ElementProps } from "frontend/types/react"
import { ApplicationMeta } from "frontend/ui/molecules/application-meta"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

interface AuthorizeRegisterDeciderProps extends ElementProps<HTMLDivElement> {
  onLogin: () => Promise<void> | void
  onRegisterPlatformDevice: () => Promise<void>
  onRegisterSecurityDevice: () => Promise<void>
  isLoading: boolean
  loadingMessage?: string
}

export const AuthorizeRegisterDeciderScreen: React.FC<
  AuthorizeRegisterDeciderProps
> = ({
  isLoading,
  loadingMessage,
  onLogin,
  onRegisterPlatformDevice,
  onRegisterSecurityDevice,
}) => {
  const {
    platform: { device, authenticator: platformAuth },
    isWebAuthNAvailable,
  } = useDeviceInfo()

  return (
    <BlurredLoader isLoading={isLoading} loadingMessage={loadingMessage}>
      <ApplicationMeta
        title="Sign in faster on this device"
        subTitle={
          isWebAuthNAvailable
            ? `Trust this ${device}? You can quickly and securely sign in next time using this device's ${platformAuth}.`
            : "You can quickly and securely sign in next time with a security key if you register one now."
        }
      />
      <div className="flex flex-col w-full space-y-1 mt-7">
        {isWebAuthNAvailable ? (
          <>
            <DeviceRaw
              id="trust-this-device"
              title={"Trust this device"}
              subtitle={`Use ${platformAuth} to continue`}
              handler={onRegisterPlatformDevice}
            />
            <DeviceRaw
              id="dont-trust-this-device"
              title={"Don’t trust this device"}
              subtitle={"This device is public or someone else’s"}
              handler={onLogin}
            />
          </>
        ) : (
          <>
            <DeviceRaw
              id="register-my-security-key"
              title={"Register my security key"}
              subtitle={"Sign in faster with your security key"}
              handler={onRegisterSecurityDevice}
            />
            <DeviceRaw
              id="just-log-me-in"
              title={"Just log me in"}
              subtitle={"I don’t want to register a security key now"}
              handler={onLogin}
            />
          </>
        )}
      </div>
    </BlurredLoader>
  )
}

interface DeviceRawProps {
  id: string
  title: string
  subtitle: string
  handler: () => Promise<void> | void
}

export const DeviceRaw: React.FC<DeviceRawProps> = ({
  id,
  title,
  subtitle,
  handler,
}) => {
  return (
    <div
      id={id}
      className={clsx(
        "w-full py-[10px] px-4 border border-gray-200 rounded-md",
        "hover:bg-blue-50 hover:border-blue-500 cursor-pointer transition-all",
      )}
      onClick={handler}
    >
      <p className="text-sm">{title}</p>
      <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>
    </div>
  )
}
