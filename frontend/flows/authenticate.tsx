import { blobFromUint8Array } from "@dfinity/candid"
import {
  apiResultToLoginResult,
  LoginError,
  LoginSuccess,
} from "frontend/ii-utils/api-result-to-login-result"
import { retryGetDelegation } from "frontend/ii-utils/auth"
import { IIConnection } from "frontend/ii-utils/iiConnection"
import { Centered } from "frontend/ui-utils/atoms/centered"
import { TouchId } from "frontend/ui-utils/atoms/icons/touch-id"
import { Loader } from "frontend/ui-utils/atoms/loader"
import React from "react"

const READY_MESSAGE = {
  kind: "authorize-ready",
}
interface UseAuthenticationProps {
  userNumber?: number
}

// Custom react hook to connnect the Authenticate Component
// with the application requesting authorization
const useAuthentication = ({
  userNumber = 10000,
}: UseAuthenticationProps = {}) => {
  // the isLoading state is used to display the astronaut
  const [isLoading, setLoading] = React.useState(false)
  // the error state is used to display potential errors
  const [error, setError] = React.useState<LoginError | null>(null)
  // the authResult state is used to store the II
  const [authResult, setAuthResult] = React.useState<LoginSuccess | null>(null)

  // Sends the opening message to the requesting application (e.g. DSCVR)
  const postClientReadyMessage = React.useCallback((opener) => {
    opener.postMessage(READY_MESSAGE, "*")
  }, [])

  // Sends the succees message and the delegate to the requesting application (e.g. DSCVR)
  const postClientAuthorizeSuccessMessage = React.useCallback((opener, { parsedSignedDelegation, userKey, hostname }) => {
    opener.postMessage({
      kind: "authorize-client-success",
      delegations: [parsedSignedDelegation],
      userPublicKey: Uint8Array.from(userKey),
    }, hostname)
  }, [])

  // event handler for the message send from the requesting application (e.g. DSCVR)
  const handleAuthMessage = React.useCallback(async (event) => {
    const message = event.data
    if (message.kind === "authorize-client") {
      if (authResult !== null) {
        setLoading(true)

        const { maxTimeToLive, sessionPublicKey } = message
        const bigUserNumber = BigInt(userNumber)
        const hostname = event.origin

        const sessionKey = Array.from(blobFromUint8Array(sessionPublicKey));
        const prepRes = await authResult.connection.prepareDelegation(
          bigUserNumber,
          hostname,
          sessionKey,
          maxTimeToLive
        );
        // TODO: move to error handler
        if (prepRes.length !== 2) {
          throw new Error(
            `Error preparing the delegation. Result received: ${prepRes}`
          );
        }
        const [userKey, timestamp] = prepRes;

        const signedDelegation = await retryGetDelegation(
          authResult.connection,
          bigUserNumber,
          hostname,
          sessionKey,
          timestamp
        );

        // Parse the candid SignedDelegation into a format that `DelegationChain` understands.
        const parsedSignedDelegation = {
          delegation: {
            pubkey: Uint8Array.from(signedDelegation.delegation.pubkey),
            expiration: BigInt(signedDelegation.delegation.expiration),
            targets: undefined,
          },
          signature: Uint8Array.from(signedDelegation.signature),
        };
        postClientAuthorizeSuccessMessage(event.source, { parsedSignedDelegation, userKey, hostname })
        setLoading(false)
      }
    }
  }, [authResult, postClientAuthorizeSuccessMessage, userNumber])

  // polls for `window.opener` and when received sends the ready message to the
  // requesting application
  const handleAuthorizationReady = React.useCallback(() => {
    const maxTries = 5
    let interval: NodeJS.Timer
    let run: number = 0

    interval = setInterval(() => {
      if (run >= maxTries) {
        clearInterval(interval)
        setError({
          tag: "err",
          title: "failed to establish connection",
          message: "could communicate with requesting app",
        })
      }
      if (window.opener !== null) {
        postClientReadyMessage(window.opener)
        clearInterval(interval)
      }
    }, 500)
  }, [postClientReadyMessage])

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
      handleAuthorizationReady()
    }
  }, [handleAuthorizationReady, userNumber])

  // SETUP MESSAGE BUS WITH REQUESTING APPLICATION
  React.useEffect(() => {
    window.addEventListener("message", handleAuthMessage)
    return () => window.removeEventListener("message", handleAuthMessage)
  }, [handleAuthMessage])

  return { isLoading, error, connection: authResult, authenticate: handleAuthenticate }
}

export const Authenticate: React.FC = () => {
  // TODO: pull scope from backend or locastorage
  const scope = "DSCVR"

  const { isLoading, authenticate } = useAuthentication()

  return (
    <Centered>
      <div className="font-medium mb-3">Sign in to {scope} with Multipass</div>
      <div className="flex items-center" onClick={authenticate}>
        <TouchId />
        <div className="ml-1">Continue with TouchID as Philipp</div>
      </div>
      <Loader isLoading={isLoading} />
    </Centered>
  )
}
