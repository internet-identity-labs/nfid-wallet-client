import { blobFromHex, blobFromUint8Array } from "@dfinity/candid"
import React from "react"

import { CONFIG } from "frontend/config"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { retryGetDelegation } from "frontend/services/internet-identity/auth"
import { PublicKey } from "frontend/services/internet-identity/generated/internet_identity_types"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import { usePubSubChannel } from "frontend/services/pub-sub-channel/use-pub-sub-channel"

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

export const useRegisterDevicePromt = () => {
  const { userNumber } = useAccount()
  const { internetIdentity, chain, sessionKey } = useAuthentication()
  const { createTopic, postMessages } = usePubSubChannel()

  const createRemoteDelegate = React.useCallback(
    async (secret: string, scope: string, connection: IIConnection) => {
      if (!userNumber) {
        throw new Error("Device not registered")
      }
      const blobReverse = blobFromHex(secret)
      const sessionKey = Array.from(blobFromUint8Array(blobReverse))
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
      if (!internetIdentity) {
        throw new Error("Unauthorized")
      }

      const protocol = CONFIG.FRONTEND_MODE === "production" ? "https" : "http"

      const scope = persona_id
        ? `${persona_id}@${protocol}://${hostname}`
        : hostname

      const parsedSignedDelegation = await createRemoteDelegate(
        secret,
        scope,
        internetIdentity,
      )

      const message = JSON.stringify({
        type: "remote-login-register",
        userNumber: userNumber.toString(),
        nfid: { chain, sessionKey },
        ...parsedSignedDelegation,
      })

      const response = await postMessages(secret, [message])

      return response
    },
    [
      userNumber,
      internetIdentity,
      createRemoteDelegate,
      chain,
      sessionKey,
      postMessages,
    ],
  )

  const sendWaitForUserInput = React.useCallback(
    async (secret) => {
      console.log(">> sendWaitForUserInput", { secret })

      const message = JSON.stringify({
        type: "remote-login-wait-for-user",
      })
      await createTopic(secret)
      await postMessages(secret, [message])
    },
    [createTopic, postMessages],
  )

  return { remoteLogin, sendWaitForUserInput }
}
