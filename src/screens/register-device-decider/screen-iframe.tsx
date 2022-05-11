import { blobFromHex } from "@dfinity/candid"
import React from "react"

import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { RegisterDeviceDecider } from "frontend/screens/register-device-decider"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"

import { useMessageChannel } from "../authorize-app-unknown-device/hooks/use-message-channel"
import { useUnknownDeviceConfig } from "../authorize-app-unknown-device/hooks/use-unknown-device.config"

interface RegisterDeviceDeciderProps {}

export const IFrameRegisterDeviceDecider: React.FC<
  RegisterDeviceDeciderProps
> = () => {
  const { handleRegisterDevice, userNumber, handleSendDelegate } =
    useUnknownDeviceConfig()

  const { identityManager } = useAuthentication()
  const { createDevice } = useDevices()
  const { getPersona } = usePersona()
  const { readAccount } = useAccount()

  const handleNewDevice = React.useCallback(
    async (event) => {
      if (!userNumber) throw new Error("No userNumber found")

      const { publicKey: pubKey } = event.data.device

      await createDevice({
        ...event.data.device,
        userNumber,
      })

      const allDevices = await IIConnection.lookupAll(BigInt(userNumber))
      const publicKey = Array.from(blobFromHex(pubKey)).toString()
      const matchDevice = allDevices.find((item) => {
        return item.pubkey.toString() === publicKey
      })
      if (!matchDevice) throw new Error("Device creation failed")

      await Promise.all([readAccount(identityManager), getPersona()])

      handleSendDelegate()
    },
    [
      createDevice,
      getPersona,
      handleSendDelegate,
      identityManager,
      readAccount,
      userNumber,
    ],
  )
  useMessageChannel({
    messageHandler: {
      "new-device": handleNewDevice,
    },
  })

  return (
    <IFrameScreen logo>
      <RegisterDeviceDecider
        onRegister={handleRegisterDevice}
        onLogin={handleSendDelegate}
        iframe
      />
    </IFrameScreen>
  )
}
