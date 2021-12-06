export const getPlatform = () => {
  var userAgent = window.navigator.userAgent,
    platform = window.navigator.platform,
    macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"],
    windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"],
    iosPlatforms = ["iPhone", "iPad", "iPod"],
    os = null

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = "Mac OS"
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = "iOS"
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = "Windows"
  } else if (/Android/.test(userAgent)) {
    os = "Android"
  } else if (!os && /Linux/.test(platform)) {
    os = "Linux"
  }

  return os
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
