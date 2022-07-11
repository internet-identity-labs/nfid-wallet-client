import { fromHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"
import React from "react"

import { SignedDelegation } from "frontend/design-system/pages/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"

import {
  useAuthentication,
  User,
} from "frontend/apps/authentication/use-authentication"
import { useAccount } from "frontend/integration/services/identity-manager/account/hooks"
import { getScope } from "frontend/integration/services/identity-manager/persona/utils"
import { retryGetDelegation } from "frontend/integration/services/internet-identity/auth"
import { IIConnection } from "frontend/integration/services/internet-identity/iiConnection"
import { usePubSubChannel } from "frontend/integration/services/pub-sub-channel/use-pub-sub-channel"

declare const FRONTEND_MODE: string

export interface RemoteLoginEvent extends SignedDelegation {
  type: "remote-login-register"
  userNumber: string
  nfid: {
    chain: DelegationChain
    sessionKey: Ed25519KeyIdentity
  }
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
    ): Promise<SignedDelegation> => {
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
      derivationOrigin,
      persona_id,
      connection,
      userNumberOverwrite,
      chain,
      sessionKey,
    }: {
      secret: string
      scope: string
      derivationOrigin?: string
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

      const scope = getScope(derivationOrigin ?? hostname, persona_id)

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
      } as RemoteLoginEvent)

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
    async (secret: string) => {
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
