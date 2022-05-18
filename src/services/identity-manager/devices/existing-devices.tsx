import { List } from "@internet-identity-labs/nfid-sdk-react"
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
          key={device.label}
          refresh={handleLoadDevices}
        />
      ))}
    </List>
  )
}
