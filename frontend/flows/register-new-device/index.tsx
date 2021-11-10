import React from "react"
import { Centered } from "frontend/ui-utils/atoms/centered"
import { useParams } from "react-router-dom"
import { useMultipass } from "frontend/hooks/use-ii-connection"
import { Button } from "frontend/ui-utils/atoms/button"

export const RegisterNewDevice = () => {
  const [pubKey, setPubKey] = React.useState<any | null>(null)
  const [opener, setOpener] = React.useState<Window | null>(null)
  let { secret, userNumber } =
    useParams<{ secret: string; userNumber: string }>()
  const { handleAddDevice } = useMultipass()

  const handleSendDeviceKey = React.useCallback(() => {
    console.log(">> ", { pubKey, opener })

    opener?.postMessage(
      { kind: "registered-device", deviceKey: pubKey },
      opener.origin,
    )
    window.close()
  }, [opener, pubKey])

  const handleRegisterNewDevice = React.useCallback(async () => {
    // TODO:
    // send key to opender automatically
    const response = await handleAddDevice(secret, BigInt(userNumber))
    // opener?.postMessage(
    //   { kind: "registered-device", deviceKey: pubKey },
    //   opener.origin,
    // )
    setPubKey(response.publicKey)
    // handleSendDeviceKey()
    // window.close()
  }, [handleAddDevice, secret, userNumber])

  React.useEffect(() => {
    if (secret && userNumber) {
      handleRegisterNewDevice()
    }
  }, [handleRegisterNewDevice, handleAddDevice, secret, userNumber])

  const waitForOpener = React.useCallback(async () => {
    const maxTries = 5
    let interval: NodeJS.Timer
    let run: number = 0

    interval = setInterval(() => {
      if (run >= maxTries) {
        clearInterval(interval)
      }
      if (window.opener !== null) {
        setOpener(window.opener)
        clearInterval(interval)
      }
    }, 500)
  }, [])

  React.useEffect(() => {
    waitForOpener()
  }, [waitForOpener])

  return (
    <Centered>
      <div>RegisterNewDevice</div>
      <Button onClick={handleSendDeviceKey}>send pubKey</Button>
    </Centered>
  )
}
