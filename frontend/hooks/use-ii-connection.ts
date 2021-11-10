import { blobToHex } from "@dfinity/candid"
import { WebAuthnIdentity } from "@dfinity/identity"
import { getBrowser, getPlatform } from "frontend/flows/register/utils"
import { creationOptions, IIConnection } from "frontend/ii-utils/iiConnection"
import React from "react"

export const useMultipass = () => {
  const handleAddDevice = React.useCallback(
    async (secret: string, userNumber: bigint) => {
      const existingDevices = await IIConnection.lookupAll(userNumber)

      const identity = await WebAuthnIdentity.create({
        publicKey: creationOptions(existingDevices),
      })
      const publicKey = identity.getPublicKey().toDer()
      await IIConnection.postMessages(secret, [
        JSON.stringify({
          publicKey,
          rawId: blobToHex(identity.rawId),
          deviceName: `${getBrowser()} on ${getPlatform()}`,
        }),
      ])
      return { publicKey }
    },
    [],
  )

  return { handleAddDevice }
}
