import React from "react"
import { Centered } from "frontend/ui-utils/atoms/centered"
import { useParams } from "react-router-dom"
import { useMultipass } from "frontend/hooks/use-ii-connection"

export const RegisterNewDevice = () => {
  let { secret, userNumber } =
    useParams<{ secret: string; userNumber: string }>()
  const { handleAddDevice } = useMultipass()

  const handleRegisterNewDevice = React.useCallback(async () => {
    const response = await handleAddDevice(secret, BigInt(userNumber))
    if (response.status_code === 200) {
      window.close()
    }
  }, [handleAddDevice, secret, userNumber])

  React.useEffect(() => {
    if (secret && userNumber) {
      handleRegisterNewDevice()
    }
  }, [handleRegisterNewDevice, handleAddDevice, secret, userNumber])
  return <Centered>RegisterNewDevice</Centered>
}
