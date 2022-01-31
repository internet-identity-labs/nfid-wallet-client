import { atom, useAtom } from "jotai"
import React from "react"
import { blobFromUint8Array } from "@dfinity/candid"

import { useAuthentication } from "frontend/flows/auth-wrapper"
import { LoginError } from "frontend/services/internet-identity/api-result-to-login-result"
import { retryGetDelegation } from "frontend/services/internet-identity/auth"
import { useMessageChannel } from "../login-unknown/hooks"

const READY_MESSAGE = {
  kind: "authorize-ready",
}
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
  // the error state is used to display potential errors
  const [error, setError] = React.useState<LoginError | null>(null)
  // the authResult state is used to store the II
  const { internetIdentity, login } = useAuthentication()

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
    async ({ persona_id }) => {
      setLoading(true)
      if (!authorizationRequest || !internetIdentity)
        throw new Error("client not ready")

      const { sessionPublicKey, hostname, maxTimeToLive, source } =
        authorizationRequest

      const sessionKey = Array.from(blobFromUint8Array(sessionPublicKey))
      const scope = persona_id ? `${persona_id}@${hostname}` : hostname

      const prepRes = await internetIdentity.prepareDelegation(
        userNumber,
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
        internetIdentity,
        userNumber,
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

  // handles the authentication of the current user
  const handleAuthenticate = React.useCallback(async () => {
    setLoading(true)
    await login()
    postClientReadyMessage()
    setLoading(false)
  }, [login, postClientReadyMessage])

  // return the hooks props
  return {
    isLoading,
    opener,
    error,
    authorizationRequest,
    authorizeApp,
    authenticate: handleAuthenticate,
  }
}
