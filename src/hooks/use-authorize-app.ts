import { fromHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"
import React from "react"

import { PublicKey } from "frontend/api/idl/internet_identity_types"
import { useAuthentication, User } from "frontend/hooks/use-authentication"
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
    async (
      secret: string,
      scope: string,
      connection: IIConnection,
      userNumber: bigint,
    ) => {
      const blobReverse = fromHexString(secret)
      const sessionKey = Array.from(new Uint8Array(blobReverse))
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
    [],
  )

  const remoteLogin = React.useCallback(
    async ({
      secret,
      scope: hostname,
      persona_id,
      connection,
      userNumberOverwrite,
      chain,
      sessionKey,
    }: {
      secret: string
      scope: string
      persona_id: string
      connection: IIConnection
      chain: DelegationChain
      sessionKey: Ed25519KeyIdentity
      userNumberOverwrite?: bigint
    }) => {
      const anchor = userNumber || userNumberOverwrite
      if (!anchor) {
        throw new Error("userNumber missing")
      }

      const protocol = FRONTEND_MODE === "production" ? "https" : "http"

      const scope = persona_id
        ? `${persona_id}@${protocol}://${hostname}`
        : hostname

      const parsedSignedDelegation = await createRemoteDelegate(
        secret,
        scope,
        connection,
        anchor,
      )

      const message = JSON.stringify({
        type: "remote-login-register",
        userNumber: anchor.toString(),
        nfid: { chain, sessionKey },
        ...parsedSignedDelegation,
      })

      const response = await postMessages(secret, [message])

      return response
    },
    [userNumber, createRemoteDelegate, postMessages],
  )

  const remoteNFIDLogin = React.useCallback(
    async ({
      secret,
      userOverwrite,
      userNumberOverwrite,
    }: {
      secret: string
      userOverwrite?: User
      userNumberOverwrite?: bigint
    }) => {
      const anchor = userNumber || userNumberOverwrite
      if (!anchor) {
        throw new Error("userNumber missing")
      }
      const userState = userOverwrite || user
      if (!userState) throw Error("user missing")
      console.log(">> ", { userState })

      const message = JSON.stringify({
        type: "remote-nfid-login-register",
        userNumber: anchor.toString(),
        nfid: { chain: userState.chain, sessionKey: userState.sessionKey },
      })

      const response = await postMessages(secret, [message])

      return response
    },
    [postMessages, user, userNumber],
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
