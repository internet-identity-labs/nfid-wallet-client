import React from "react"

import { Button } from "frontend/design-system/atoms/button"

import { Icon } from "frontend/comm/services/identity-manager/devices/state"

import { DeviceIconDecider } from "./device-icon-decider"

interface DeviceListButtonGroupProps {
  onSelect: (icon: Icon) => void
  selected: Icon
}

const ICONS: Icon[] = [
  "mobile",
  "tablet",
  "laptop",
  "desktop",
  "document",
  "usb",
]

export const DeviceListButtonGroup: React.FC<DeviceListButtonGroupProps> = ({
  onSelect,
  selected,
}) => {
  const handleSelect = React.useCallback(
    (icon: Icon) => () => onSelect(icon),
    [onSelect],
  )

  return (
    <div className="flex justify-center space-x-2">
      {ICONS.map((icon) => (
        <Button
          key={icon}
          icon
          onClick={handleSelect(icon)}
          isActive={selected === icon}
        >
          <DeviceIconDecider icon={icon} />
        </Button>
      ))}
    </div>
  )
}
