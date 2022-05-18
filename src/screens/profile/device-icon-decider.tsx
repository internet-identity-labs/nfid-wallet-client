import React from "react"

import { DesktopIcon } from "frontend/design-system/atoms/icons/desktop"
import { KeyIcon } from "frontend/design-system/atoms/icons/key"
import { LaptopIcon } from "frontend/design-system/atoms/icons/laptop"
import { MobileIcon } from "frontend/design-system/atoms/icons/mobile"
import { TabletIcon } from "frontend/design-system/atoms/icons/tablet"
import { Icon } from "frontend/services/identity-manager/devices/state"

interface DeviceIconDeciderProps {
  icon: Icon
  onClick?: (e: React.SyntheticEvent) => void
}

export const DeviceIconDecider: React.FC<DeviceIconDeciderProps> = ({
  icon,
  onClick,
}) => {
  const props = {
    className: "text-xl text-blue-base",
    onClick,
  }
  switch (icon) {
    case "mobile":
      return <MobileIcon {...props} />
    case "tablet":
      return <TabletIcon {...props} />
    case "laptop":
      return <LaptopIcon {...props} />
    case "desktop":
      return <DesktopIcon {...props} />
    case "key":
      return <KeyIcon {...props} />
    default:
      return null
  }
}
