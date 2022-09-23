import bowser from "bowser"
import useSWR from "swr"

const PLATFORMS_MACOS = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"]
const PLATFORMS_WINDOWS = ["Win32", "Win64", "Windows", "WinCE"]
const PLATFORMS_IOS = ["iPhone", "iPad", "iPod"]

const parser = bowser.getParser(window.navigator.userAgent)
const browser = (navigator as any).brave
  ? { ...parser.getBrowser(), name: "Brave" }
  : parser.getBrowser()

const platform = getPlatformInfo()

export async function fetchWebAuthnPlatformCapability() {
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch (e) {
    return false
  }
}

export const MobileBrowser = [
  "Android",
  "BlackBerry",
  "iPhone",
  "iPad",
  "iPod",
  "Opera Mini",
  "IEMobile",
  "WPDesktop",
]
export const IsMobileRegEx = new RegExp(MobileBrowser.join("|"), "i")

// NOTE: needed to turn this into a function. Otherwise within tests its not
// picking up the mocked userAgent.
export const getIsMobileDeviceMatch = (): boolean => {
  const isMobile = Boolean(window.navigator.userAgent.match(IsMobileRegEx))
  console.debug("isMobile", {
    userAgent: window.navigator.userAgent,
    returnValue: Boolean(window.navigator.userAgent.match(IsMobileRegEx)),
  })

  return isMobile
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

export const deviceInfo = {
  platform,
  browser,
  newDeviceName: `NFID ${browser.name} on ${platform.os}`,
  isMobile: getIsMobileDeviceMatch(),
}

export const useDeviceInfo = () => {
  const { data: hasPlatformAuthenticator } = useSWR(
    "hasWebAuthNCapability",
    fetchWebAuthnPlatformCapability,
  )

  return { ...deviceInfo, hasPlatformAuthenticator }
}
