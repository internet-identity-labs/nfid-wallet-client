import clsx from "clsx"
import React from "react"

import { SDKApplicationMeta } from "@nfid/ui"

import { HTMLAttributes } from "react"
import { BlurredLoader } from "@nfid/ui/molecules/blurred-loader"

interface AuthorizeRegisterDeciderProps extends HTMLAttributes<HTMLDivElement> {
  onLogin: () => Promise<void> | void
  onRegisterPlatformDevice: () => Promise<void>
  onRegisterSecurityDevice: () => Promise<void>
  deviceName: string
  platformAuthenticatorName: string
  isLoading: boolean
  /**
   * Whether a platform authenticator (e.g., Touch ID, Face ID, Windows Hello) is available.
   * Note: In e2e headless mode, this detection may be unreliable. The parent component
   * should handle e2e mode detection and pass the correct value.
   */
  isPlatformAuthenticatorAvailable: boolean
  loadingMessage?: string
}

export const AuthorizeRegisterDeciderScreen: React.FC<
  AuthorizeRegisterDeciderProps
> = ({
  isLoading,
  deviceName,
  platformAuthenticatorName,
  isPlatformAuthenticatorAvailable,
  loadingMessage,
  onLogin,
  onRegisterPlatformDevice,
  onRegisterSecurityDevice,
}) => {
  return (
    <BlurredLoader isLoading={isLoading} loadingMessage={loadingMessage}>
      <SDKApplicationMeta
        title="Sign in faster on this device"
        subTitle={
          isPlatformAuthenticatorAvailable
            ? `Trust this ${deviceName}? You can quickly and securely sign in next time using this device's ${platformAuthenticatorName}.`
            : "You can quickly and securely sign in next time with a security key if you register one now."
        }
      />
      <div className="flex flex-col w-full space-y-1 mt-7">
        {isPlatformAuthenticatorAvailable ? (
          <>
            <DeviceRaw
              id="trust-this-device"
              title={"Trust this device"}
              subtitle={`Use ${platformAuthenticatorName} to continue`}
              handler={onRegisterPlatformDevice}
            />
            <DeviceRaw
              id="just-log-me-in"
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
  title,
  subtitle,
  handler,
  id,
}) => {
  return (
    <div
      id={id}
      className={clsx(
        "w-full py-[10px] px-4 border border-primaryButtonColor/30 rounded-md",
        "hover:bg-primaryButtonColor/10 hover:border-primaryButtonColor/50 cursor-pointer transition-all",
      )}
      onClick={handler}
    >
      <p className="text-sm">{title}</p>
      <p className="mt-0.5 text-xs text-secondary">{subtitle}</p>
    </div>
  )
}
