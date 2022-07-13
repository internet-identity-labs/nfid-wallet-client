import { atom, useAtom } from "jotai"
import React from "react"

import { ii } from "frontend/comm/actors"
import { hasOwnProperty } from "frontend/comm/services/internet-identity/utils"

import { useMessageChannel } from "../../design-system/pages/remote-authorize-app-unknown-device/hooks/use-message-channel"

interface UseAuthenticationProps {
  userNumber?: bigint
}

export interface AuthRequestEvent {
  kind: "authorize-client"
  sessionPublicKey: Uint8Array
  maxTimeToLive?: bigint
  derivationOrigin?: string
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

  const [authorizationRequest, setAuthorizationRequest] = useAtom(
    authorizationRequestAtom,
  )

  const { opener, postClientReadyMessage, postClientAuthorizeSuccessMessage } =
    useMessageChannel({
      messageHandler: {
        "authorize-client": async (event: MessageEvent<AuthRequestEvent>) => {
          const message = event.data
          const { maxTimeToLive, sessionPublicKey, derivationOrigin } = message
          setAuthorizationRequest({
            maxTimeToLive,
            sessionPublicKey,
            derivationOrigin,
            hostname: event.origin,
            source: event.source,
          })
        },
      },
    })

  const authorizeApp = React.useCallback(
    async ({
      persona_id,
      anchor: rawAnchor,
    }: {
      persona_id?: string
      anchor?: string | bigint
    }) => {
      setLoading(true)

      if (!authorizationRequest) throw new Error("authorizationRequest missing")

      const { sessionPublicKey, hostname, maxTimeToLive, source } =
        authorizationRequest

      const sessionKey = Array.from(new Uint8Array(sessionPublicKey))
      const scope = persona_id ? `${persona_id}@${hostname}` : hostname

      const anchor = rawAnchor && BigInt(rawAnchor)

      const prepRes = await ii.prepare_delegation(
        anchor || userNumber,
        scope,
        sessionKey,
        maxTimeToLive !== undefined ? [maxTimeToLive] : [],
      )

      // TODO: move to error handler
      if (prepRes.length !== 2) {
        throw new Error(
          `Error preparing the delegation. Result received: ${prepRes}`,
        )
      }
      const [userKey, timestamp] = prepRes

      const res = await ii.get_delegation(
        anchor || userNumber,
        scope,
        sessionKey,
        timestamp,
      )
      if (hasOwnProperty(res, "signed_delegation")) {
        const signedDelegation = res.signed_delegation
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
      }
    },
    [authorizationRequest, postClientAuthorizeSuccessMessage, userNumber],
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
