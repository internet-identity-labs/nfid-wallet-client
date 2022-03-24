import bowser from "bowser"
import React from "react"

import { getPlatformInfo } from "frontend/utils"

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
    return info
  }, [])
  return deviceInfo
}
