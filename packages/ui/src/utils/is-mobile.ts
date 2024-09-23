const MobileBrowser = [
  "Android",
  "BlackBerry",
  "iPhone",
  "iPad",
  "iPod",
  "Opera Mini",
  "IEMobile",
  "WPDesktop",
]

const IsMobileRegEx = new RegExp(MobileBrowser.join("|"), "i")

export const getIsMobileDeviceMatch = (): boolean => {
  return Boolean(window.navigator.userAgent.match(IsMobileRegEx))
}
