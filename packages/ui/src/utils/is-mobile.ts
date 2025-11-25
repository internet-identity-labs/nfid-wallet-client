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

export const BALANCE_EDGE_LENGTH = 20
export const BALANCE_MOBILE_EDGE_LENGTH = 8

export const getIsMobileDeviceMatch = (): boolean => {
  return Boolean(window.navigator.userAgent.match(IsMobileRegEx))
}
