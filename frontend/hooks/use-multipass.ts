import { blobToHex } from "@dfinity/candid"
import { WebAuthnIdentity } from "@dfinity/identity"
import { useAuthentication } from "frontend/flows/auth-wrapper"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { getProofOfWork } from "frontend/services/internet-identity/crypto/pow"
import {
  canisterIdPrincipal as iiCanisterIdPrincipal,
  creationOptions,
  IIConnection,
} from "frontend/services/internet-identity/iiConnection"
import { usePubSubChannel } from "frontend/services/pub-sub-channel/use-pub-sub-channel"
import { getBrowser, getPlatform } from "frontend/utils"
import React from "react"
import { useSearchParams } from "react-router-dom"

export const useMultipass = () => {
  const { identityManager } = useAuthentication()
  const [params] = useSearchParams()

  const { postMessages, getMessages, createTopic, deleteTopic } =
    usePubSubChannel()

  const createWebAuthNIdentity = React.useCallback(async () => {
    const deviceName = `${getBrowser()} on ${getPlatform()}`
    const identity = await WebAuthnIdentity.create({
      publicKey: creationOptions(),
    })
    const now_in_ns = BigInt(Date.now()) * BigInt(1000000)
    const pow = getProofOfWork(now_in_ns, iiCanisterIdPrincipal)

    return { identity: JSON.stringify(identity.toJSON()), deviceName, pow }
  }, [])

  const handleAddDevice = React.useCallback(
    async (secret: string, userNumber: bigint) => {
      const existingDevices = await IIConnection.lookupAll(userNumber)

      const identity = await WebAuthnIdentity.create({
        publicKey: creationOptions(existingDevices),
      })
      const publicKey = identity.getPublicKey().toDer()
      const message = JSON.stringify({
        publicKey,
        rawId: blobToHex(identity.rawId),
        deviceName: `${getBrowser()} on ${getPlatform()}`,
      })

      await postMessages(secret, [message])
      return { publicKey }
    },
    [postMessages],
  )

  return {
    ...useAccount(identityManager),
    ...usePersona({ personaService: identityManager }),
    createWebAuthNIdentity,
    handleAddDevice,
    createTopic,
    deleteTopic,
    getMessages,
    postMessages,
    applicationName: params.get("applicationName"),
  }
}
