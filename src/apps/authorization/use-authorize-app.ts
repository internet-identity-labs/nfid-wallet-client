import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"
import React from "react"

import {
  useAuthentication,
  User,
} from "frontend/apps/authentication/use-authentication"
import { useAccount } from "frontend/comm/services/identity-manager/account/hooks"
import { getScope } from "frontend/comm/services/identity-manager/persona/utils"
import { retryGetDelegation } from "frontend/comm/services/internet-identity/auth"
import { IIConnection } from "frontend/comm/services/internet-identity/iiConnection"
import {
  buildSerializableSignedDelegation,
  fetchDelegation,
  getSessionKey,
} from "frontend/integration/internet-identity/identity"
import {
  buildRemoteLoginRegisterMessage,
  buildRemoteNFIDLoginRegisterMessage,
  createTopic,
  postMessages,
  WAIT_FOR_CONFIRMATION_MESSAGE,
} from "frontend/integration/pubsub"

declare const FRONTEND_MODE: string

// Alias: useRegisterDevicePrompt
export const useAuthorizeApp = () => {
  const { userNumber } = useAccount()
  const { user } = useAuthentication()

  const remoteLogin = React.useCallback(
    async ({
      secret,
      scope: hostname,
      derivationOrigin,
      persona_id,
      userNumberOverwrite,
      chain,
      sessionKey,
    }: {
      secret: string
      scope: string
      derivationOrigin?: string
      persona_id: string
      chain: DelegationChain
      sessionKey: Ed25519KeyIdentity
      userNumberOverwrite?: bigint
    }) => {
      const anchor = userNumber || userNumberOverwrite
      if (!anchor) {
        throw new Error("userNumber missing")
      }

      const scope = getScope(derivationOrigin ?? hostname, persona_id)

      const delegation = await fetchDelegation(
        anchor,
        scope,
        getSessionKey(secret),
      )

      const message = buildRemoteLoginRegisterMessage(
        anchor,
        chain,
        sessionKey,
        buildSerializableSignedDelegation(...delegation),
      )

      const response = await postMessages(secret, [message])

      return response
    },
    [userNumber],
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

      const message = buildRemoteNFIDLoginRegisterMessage(
        anchor,
        userState.chain,
        userState.sessionKey,
      )

      const response = await postMessages(secret, [message])

      return response
    },
    [user, userNumber],
  )

  const sendWaitForUserInput = React.useCallback(async (secret) => {
    const message = JSON.stringify(WAIT_FOR_CONFIRMATION_MESSAGE)
    await createTopic(secret)
    await postMessages(secret, [message])
  }, [])

  return { remoteLogin, remoteNFIDLogin, sendWaitForUserInput }
}
