import React from "react"

import { Button } from "@nfid/ui"
import { Icon } from "@nfid/integration"

import { DeviceIconDecider } from "./device-icon-decider"

interface DeviceListButtonGroupProps {
  onSelect: (icon: Icon) => void
  selected: Icon
}

const ICONS: Icon[] = [
  Icon.mobile,
  Icon.tablet,
  Icon.laptop,
  Icon.desktop,
  Icon.document,
  Icon.usb,
]

export const DeviceListButtonGroup: React.FC<DeviceListButtonGroupProps> = ({
  onSelect,
  selected: _selected,
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
          className="hover:!bg-blue-50"
        >
          <DeviceIconDecider icon={icon} />
        </Button>
      ))}
    </div>
  )
}
