export const getPlatformInfo = () => {
  var userAgent = window.navigator.userAgent,
    platform = window.navigator.platform,
    macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"],
    windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"],
    iosPlatforms = ["iPhone", "iPad", "iPod"],
    info = { make: "unknown", os: "unknown", authenticator: "unknown" }

  if (macosPlatforms.indexOf(platform) !== -1) {
    info = {
      make: "Apple",
      os: "Mac OS",
      authenticator: "Touch ID",
    }
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    info = {
      make: "Apple",
      os: "iOS",
      authenticator: "Face Id",
    }
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    info = {
      make: "Microsoft",
      os: "Windows",
      authenticator: "Hello",
    }
  } else if (/Android/.test(userAgent)) {
    info = {
      make: "Google",
      os: "Android",
      authenticator: "Fingerprint",
    }
  } else if (!info && /Linux/.test(platform)) {
    info = {
      make: "Unknown",
      os: "Linux",
      authenticator: "Fingerprint",
    }
  }

  return info
}

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
