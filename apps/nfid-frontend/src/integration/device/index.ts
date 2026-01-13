import bowser from "bowser"
import useSWRImmutable from "swr/immutable"

import { Icon } from "@nfid/integration"
import { getIsMobileDeviceMatch } from "@nfid/ui/utils/is-mobile"

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

/**
 * Determines if a platform authenticator (e.g., Touch ID, Face ID, Windows Hello) is available.
 *
 * Note: In e2e headless mode, `isUserVerifyingPlatformAuthenticatorAvailable()` may not
 * correctly detect platform authenticators. In e2e mode, we rely on virtual authenticators
 * configured in the test setup, so this function should return true if WebAuthn is supported.
 *
 * @returns Promise<boolean> - true if platform authenticator is available, false otherwise
 */
export async function fetchWebAuthnPlatformCapability() {
  if (!isWebAuthNSupported()) {
    return false
  }

  // In e2e test mode, virtual authenticators are used, so we assume platform authenticator
  // is available if WebAuthn is supported. The actual detection may be unreliable in headless mode.
  if (typeof IS_E2E_TEST !== "undefined" && IS_E2E_TEST === "true") {
    return true
  }

  return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
}

export function getPlatformInfo() {
  const userAgent = window.navigator.userAgent,
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
