import { blobFromHex, blobFromUint8Array } from "@dfinity/candid"
import { useMultipass } from "frontend/hooks/use-multipass"
import { retryGetDelegation } from "frontend/services/internet-identity/auth"
import { PublicKey } from "frontend/services/internet-identity/generated/internet_identity_types"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import { getUserNumber } from "frontend/services/internet-identity/userNumber"
import React from "react"
import { useAuthContext } from "../auth-wrapper"

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
  const { account } = useMultipass()
  const userNumber = React.useMemo(
    () => getUserNumber(account ? account.rootAnchor : null),
    [account],
  )
  const { connection } = useAuthContext()
  const { postMessages } = useMultipass()

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
      if (!connection) {
        throw new Error("Unauthorized")
      }

      const parsedSignedDelegation = await createRemoteDelegate(
        secret,
        scope,
        connection,
      )

      const message = JSON.stringify({
        type: register ? "remote-login-register" : "remote-login",
        ...parsedSignedDelegation,
        ...(register ? { userNumber: userNumber.toString() } : {}),
      })

      return await postMessages(secret, [message])
    },
    [connection, createRemoteDelegate, postMessages, userNumber],
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
