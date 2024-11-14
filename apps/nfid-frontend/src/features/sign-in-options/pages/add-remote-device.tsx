import {
  fromHexString,
  toHexString,
} from "@dfinity/candid/lib/cjs/utils/buffer"
import { WebAuthnIdentity } from "@dfinity/identity"
import toaster from "packages/ui/src/atoms/toast"
import React, { useCallback, useState } from "react"

import { IIAuthAddRemoteDevice } from "@nfid-frontend/ui"
import { FrontendDelegation, requestFEDelegation } from "@nfid/integration"

import { useDeviceInfo } from "frontend/integration/device"
import { createWebAuthnIdentity } from "frontend/integration/identity"
import { WebAuthnDevice } from "frontend/integration/identity-manager/devices/hooks"
import { derFromPubkey } from "frontend/integration/internet-identity/utils"
import {
  addTentativeDevice,
  TentativeDeviceResponse,
} from "frontend/integration/signin"

interface IIAuthAddRemoteDeviceProps {
  onCancel: () => void
  onSuccess: (data: string) => void
  assignDevice: (data: WebAuthnIdentity) => void
  assignDelegation: (data: FrontendDelegation) => void
  anchor: number
}

export const IIAuthAddTentativeDevice: React.FC<IIAuthAddRemoteDeviceProps> = ({
  onCancel,
  onSuccess,
  anchor,
  assignDevice,
  assignDelegation,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { newDeviceName } = useDeviceInfo()

  const onRetry = useCallback(async () => {
    try {
      setIsLoading(true)

      // const { device } = await createWebAuthNDevice(BigInt(anchor))
      const deviceIdentity = await createWebAuthnIdentity()
      assignDevice(deviceIdentity)

      const FEDelegation = await requestFEDelegation(deviceIdentity)
      assignDelegation(FEDelegation)

      const device: WebAuthnDevice = {
        deviceName: newDeviceName,
        publicKey: toHexString(deviceIdentity.getPublicKey().toDer()),
        rawId: toHexString(deviceIdentity.rawId),
      }

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
      toaster.warn(e?.message)
      console.log({ e })
    } finally {
      setIsLoading(false)
    }
  }, [anchor, assignDelegation, assignDevice, newDeviceName, onSuccess])

  return (
    <IIAuthAddRemoteDevice
      onCancel={onCancel}
      onRetry={onRetry}
      anchor={anchor}
      isLoading={isLoading}
    />
  )
}
