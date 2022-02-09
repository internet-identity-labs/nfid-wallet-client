import bowser from "bowser"

import { getPlatformInfo } from "frontend/utils"
import React from "react"

export const useDeviceInfo = () => {
  const deviceInfo = React.useMemo(() => {
    const { os, ...rest } = getPlatformInfo()
    const parser = bowser.getParser(window.navigator.userAgent)
    const { name: browserName, version: browserVersion } = parser.getBrowser()
    const info = {
      ...rest,
      os,
      browser: browserName,
      browserVersion,
      newDeviceName: `NFID ${browserName} on ${os}`,
    }
    console.log(">> useDeviceInfo", { info })
    return info
  }, [])
  return deviceInfo
}
