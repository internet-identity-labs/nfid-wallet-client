import React from "react"

import { Icon } from "@nfid/integration"

import { AppleIcon } from "../../atoms/icons/apple"
import { IconDesktop } from "../../atoms/icons/desktop"
import { DocumentIcon } from "../../atoms/icons/document"
import { EmailIcon } from "../../atoms/icons/email"
import { GoogleIcon } from "../../atoms/icons/google"
import { IconLaptop } from "../../atoms/icons/laptop"
import { MobileIcon } from "../../atoms/icons/mobile"
import { PasskeyIcon } from "../../atoms/icons/passkey"
import { TabletIcon } from "../../atoms/icons/tablet"
import { UnknownIcon } from "../../atoms/icons/unknown"
import { USBIcon } from "../../atoms/icons/usb"
import { IiIcon } from "../../atoms/icons/ii"

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
