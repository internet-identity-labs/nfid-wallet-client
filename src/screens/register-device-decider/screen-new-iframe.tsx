import clsx from "clsx"
import React from "react"

import { H5 } from "frontend/design-system/atoms/typography"
import { IFrameTemplate } from "frontend/design-system/templates/IFrameTemplate"
import { useDeviceInfo } from "frontend/hooks/use-device-info"
import { ElementProps } from "frontend/types/react"

interface AuthorizeRegisterDeciderProps extends ElementProps<HTMLDivElement> {
  hasPlatformAuthenticator: boolean
  onLogin: () => Promise<void>
  onRegisterPlatformDevice: () => Promise<void>
  onRegisterSecurityDevice: () => Promise<void>
}

export const AuthorizeRegisterDecider: React.FC<
  AuthorizeRegisterDeciderProps
> = ({
  children,
  className,
  onLogin,
  onRegisterPlatformDevice,
  onRegisterSecurityDevice,
  hasPlatformAuthenticator,
}) => {
  const {
    platform: { device, authenticator: platformAuth },
  } = useDeviceInfo()

  return (
    <IFrameTemplate className={clsx("flex flex-col items-center", className)}>
      <H5>Sign in faster on this device</H5>
      <p className="mt-2 text-center">
        Trust this {device}? You can quickly and securely sign in next time
        using this device's {platformAuth}.
      </p>
      <div className="flex flex-col w-full space-y-1 mt-7">
        {hasPlatformAuthenticator ? (
          <>
            <DeviceRaw
              title={"Trust this device"}
              subtitle={`Use ${platformAuth} to continue`}
              handler={onRegisterPlatformDevice}
            />
            <DeviceRaw
              title={"Don’t trust this device"}
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
    </IFrameTemplate>
  )
}

interface DeviceRawProps {
  title: string
  subtitle: string
  handler: () => Promise<void>
}

export const DeviceRaw: React.FC<DeviceRawProps> = ({
  title,
  subtitle,
  handler,
}) => {
  return (
    <div
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
