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
  const isMobile = Boolean(window.navigator.userAgent.match(IsMobileRegEx))
  console.debug("isMobile", {
    userAgent: window.navigator.userAgent,
    returnValue: Boolean(window.navigator.userAgent.match(IsMobileRegEx)),
  })

  return isMobile
}
