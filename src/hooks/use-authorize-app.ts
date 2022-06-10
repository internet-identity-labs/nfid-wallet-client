import { blobFromHex } from "@dfinity/candid"
import React from "react"

import { PublicKey } from "frontend/api/idl/internet_identity_types"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { retryGetDelegation } from "frontend/services/internet-identity/auth"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import { usePubSubChannel } from "frontend/services/pub-sub-channel/use-pub-sub-channel"

declare const FRONTEND_MODE: string

// FIXME:
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// Alias: useRegisterDevicePrompt
export const useAuthorizeApp = () => {
  const { userNumber } = useAccount()
  const { user } = useAuthentication()
  const { createTopic, postMessages } = usePubSubChannel()

  const createRemoteDelegate = React.useCallback(
    async (secret: string, scope: string, connection: IIConnection) => {
      if (!userNumber) {
        throw new Error("Device not registered")
      }
      const blobReverse = blobFromHex(secret)
      const sessionKey = Array.from(new Blob([blobReverse]))
      const prepRes = await connection.prepareDelegation(
        userNumber,
        scope,
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
        scope,
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
    async ({
      secret,
      scope: hostname,
      persona_id,
    }: {
      secret: string
      scope: string
      persona_id: string
    }) => {
      if (!userNumber) {
        throw new Error("Device not registered")
      }
      if (!user?.internetIdentity) {
        throw new Error("Unauthorized")
      }

      const protocol = FRONTEND_MODE === "production" ? "https" : "http"

      const scope = persona_id
        ? `${persona_id}@${protocol}://${hostname}`
        : hostname

      const parsedSignedDelegation = await createRemoteDelegate(
        secret,
        scope,
        user.internetIdentity,
      )

      const message = JSON.stringify({
        type: "remote-login-register",
        userNumber: userNumber.toString(),
        nfid: { chain: user.chain, sessionKey: user.sessionKey },
        ...parsedSignedDelegation,
      })

      const response = await postMessages(secret, [message])

      return response
    },
    [userNumber, user, createRemoteDelegate, postMessages],
  )

  const remoteNFIDLogin = React.useCallback(
    async ({ secret }: { secret: string }) => {
      if (!userNumber) {
        throw new Error("Device not registered")
      }
      const message = JSON.stringify({
        type: "remote-nfid-login-register",
        userNumber: userNumber.toString(),
        nfid: { chain: user?.chain, sessionKey: user?.sessionKey },
      })

      const response = await postMessages(secret, [message])

      return response
    },
    [user, postMessages, userNumber],
  )

  const sendWaitForUserInput = React.useCallback(
    async (secret) => {
      const message = JSON.stringify({
        type: "remote-login-wait-for-user",
      })
      await createTopic(secret)
      await postMessages(secret, [message])
    },
    [createTopic, postMessages],
  )

  return { remoteLogin, remoteNFIDLogin, sendWaitForUserInput }
}
