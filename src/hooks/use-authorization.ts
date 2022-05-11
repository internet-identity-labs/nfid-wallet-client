import { blobFromUint8Array } from "@dfinity/candid"
import { atom, useAtom } from "jotai"
import React from "react"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { retryGetDelegation } from "frontend/services/internet-identity/auth"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"

import { useMessageChannel } from "../screens/authorize-app-unknown-device/hooks/use-message-channel"

interface UseAuthenticationProps {
  userNumber?: bigint
}

interface AuthorizationRequest {
  maxTimeToLive: any
  sessionPublicKey: any
  hostname: string
  source: any
}

const authorizationRequestAtom = atom<AuthorizationRequest | null>(null)

// Custom react hook to connnect the Authenticate Component
// with the application requesting authorization
export const useAuthorization = ({
  userNumber = BigInt(10001),
}: UseAuthenticationProps = {}) => {
  // the isLoading state is used to display the astronaut
  const [isLoading, setLoading] = React.useState(false)
  // the authResult state is used to store the II
  const { internetIdentity } = useAuthentication()

  const [authorizationRequest, setAuthorizationRequest] = useAtom(
    authorizationRequestAtom,
  )

  const { opener, postClientReadyMessage, postClientAuthorizeSuccessMessage } =
    useMessageChannel({
      messageHandler: {
        "authorize-client": async (event: any) => {
          if (internetIdentity !== null) {
            const message = event.data
            const { maxTimeToLive, sessionPublicKey } = message

            setAuthorizationRequest({
              maxTimeToLive,
              sessionPublicKey,
              hostname: event.origin,
              source: event.source,
            })
          }
        },
      },
    })

  const authorizeApp = React.useCallback(
    async ({
      persona_id,
      anchor: rawAnchor,
      internetIdentityForAnchor,
    }: {
      persona_id?: string
      anchor?: string
      internetIdentityForAnchor?: IIConnection
    }) => {
      const internetIdentityService =
        internetIdentityForAnchor || internetIdentity
      setLoading(true)

      if (!authorizationRequest || !internetIdentityService)
        throw new Error("client not ready")

      const { sessionPublicKey, hostname, maxTimeToLive, source } =
        authorizationRequest

      const sessionKey = Array.from(blobFromUint8Array(sessionPublicKey))
      const scope = persona_id ? `${persona_id}@${hostname}` : hostname

      const anchor = rawAnchor && BigInt(rawAnchor)

      const prepRes = await internetIdentityService.prepareDelegation(
        anchor || userNumber,
        scope,
        sessionKey,
        maxTimeToLive,
      )
      // TODO: move to error handler
      if (prepRes.length !== 2) {
        throw new Error(
          `Error preparing the delegation. Result received: ${prepRes}`,
        )
      }
      const [userKey, timestamp] = prepRes

      const signedDelegation = await retryGetDelegation(
        internetIdentityService,
        anchor || userNumber,
        scope,
        sessionKey,
        timestamp,
      )

      // Parse the candid SignedDelegation into a format that `DelegationChain` understands.
      const parsedSignedDelegation = {
        delegation: {
          pubkey: Uint8Array.from(signedDelegation.delegation.pubkey),
          expiration: BigInt(signedDelegation.delegation.expiration),
          targets: undefined,
        },
        signature: Uint8Array.from(signedDelegation.signature),
      }
      postClientAuthorizeSuccessMessage(source, {
        parsedSignedDelegation,
        userKey,
        hostname,
      })
      setLoading(false)
    },
    [
      authorizationRequest,
      internetIdentity,
      postClientAuthorizeSuccessMessage,
      userNumber,
    ],
  )

  // return the hooks props
  return {
    isLoading,
    opener,
    authorizationRequest,
    postClientReadyMessage,
    authorizeApp,
  }
}
