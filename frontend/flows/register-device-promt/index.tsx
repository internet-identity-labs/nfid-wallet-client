import { blobFromHex, blobFromUint8Array } from "@dfinity/candid"
import clsx from "clsx"
import { apiResultToLoginResult } from "frontend/ii-utils/api-result-to-login-result"
import { retryGetDelegation } from "frontend/ii-utils/auth"
import { IIConnection } from "frontend/ii-utils/iiConnection"
import { Button } from "frontend/ui-utils/atoms/button"
import { Loader } from "frontend/ui-utils/atoms/loader"
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
  const [status, setStatus] = React.useState<
    "initial" | "loading" | "success" | "error"
  >("initial")
  let { secret, scope } = useParams<{ secret: string; scope: string }>()
  const { login } = useRegisterDevicePromt()

  const handleLogin = React.useCallback(async () => {
    setStatus("loading")
    const response = await login(secret, scope)
    if (response.status_code === 200) {
      return setStatus("success")
    }
    setStatus("error")
  }, [login, secret, scope])

  const notImplemented = React.useCallback(() => {
    console.warn("Not yet implemented")
  }, [])

  return (
    <div className={clsx("p-4 py-10 flex flex-col h-4/5")}>
      <h1 className={clsx("text-center font-bold text-3xl")}>
        Go Password-less?
      </h1>
      {status === "success" && (
        <div className="flex flex-col items-center">Success</div>
      )}
      {status === "error" && (
        <div className="flex flex-col items-center">Something went wrong</div>
      )}
      {(status === "initial" || status === "loading") && (
        <>
          {/* <div>Is this your MacBook Pro?</div>
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
        </div> */}
          <div className={clsx("flex-grow")} />
          <p>
            Do you want to stop using usernames and passwords to register and
            log in to supported websites and applications while using Safari on
            your Mackbook Pro?
          </p>
          <div className={clsx("pt-3 flex flex-row space-x-3 justify-center")}>
            <Button onClick={handleLogin}>Yes</Button>
            <Button onClick={notImplemented}>No</Button>
          </div>
          <Loader isLoading={status === "loading"} />
        </>
      )}
    </div>
  )
}
