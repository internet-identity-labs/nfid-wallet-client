import React from "react"
import { ListItem } from "frontend/ui-kit/src/index"
import { Chip } from "frontend/ui-kit/src/index"
import { FaKey } from "react-icons/fa"
import { MdLaptopMac } from "react-icons/md"
import { DeleteButton } from "frontend/ui-kit/src/index"
import { BiLoaderCircle } from "react-icons/bi"
import { Device } from "./state"
import { useDevices } from "./hooks"

interface DeviceItemProps {
  device: Device
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
      title={device.alias}
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
