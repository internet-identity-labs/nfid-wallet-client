import clsx from "clsx"
import React from "react"

import { useDeviceInfo } from "frontend/apps/device/use-device-info"
import { ElementProps } from "frontend/types/react"
import { H5 } from "frontend/ui/atoms/typography"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"

interface AuthorizeRegisterDeciderProps extends ElementProps<HTMLDivElement> {
  onLogin: () => Promise<void> | void
  onRegisterPlatformDevice: () => Promise<void>
  onRegisterSecurityDevice: () => Promise<void>
  isLoading: boolean
}

export const AuthorizeRegisterDeciderScreen: React.FC<
  AuthorizeRegisterDeciderProps
> = ({
  isLoading,
  className,
  onLogin,
  onRegisterPlatformDevice,
  onRegisterSecurityDevice,
}) => {
  const {
    platform: { device, authenticator: platformAuth },
    isWebAuthNAvailable,
  } = useDeviceInfo()

  return (
    <ScreenResponsive
      className={clsx("flex flex-col items-center", className)}
      isLoading={isLoading}
    >
      <H5>Sign in faster on this device</H5>
      <p className="mt-2 text-center">
        {isWebAuthNAvailable
          ? `Trust this ${device}? You can quickly and securely sign in next time using this device's ${platformAuth}.`
          : "You can quickly and securely sign in next time with a security key if you register one now."}
      </p>
      <div className="flex flex-col w-full space-y-1 mt-7">
        {isWebAuthNAvailable ? (
          <>
            <DeviceRaw
              title={"Trust this device"}
              subtitle={`Use ${platformAuth} to continue`}
              handler={onRegisterPlatformDevice}
            />
            <DeviceRaw
              title={"Don’t trust this device"}
              id="notTrustedDevice"
              subtitle={"This device is public or someone else’s"}
              handler={onLogin}
            />
          </>
        ) : (
          <>
            <DeviceRaw
              title={"Register my security key"}
              subtitle={"Sign in faster with your security key"}
              handler={onRegisterSecurityDevice}
            />
            <DeviceRaw
              title={"Just log me in"}
              subtitle={"I don’t want to register a security key now"}
              handler={onLogin}
            />
          </>
        )}
      </div>
    </ScreenResponsive>
  )
}

interface DeviceRawProps {
  title: string
  subtitle: string
  handler: () => Promise<void> | void
  id?: string
}

export const DeviceRaw: React.FC<DeviceRawProps> = ({
  title,
  subtitle,
  handler,
  id
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
