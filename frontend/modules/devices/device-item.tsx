import clsx from "clsx"
import { useAuthContext } from "frontend/flows/auth-wrapper"
import { Button } from "frontend/design-system/atoms/button"
import React from "react"

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
  return (
    <div className={clsx("flex flex-row", deleting)} key={device.alias}>
      <div className={clsx("flex-1")}>{device.alias}</div>
      <Button
        className={clsx(
          "py-2 px-10",
          deleting && "animate-pulse bg-red-600 text-white",
        )}
        onClick={handleDeleteDevice}
      >
        delete
      </Button>
    </div>
  )
}
