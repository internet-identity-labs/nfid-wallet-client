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

interface UseAuthenticationProps {
  userNumber?: number
}

const READY_MESSAGE = {
  kind: "authorize-ready",
}

const useAuthentication = ({
  userNumber = 10000,
}: UseAuthenticationProps = {}) => {
  const [isLoading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<LoginError | null>(null)
  const [authResult, setAuthResult] = React.useState<LoginSuccess | null>(null)

  const postClientReadyMessage = React.useCallback((opener) => {
    opener.postMessage(READY_MESSAGE, "*")
  }, [])

  const postClientAuthorizeSuccessMessage = React.useCallback((opener, { parsedSignedDelegation, userKey, hostname }) => {
    opener.postMessage({
      kind: "authorize-client-success",
      delegations: [parsedSignedDelegation],
      userPublicKey: Uint8Array.from(userKey),
    }, hostname)
  }, [])

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

  const login = React.useCallback(async () => {
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

  return { isLoading, error, connection: authResult, login }
}

export const Authenticate: React.FC = () => {
  const scope = "DSCVR"

  const { isLoading, login } = useAuthentication()

  return (
    <Centered>
      <div className="font-medium mb-3">Sign in to {scope} with Multipass</div>
      <div className="flex items-center" onClick={login}>
        <TouchId />
        <div className="ml-1">Continue with TouchID as Philipp</div>
      </div>
      <Loader isLoading={isLoading} />
    </Centered>
  )
}
