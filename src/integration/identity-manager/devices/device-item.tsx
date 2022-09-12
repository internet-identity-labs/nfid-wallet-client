import React from "react"
import { BiLoaderCircle } from "react-icons/bi"
import { FaKey } from "react-icons/fa"
import { MdLaptopMac } from "react-icons/md"

import { DeleteButton } from "frontend/ui/atoms/button/delete-button"
import { Chip } from "frontend/ui/atoms/chip"
import { ListItem } from "frontend/ui/molecules/list/list-item"

import { useDevices } from "./hooks"
import { LegacyDevice } from "./state"

interface DeviceItemProps {
  device: LegacyDevice
  refresh: () => void
}

export const DeviceItem: React.FC<DeviceItemProps> = ({ device, refresh }) => {
  const [deleting, setDeleting] = React.useState(false)
  const { deleteDevice } = useDevices()

  const handleDeleteDevice = React.useCallback(async () => {
    setDeleting(true)
    await deleteDevice(device.pubkey)
    setDeleting(false)
  }, [deleteDevice, device.pubkey])

  const deviceType = () => {
    // TODO: switch on device type
    return <MdLaptopMac className="text-xl text-gray-600" />
  }

  return (
    <ListItem
      title={device.label}
      subtitle={
        <div className="flex flex-row flex-wrap gap-x-1">
          <Chip icon={<FaKey />} dense>
            Chrome
            {/* <BiLoaderCircle className={clsx("ml-2 animate-spin")} /> */}
          </Chip>
          <Chip icon={<FaKey />} dense>
            Edge
            {/* <BiLoaderCircle className={clsx("ml-2 animate-spin")} /> */}
          </Chip>
        </div>
      }
      icon={deviceType()}
      action={
        deleting ? (
          <BiLoaderCircle className="animate-spin" />
        ) : (
          <DeleteButton onClick={handleDeleteDevice} />
        )
      }
    />
  )
}
