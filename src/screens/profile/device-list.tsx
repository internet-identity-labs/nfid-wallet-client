import clsx from "clsx"
import React from "react"

import { PlusIcon } from "frontend/design-system/atoms/icons/plus"
import { H5 } from "frontend/design-system/atoms/typography"
import { List } from "frontend/design-system/molecules/list"
import { Device } from "frontend/services/identity-manager/devices/state"

import { DeviceListItem } from "./device-list-item"

interface DeviceListProps {
  devices: Device[]
  onDeviceUpdateDevice: (device: Device) => Promise<void>
  onDeviceDelete: (device: Device) => Promise<void>
}

export const DeviceList: React.FC<DeviceListProps> = ({
  devices,
  onDeviceUpdateDevice,
  onDeviceDelete,
}) => {
  return (
    <div className={clsx("px-5 md:px-16 pt-4", "bg-white flex-1")}>
      <List>
        <List.Header>
          <div className="flex items-center justify-between mb-3">
            <H5>Devices</H5>

            <div className="hidden">
              <PlusIcon className="text-blue-base mr-[14px]" />
            </div>
          </div>
        </List.Header>
        <List.Items className="ml-0">
          {devices.map((device) => (
            <DeviceListItem
              key={device.label}
              device={device}
              onDeviceUpdate={onDeviceUpdateDevice}
              onDelete={onDeviceDelete}
            />
          ))}
        </List.Items>
      </List>
    </div>
  )
}
