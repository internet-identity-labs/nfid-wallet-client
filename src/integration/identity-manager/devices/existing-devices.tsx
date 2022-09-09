import React from "react"

import { List } from "frontend/ui/molecules/list"

import { DeviceItem } from "./device-item"
import { useDevices } from "./hooks"

export const ExistingDevices = () => {
  const { devices, handleLoadDevices } = useDevices()

  return (
    <List>
      {devices.map((device) => (
        <DeviceItem
          device={device}
          key={device.label}
          refresh={handleLoadDevices}
        />
      ))}
    </List>
  )
}
