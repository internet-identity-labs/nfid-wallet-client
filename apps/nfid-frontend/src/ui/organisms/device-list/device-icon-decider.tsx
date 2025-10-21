import React from "react"

import { Icon } from "@nfid/integration"

import { AppleIcon } from "frontend/ui/atoms/icons/apple"
import { IconDesktop } from "frontend/ui/atoms/icons/desktop"
import { DocumentIcon } from "frontend/ui/atoms/icons/document"
import { EmailIcon } from "frontend/ui/atoms/icons/email"
import { GoogleIcon } from "frontend/ui/atoms/icons/google"
import { IconLaptop } from "frontend/ui/atoms/icons/laptop"
import { MobileIcon } from "frontend/ui/atoms/icons/mobile"
import { PasskeyIcon } from "frontend/ui/atoms/icons/passkey"
import { TabletIcon } from "frontend/ui/atoms/icons/tablet"
import { UnknownIcon } from "frontend/ui/atoms/icons/unknown"
import { USBIcon } from "frontend/ui/atoms/icons/usb"
import { IiIcon } from "frontend/ui/atoms/icons/ii"

interface DeviceIconDeciderProps {
  icon: Icon
  onClick?: (e: React.SyntheticEvent) => void
  className?: string
  color?: string
}

export const DeviceIconDecider: React.FC<DeviceIconDeciderProps> = ({
  icon,
  onClick,
  className,
  color = "#9CA3AF",
}) => {
  switch (icon) {
    case "passkey":
      return (
        <PasskeyIcon className={className} onClick={onClick} color={color} />
      )
    case "ii":
      return <IiIcon className={className} onClick={onClick} color={color} />
    case "apple":
      return <AppleIcon className={className} onClick={onClick} color={color} />
    case "mobile":
      return (
        <MobileIcon className={className} onClick={onClick} color={color} />
      )
    case "tablet":
      return (
        <TabletIcon className={className} onClick={onClick} color={color} />
      )
    case "laptop":
      return (
        <IconLaptop className={className} onClick={onClick} color={color} />
      )
    case "desktop":
      return (
        <IconDesktop className={className} onClick={onClick} color={color} />
      )
    case "document":
      return (
        <DocumentIcon className={className} onClick={onClick} color={color} />
      )
    case "usb":
      return <USBIcon className={className} onClick={onClick} color={color} />
    case "google":
      return (
        <GoogleIcon className={className} onClick={onClick} color={color} />
      )
    case "unknown":
      return (
        <UnknownIcon className={className} onClick={onClick} color={color} />
      )
    case "email":
      return <EmailIcon className={className} onClick={onClick} color={color} />
    default:
      return <UnknownIcon className={className} onClick={onClick} />
  }
}
