import bowser from "bowser"
const PLATFORMS_MACOS = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"]
const PLATFORMS_WINDOWS = ["Win32", "Win64", "Windows", "WinCE"]
const PLATFORMS_IOS = ["iPhone", "iPad", "iPod"]

export const getPlatformInfo = () => {
  var userAgent = window.navigator.userAgent,
    platform = window.navigator.platform

  switch (true) {
    case PLATFORMS_MACOS.indexOf(platform) !== -1:
      return {
        make: "Apple",
        os: "Mac OS",
        authenticator: "Touch ID",
      }
    case PLATFORMS_IOS.indexOf(platform) !== -1:
      return {
        make: "Apple",
        os: "iOS",
        authenticator: "Face Id",
      }
    case PLATFORMS_WINDOWS.indexOf(platform) !== -1:
      return {
        make: "Microsoft",
        os: "Windows",
        authenticator: "Hello",
      }
    case /Android/.test(userAgent):
      return {
        make: "Google",
        os: "Android",
        authenticator: "Fingerprint",
      }
    case /Linux/.test(platform):
      return {
        make: "Unknown",
        os: "Linux",
        authenticator: "Fingerprint",
      }
    default:
      return { make: "unknown", os: "unknown", authenticator: "unknown" }
  }
}

// TODO: refactor to bowser plugin
export const getBrowser = () => {
  const agent = window.navigator.userAgent.toLowerCase()
  switch (true) {
    case agent.indexOf("edge") > -1:
      return "Edge"
    case agent.indexOf("opr") > -1 && !!(<any>window).opr:
      return "Opera"
    case agent.indexOf("chrome") > -1 && !!(<any>window).chrome:
      return "Chrome"
    case agent.indexOf("trident") > -1:
      return "IE"
    case agent.indexOf("firefox") > -1:
      return "Firefox"
    case agent.indexOf("safari") > -1:
      return "Safari"
    default:
      return "Other"
  }
}

export const getBrowserVersion = () => {
  const browser = bowser.getParser(window.navigator.userAgent)

  return browser.getBrowser().version
}

export const getBrowserName = () => {
  const browser = bowser.getParser(window.navigator.userAgent)

  return browser.getBrowser().name
}
