import bowser from "bowser"

import { getPlatformInfo } from "frontend/utils"
import React from "react"

export const useDeviceInfo = () => {
  const deviceInfo = React.useMemo(() => {
    const parser = bowser.getParser(window.navigator.userAgent)
    const browser = parser.getBrowser()
    const platform = getPlatformInfo()

    const info = {
      platform,
      browser,
      newDeviceName: `NFID ${browser.name} on ${platform.os}`,
    }
    console.log(">> useDeviceInfo", { info })
    return info
  }, [])
  return deviceInfo
}
