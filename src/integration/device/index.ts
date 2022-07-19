import bowser from "bowser"

const PLATFORMS_MACOS = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"]
const PLATFORMS_WINDOWS = ["Win32", "Win64", "Windows", "WinCE"]
const PLATFORMS_IOS = ["iPhone", "iPad", "iPod"]

const parser = bowser.getParser(window.navigator.userAgent)
const browser = parser.getBrowser()
const platform = getPlatformInfo()

export async function fetchWebAuthnCapability() {
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch (e) {
    return false
  }
}

export const isMobile = Boolean(
  window.navigator.userAgent.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i,
  ),
)

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
      return { make: "unknown", os: "unknown", authenticator: "unknown" }
  }
}

export const deviceInfo = {
  platform,
  browser,
  newDeviceName: `NFID ${browser.name} on ${platform.os}`,
  isMobile,
  hasWebAuthn: fetchWebAuthnCapability(),
}

let hasWebAuthn: boolean | undefined = undefined
fetchWebAuthnCapability().then((r) => (hasWebAuthn = r))

export function fetchWebAuthnCapabilitySync() {
  return hasWebAuthn
}
