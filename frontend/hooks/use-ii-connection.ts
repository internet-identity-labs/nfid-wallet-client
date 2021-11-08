import { blobToHex } from "@dfinity/candid"
import { WebAuthnIdentity } from "@dfinity/identity"
import { getBrowser, getPlatform } from "frontend/flows/register/utils"
import { creationOptions, IIConnection } from "frontend/ii-utils/iiConnection"
import React from "react"

interface NewDeviceConfirmationMessage {
  publicKey: string
  rawId: string
}

export const useMultipass = () => {
  const handleAddDevice = React.useCallback(
    async (secret: string, userNumber: bigint) => {
      const existingDevices = await IIConnection.lookupAll(userNumber)
      const identity = await WebAuthnIdentity.create({
        publicKey: creationOptions(existingDevices),
      })
      const response = await IIConnection.putDelegate(
        secret,
        JSON.stringify({
          publicKey: blobToHex(identity.getPublicKey().toDer()),
          rawId: blobToHex(identity.rawId),
          deviceName: `${getBrowser()} on ${getPlatform()}`,
        }),
      )
      return response
    },
    [],
  )

  return { handleAddDevice }
}
