import { List } from "frontend/ui-kit/src/index"
import React from "react"
import { DeviceItem } from "./device-item"
import { useDevices } from "./hooks"

export const ExistingDevices = () => {
  const { devices, handleLoadDevices } = useDevices()

  return (
    <List>
      {devices.map((device) => (
        <DeviceItem
          device={device}
          key={device.alias}
          refresh={handleLoadDevices}
        />
      ))}
    </List>
  )
}
