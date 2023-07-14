import React from "react"

import { Icon } from "@nfid/integration"

import { IconLaptop } from "frontend/ui/atoms/icons/desktop"
import { DocumentIcon } from "frontend/ui/atoms/icons/document"
import { EmailIcon } from "frontend/ui/atoms/icons/email"
import { GoogleIcon } from "frontend/ui/atoms/icons/google"
import { IconDesktop } from "frontend/ui/atoms/icons/laptop"
import { MobileIcon } from "frontend/ui/atoms/icons/mobile"
import { TabletIcon } from "frontend/ui/atoms/icons/tablet"
import { UnknownIcon } from "frontend/ui/atoms/icons/unknown"
import { USBIcon } from "frontend/ui/atoms/icons/usb"

interface DeviceIconDeciderProps {
  icon: Icon
  onClick?: (e: React.SyntheticEvent) => void
  className?: string
}

export const DeviceIconDecider: React.FC<DeviceIconDeciderProps> = ({
  icon,
  onClick,
  className,
}) => {
  switch (icon) {
    case "mobile":
      return <MobileIcon className={className} onClick={onClick} />
    case "tablet":
      return <TabletIcon className={className} onClick={onClick} />
    case "laptop":
      return <IconLaptop className={className} onClick={onClick} />
    case "desktop":
      return <IconDesktop className={className} onClick={onClick} />
    case "document":
      return <DocumentIcon className={className} onClick={onClick} />
    case "usb":
      return <USBIcon className={className} onClick={onClick} />
    case "google":
      return <GoogleIcon className={className} onClick={onClick} />
    case "unknown":
      return <UnknownIcon className={className} onClick={onClick} />
    case "email":
      return <EmailIcon className={className} onClick={onClick} />
    default:
      return <UnknownIcon className={className} onClick={onClick} />
  }
}
