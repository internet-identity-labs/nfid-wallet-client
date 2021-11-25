import { blobFromUint8Array } from "@dfinity/candid"
import {
  apiResultToLoginResult,
  LoginError,
  LoginSuccess,
} from "frontend/ii-utils/api-result-to-login-result"
import { retryGetDelegation } from "frontend/ii-utils/auth"
import { IIConnection } from "frontend/ii-utils/iiConnection"
import React from "react"
import { useMessageChannel } from "../login-unknown/hooks"

const READY_MESSAGE = {
  kind: "authorize-ready",
}
interface UseAuthenticationProps {
  userNumber?: bigint
}

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
  const [authResult, setAuthResult] = React.useState<LoginSuccess | null>(null)

  const { opener, postClientReadyMessage, postClientAuthorizeSuccessMessage } =
    useMessageChannel({
      messageHandler: {
        "authorize-client": async (event: any) => {
          if (authResult !== null) {
            setLoading(true)
            const message = event.data
            const { maxTimeToLive, sessionPublicKey } = message
            const hostname = event.origin

            const sessionKey = Array.from(blobFromUint8Array(sessionPublicKey))
            const prepRes = await authResult.connection.prepareDelegation(
              userNumber,
              hostname,
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
              hostname,
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
            postClientAuthorizeSuccessMessage(event.source, {
              parsedSignedDelegation,
              userKey,
              hostname,
            })
            setLoading(false)
          }
        },
        "registered-device": (event: any) => {
          console.log(">> TODO: make registered-device optional", {})
        },
      },
    })

  // handles the authentication of the current user
  const handleAuthenticate = React.useCallback(async () => {
    setLoading(true)
    const response = await IIConnection.login(BigInt(userNumber))
    const result = apiResultToLoginResult(response)
    if (result.tag === "err") {
      setError(result)
      setLoading(false)
    }
    if (result.tag === "ok") {
      setAuthResult(result)
      postClientReadyMessage()
    }
  }, [postClientReadyMessage, userNumber])

  // return the hooks props
  return { isLoading, opener, error, authenticate: handleAuthenticate }
}
