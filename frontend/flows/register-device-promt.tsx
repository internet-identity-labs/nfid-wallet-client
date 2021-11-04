import { blobFromHex, blobFromUint8Array } from "@dfinity/candid"
import clsx from "clsx"
import { apiResultToLoginResult } from "frontend/ii-utils/api-result-to-login-result"
import { retryGetDelegation } from "frontend/ii-utils/auth"
import { IIConnection } from "frontend/ii-utils/iiConnection"
import { Button } from "frontend/ui-utils/atoms/button"
import React from "react"
import { useParams } from "react-router-dom"

const useRegisterDevicePromt = () => {
  const login = React.useCallback(async (secret, scope) => {
    // TODO: load userNumber from localStorage
    const userNumber = BigInt(10000)
    const response = await IIConnection.login(userNumber)
    const result = apiResultToLoginResult(response)
    console.log(">> ", { result })

    if (result.tag !== "ok") {
      console.error(result)
      return { ...result, status_code: 400 }
    }

    const blobReverse = blobFromHex(secret)
    const sessionKey = Array.from(blobFromUint8Array(blobReverse))
    const prepRes = await result.connection.prepareDelegation(
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
      result.connection,
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
    return await result.connection.putDelegate(
      secret,
      JSON.stringify(parsedSignedDelegation),
    )
  }, [])

  return { login }
}

interface RegisterDevicePromptProps {}

export const RegisterDevicePrompt: React.FC<RegisterDevicePromptProps> = () => {
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState("")
  const [isLoading, setIsloading] = React.useState(false)
  let { secret, scope } = useParams<{ secret: string; scope: string }>()
  const { login } = useRegisterDevicePromt()
  console.log(">> ", { secret, scope })

  const handleLogin = React.useCallback(async () => {
    console.log(">> handleLogin", {})

    // setIsloading(true)
    const response = await login(secret, scope)
    console.log(">> ", { response })
    // setIsloading(false)
  }, [login, secret, scope])

  const notImplemented = React.useCallback(() => {
    console.warn("Not yet implemented")
  }, [])

  return (
    <div className="p-4">
      <div className={clsx("py-10")}>
        <h1 className={clsx("text-center font-bold text-3xl")}>
          Go Password-less?
        </h1>
        <div>Is this your MacBook Pro?</div>
        <div className={clsx("pt-3 flex flex-row space-x-3")}>
          <Button onClick={notImplemented}>Yes</Button>
          <Button onClick={notImplemented}>No</Button>
        </div>
        <div>
          Does anyone else have the password or registred with Touch ID on this
          computer?
        </div>
        <div className={clsx("pt-3 flex flex-row space-x-3")}>
          <Button onClick={notImplemented}>Yes</Button>
          <Button onClick={notImplemented}>No</Button>
        </div>
        <p>
          Do you want to stop using usernames and passwords to register and log
          in to supported websites and applications while using Safari on your
          Mackbook Pro?
        </p>
        <div className={clsx("pt-3 flex flex-row space-x-3")}>
          <Button onClick={handleLogin}>Yes</Button>
          <Button onClick={notImplemented}>No</Button>
        </div>
      </div>
    </div>
  )
}
