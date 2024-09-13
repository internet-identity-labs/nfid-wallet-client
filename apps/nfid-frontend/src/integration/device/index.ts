import bowser from "bowser"
import { getIsMobileDeviceMatch } from "packages/ui/src/utils/is-mobile"
import useSWRImmutable from "swr/immutable"

import { Icon } from "@nfid/integration"

const PLATFORMS_MACOS = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"]
const PLATFORMS_WINDOWS = ["Win32", "Win64", "Windows", "WinCE"]
const PLATFORMS_IOS = ["iPhone", "iPad", "iPod"]

const parser = bowser.getParser(window.navigator.userAgent)
const browser = (navigator as any).brave
  ? { ...parser.getBrowser(), name: "Brave" }
  : parser.getBrowser()

const platform = getPlatformInfo()
const name = getName()

/**
 * Determine if the browser is capable of WebAuthN
 */
export function isWebAuthNSupported(): boolean {
  return (
    window?.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === "function"
  )
}

export function getName(): string {
  if (platform.os === "Windows") {
    return `NFID Windows Hello`
  }
  return `NFID ${browser.name} on ${platform.os}`
}

export function getBrowserName(): string {
  return browser.name || "My Computer"
}

export async function fetchWebAuthnPlatformCapability() {
  if (!isWebAuthNSupported()) {
    return false
  }

  return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
}

export function getPlatformInfo() {
  var userAgent = window.navigator.userAgent,
    platform = window.navigator.platform

  switch (true) {
    case PLATFORMS_MACOS.indexOf(platform) !== -1:
      return {
        make: "Apple",
        os: "Mac OS",
        device: "Mac",
        authenticator: "Touch ID",
      }
    case PLATFORMS_IOS.indexOf(platform) !== -1:
      return {
        make: "Apple",
        os: "iOS",
        device: "iPhone",
        authenticator: "Face Id",
      }
    case PLATFORMS_WINDOWS.indexOf(platform) !== -1:
      return {
        make: "Microsoft",
        os: "Windows",
        device: "Windows",
        authenticator: "Hello",
      }
    case /Android/.test(userAgent):
      return {
        make: "Google",
        os: "Android",
        device: "Mobile",
        authenticator: "Fingerprint",
      }
    case /Linux/.test(platform):
      return {
        make: "Unknown",
        os: "Linux",
        device: "Computer",
        authenticator: "Fingerprint",
      }
    default:
      return {
        make: "unknown",
        os: "unknown",
        device: "unknown",
        authenticator: "unknown",
      }
  }
}

let hasWebAuthn: boolean | undefined = undefined
fetchWebAuthnPlatformCapability().then((r) => (hasWebAuthn = r))

export function fetchWebAuthnCapabilitySync() {
  return hasWebAuthn
}

export function getIcon(deviceInfo: any): Icon {
  if (deviceInfo.platform.os === "Windows") {
    return Icon.desktop
  }
  return deviceInfo.isMobile ? Icon.mobile : Icon.desktop
}

export const deviceInfo = {
  platform,
  browser,
  newDeviceName: name,
  isMobile: getIsMobileDeviceMatch(),
}

export const useDeviceInfo = () => {
  const { data: hasPlatformAuthenticator } = useSWRImmutable(
    "hasWebAuthNCapability",
    fetchWebAuthnPlatformCapability,
  )

  return { ...deviceInfo, hasPlatformAuthenticator }
}
