import clsx from "clsx"
import { useAuthContext } from "frontend/flows/auth-wrapper"
import { IIConnection } from "frontend/ii-utils/iiConnection"
import { Button } from "frontend/ui-utils/atoms/button"
import React from "react"

export const ExistingDevices = () => {
  const [existingDevices, setExistingDevices] = React.useState<any[]>([])
  const { userNumber, connection } = useAuthContext()

  const handleLoadDevices = React.useCallback(async () => {
    if (userNumber && connection) {
      const existingDevices = await IIConnection.lookupAll(userNumber)
      setExistingDevices(existingDevices)
    }
  }, [connection, userNumber])

  const handleDeleteDevice = React.useCallback(
    async (pubKey: number[]) => {
      if (connection && userNumber) {
        const response = await connection.remove(userNumber, pubKey)

        handleLoadDevices()
      }
    },
    [connection, handleLoadDevices, userNumber],
  )

  React.useEffect(() => {
    let timer: NodeJS.Timer
    if (connection) {
      timer = setTimeout(handleLoadDevices, 2000)
    }
    return () => clearTimeout(timer)
  }, [connection, handleLoadDevices])

  return (
    <div className={clsx("flex flex-col")}>
      <div>Existing Devices</div>
      {existingDevices.map((device) => (
        <div className={clsx("flex flex-row")} key={device.alias}>
          <div className={clsx("flex-1")}>{device.alias}</div>
          <Button onClick={() => handleDeleteDevice(device.pubkey)}>
            delete
          </Button>
        </div>
      ))}
    </div>
  )
}
