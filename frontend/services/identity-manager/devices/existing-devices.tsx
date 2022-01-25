import clsx from "clsx"
import { List } from "@identity-labs/ui"
import { useAuthContext } from "frontend/flows/auth-wrapper"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import React from "react"
import { DeviceItem } from "./device-item"

export const ExistingDevices = () => {
  const [existingDevices, setExistingDevices] = React.useState<any[]>([])
  const { userNumber, connection } = useAuthContext()

  const handleLoadDevices = React.useCallback(async () => {
    if (userNumber && connection) {
      const existingDevices = await IIConnection.lookupAll(userNumber)
      setExistingDevices(existingDevices)
    }
  }, [connection, userNumber])

  React.useEffect(() => {
    let timer: NodeJS.Timer
    if (connection) {
      timer = setInterval(handleLoadDevices, 2000)
    }
    return () => clearInterval(timer)
  }, [connection, handleLoadDevices])

  return (
    <List>
      {existingDevices.map((device) => (
        <DeviceItem
          device={device}
          key={device.alias}
          refresh={handleLoadDevices}
        />
      ))}
    </List>
  )
}
