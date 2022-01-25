import clsx from "clsx"
import { useAuthContext } from "frontend/flows/auth-wrapper"
import React from "react"
import { ListItem } from "@identity-labs/ui"
import { Chip } from "@identity-labs/ui"
import { FaKey } from "react-icons/fa"
import { MdLaptopMac, MdPhoneAndroid } from "react-icons/md"
import { DeleteButton } from "@identity-labs/ui"
import { BiLoaderCircle } from "react-icons/bi"

interface Device {
  alias: string
  pubkey: number[]
}

interface DeviceItemProps {
  device: Device
  refresh: () => void
}

export const DeviceItem: React.FC<DeviceItemProps> = ({ device, refresh }) => {
  const [deleting, setDeleting] = React.useState(false)
  const { userNumber, connection } = useAuthContext()

  const handleDeleteDevice = React.useCallback(async () => {
    if (connection && userNumber) {
      setDeleting(true)
      await connection.remove(userNumber, device.pubkey)

      refresh()
    }
  }, [connection, device.pubkey, refresh, userNumber])

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
