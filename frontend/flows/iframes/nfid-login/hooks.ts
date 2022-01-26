import { blobFromUint8Array } from "@dfinity/candid"
import { atom, useAtom } from "jotai"

import {
  apiResultToLoginResult,
  LoginError,
  LoginSuccess,
} from "frontend/services/internet-identity/api-result-to-login-result"
import { retryGetDelegation } from "frontend/services/internet-identity/auth"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import React from "react"
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

const authResultAtom = atom<LoginSuccess | null>(null)
const isAuthenticatedAtom = atom((get) => get(authResultAtom) !== null)

// Custom react hook to connnect the Authenticate Component
// with the application requesting authorization
export const useAuthentication = ({
  userNumber = BigInt(10001),
}: UseAuthenticationProps = {}) => {
  // the isLoading state is used to display the astronaut
  const [isLoading, setLoading] = React.useState(false)
  // the error state is used to display potential errors
  const [error, setError] = React.useState<LoginError | null>(null)
  // the authResult state is used to store the II
  const [authResult, setAuthResult] = useAtom(authResultAtom)
  const [isAuthenticated] = useAtom(isAuthenticatedAtom)

  const [authorizationRequest, setAuthorizationRequest] = useAtom(
    authorizationRequestAtom,
  )

  const { opener, postClientReadyMessage, postClientAuthorizeSuccessMessage } =
    useMessageChannel({
      messageHandler: {
        "authorize-client": async (event: any) => {
          console.log(">> authorize-client", { event, authResult })

          if (authResult !== null) {
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
        "registered-device": (event: any) => {
          console.log(">> TODO: make registered-device optional", {})
        },
      },
    })

  const authorizeApp = React.useCallback(
    async ({ persona_id }) => {
      setLoading(true)
      if (!authorizationRequest || !authResult)
        throw new Error("client not ready")

      const { sessionPublicKey, hostname, maxTimeToLive, source } =
        authorizationRequest

      const sessionKey = Array.from(blobFromUint8Array(sessionPublicKey))
      const scope = persona_id ? `${persona_id}@${hostname}` : hostname

      const prepRes = await authResult.connection.prepareDelegation(
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
        authResult.connection,
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
      authResult,
      authorizationRequest,
      postClientAuthorizeSuccessMessage,
      userNumber,
    ],
  )

  // handles the authentication of the current user
  const handleAuthenticate = React.useCallback(async () => {
    setLoading(true)
    const response = await IIConnection.login(BigInt(userNumber))
    console.log(">> IIConnection.login", { response })
    const result = apiResultToLoginResult(response)
    console.log(">> apiResultToLoginResult", { result })

    if (result.tag === "err") {
      setError(result)
    }
    if (result.tag === "ok") {
      setAuthResult(result)
      // TODO: this needs to wait until we clicked the persona
      // postClientReadyMessage()
    }
    setLoading(false)
  }, [setAuthResult, userNumber])

  // return the hooks props
  return {
    identityManager: authResult?.identityManager,
    isAuthenticated,
    isLoading,
    opener,
    error,
    authorizationRequest,
    authorizeApp,
    authenticate: handleAuthenticate,
  }
}
