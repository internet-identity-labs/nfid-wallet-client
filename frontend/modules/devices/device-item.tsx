import { Chip, DeleteButton, ListItem } from "@identity-labs/ui"
import { useAuthContext } from "frontend/flows/auth-wrapper"
import React from "react"
import { BiLoaderCircle } from "react-icons/bi"
import { FaKey } from "react-icons/fa"
import { MdLaptopMac } from "react-icons/md"
import { Device } from "./types"

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

      // TODO: confirm that pubKeyHash argument is number[], not string?
      const pubKeyHash = device.pubKeyHash
        .split("")
        .map((char) => parseInt(char, 16))

      await connection.remove(userNumber, pubKeyHash)

      refresh()
    }
  }, [connection, device.pubKeyHash, refresh, userNumber])

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
