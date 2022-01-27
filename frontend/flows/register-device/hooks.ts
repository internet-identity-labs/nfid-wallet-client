import { blobFromHex, blobFromUint8Array } from "@dfinity/candid"
import { useMultipass } from "frontend/hooks/use-multipass"
import { retryGetDelegation } from "frontend/services/internet-identity/auth"
import { PublicKey } from "frontend/services/internet-identity/generated/internet_identity_types"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import { usePubSubChannel } from "frontend/services/pub-sub-channel/use-pub-sub-channel"
import React from "react"
import { useAuthentication } from "../auth-wrapper"

type RemoteLoginMessage = {
  delegation: {
    pubkey: PublicKey
    expiration: string
    target?: string
  }
  signature: number[]
  userKey: PublicKey
  userNumber?: number
}

export const useRegisterDevicePromt = () => {
  const { userNumber } = useMultipass()
  const { internetIdentity } = useAuthentication()
  const { postMessages } = usePubSubChannel()

  const createRemoteDelegate = React.useCallback(
    async (secret: string, scope: string, connection: IIConnection) => {
      if (!userNumber) {
        throw new Error("Device not registered")
      }
      const blobReverse = blobFromHex(secret)
      const sessionKey = Array.from(blobFromUint8Array(blobReverse))
      const prepRes = await connection.prepareDelegation(
        userNumber,
        // TODO: find better way to handle protocol
        `https://${scope}`,
        sessionKey,
      )
      // TODO: move to error handler
      if (prepRes.length !== 2) {
        throw new Error(
          `Error preparing the delegation. Result received: ${prepRes}`,
        )
      }
      const [userKey, timestamp] = prepRes

      const signedDelegation = await retryGetDelegation(
        connection,
        userNumber,
        // TODO: find better way to handle protocol
        `https://${scope}`,
        sessionKey,
        timestamp,
      )

      // Parse the candid SignedDelegation into a format that `DelegationChain` understands.
      const parsedSignedDelegation = {
        delegation: {
          pubkey: signedDelegation.delegation.pubkey,
          expiration: signedDelegation.delegation.expiration.toString(),
          targets: undefined,
        },
        signature: signedDelegation.signature,
        userKey,
      }
      return parsedSignedDelegation
    },
    [userNumber],
  )

  const remoteLogin = React.useCallback(
    async ({ secret, scope, register = false }) => {
      if (!userNumber) {
        throw new Error("Device not registered")
      }
      if (!internetIdentity) {
        throw new Error("Unauthorized")
      }

      const parsedSignedDelegation = await createRemoteDelegate(
        secret,
        scope,
        internetIdentity,
      )

      const message = JSON.stringify({
        type: register ? "remote-login-register" : "remote-login",
        ...parsedSignedDelegation,
        ...(register ? { userNumber: userNumber.toString() } : {}),
      })

      return await postMessages(secret, [message])
    },
    [internetIdentity, createRemoteDelegate, postMessages, userNumber],
  )

  const sendWaitForUserInput = React.useCallback(
    async (secret) => {
      const message = JSON.stringify({
        type: "remote-login-wait-for-user",
      })
      console.log(">> sendWaitForUserInput", { secret, message })

      const response = await postMessages(secret, [message])
    },
    [postMessages],
  )

  return { remoteLogin, sendWaitForUserInput }
}
