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
      isMobile: Boolean(
        window.navigator.userAgent.match(
          /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i,
        ),
      ),
    }
    return info
  }, [])
  return deviceInfo
}
