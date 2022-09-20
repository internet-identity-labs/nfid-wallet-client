import bowser from "bowser"

const PLATFORMS_MACOS = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"]
const PLATFORMS_WINDOWS = ["Win32", "Win64", "Windows", "WinCE"]
const PLATFORMS_IOS = ["iPhone", "iPad", "iPod"]

/** @deprecated */
export const getPlatformInfo = () => {
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
        authenticator: "Face ID",
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

// TODO: refactor to bowser plugin
export const getBrowser = () => {
  const agent = window.navigator.userAgent.toLowerCase()
  switch (true) {
    case agent.indexOf("edge") > -1:
      return "Edge"
    case agent.indexOf("opr") > -1 && !!(window as any).opr:
      return "Opera"
    case agent.indexOf("chrome") > -1 && !!(window as any).chrome:
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

export const isOdd = (num: number) => num % 2 === 1

export const getUrl = (url: string) => {
  if (!/^(http|https):\/\//.test(url)) {
    url = `${window.location.protocol}//${url}`
  }

  return new URL(url)
}

export const isHex = (h: string) => {
  const re = /[0-9A-Fa-f]{6}/g
  return re.test(h)
}

/**
 * Turn Hello World! into hello-world
 *
 * @export
 * @param {string} str
 */
export function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
