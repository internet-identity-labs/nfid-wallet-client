import clsx from "clsx"
import React from "react"

import { Device } from "frontend/integration/identity-manager/devices/state"
import { PlusIcon } from "frontend/ui/atoms/icons/plus"
import { H5 } from "frontend/ui/atoms/typography"
import { List } from "frontend/ui/molecules/list"

import { DeviceListItem } from "./device-list-item"

interface DeviceListProps {
  devices: Device[]
  onDeviceUpdate: (device: Device) => Promise<void>
  onDeviceDelete: (device: Device) => Promise<void>
}

export const DeviceList: React.FC<DeviceListProps> = ({
  devices,
  onDeviceUpdate,
  onDeviceDelete,
}) => {
  return (
    <div className={clsx("px-5 md:px-16 pt-8", "bg-white md:pt-16")}>
      <List>
        <List.Header>
          <div className="flex items-center justify-between mb-3">
            <H5>Authorized devices</H5>

            <div className="hidden">
              <PlusIcon className="text-blue-base mr-[14px]" />
            </div>
          </div>
        </List.Header>
        <List.Items className="ml-0">
          {devices.map((device) => (
            <DeviceListItem
              key={`${device.label}-${device.browser}-${device.lastUsed}`}
              device={device}
              onDeviceUpdate={onDeviceUpdate}
              onDelete={onDeviceDelete}
            />
          ))}
        </List.Items>
      </List>
    </div>
  )
}
