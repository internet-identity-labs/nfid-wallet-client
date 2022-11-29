import { fromHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import React, { useCallback, useState } from "react"
import { toast } from "react-toastify"

import { IIAuthAddRemoteDevice } from "@nfid-frontend/ui"

import { useDeviceInfo } from "frontend/integration/device"
import {
  useDevices,
  WebAuthnDevice,
} from "frontend/integration/identity-manager/devices/hooks"
import { derFromPubkey } from "frontend/integration/internet-identity/utils"
import {
  addTentativeDevice,
  TentativeDeviceResponse,
} from "frontend/integration/signin"

interface IIAuthAddRemoteDeviceProps {
  onCancel: () => void
  onSuccess: (data: string) => void
  assignDevice: (data: WebAuthnDevice) => void
  anchor: number
}

export const IIAuthAddTentativeDevice: React.FC<IIAuthAddRemoteDeviceProps> = ({
  onCancel,
  onSuccess,
  anchor,
  assignDevice,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { newDeviceName } = useDeviceInfo()
  const { createWebAuthNDevice } = useDevices()

  const onRetry = useCallback(async () => {
    try {
      setIsLoading(true)

      const { device } = await createWebAuthNDevice(BigInt(anchor))
      assignDevice(device)

      const pub_key = fromHexString(device.publicKey)

      const addedTentativelyDeviceResponse: TentativeDeviceResponse =
        await addTentativeDevice(
          derFromPubkey(Array.from(new Uint8Array(pub_key))),
          newDeviceName,
          BigInt(anchor),
          fromHexString(device.rawId),
        )

      onSuccess(addedTentativelyDeviceResponse.verificationCode)
      // FIXME Not possible to add :{ message: string }
    } catch (e: any) {
      toast.warn(e?.message)
      console.log({ e })
    } finally {
      setIsLoading(false)
    }
  }, [anchor, assignDevice, createWebAuthNDevice, newDeviceName, onSuccess])

  return (
    <IIAuthAddRemoteDevice
      onCancel={onCancel}
      onRetry={onRetry}
      anchor={anchor}
      isLoading={isLoading}
    />
  )
}
