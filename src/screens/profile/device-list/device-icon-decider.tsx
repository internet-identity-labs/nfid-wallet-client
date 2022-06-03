import React from "react"

import { IconLaptop } from "frontend/design-system/atoms/icons/desktop"
import { DocumentIcon } from "frontend/design-system/atoms/icons/document"
import { IconDesktop } from "frontend/design-system/atoms/icons/laptop"
import { MobileIcon } from "frontend/design-system/atoms/icons/mobile"
import { TabletIcon } from "frontend/design-system/atoms/icons/tablet"
import { USBIcon } from "frontend/design-system/atoms/icons/usb"

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
      return <IconLaptop {...props} />
    case "desktop":
      return <IconDesktop {...props} />
    case "document":
      return <DocumentIcon {...props} />
    case "usb":
      return <USBIcon {...props} />
    default:
      return null
  }
}
