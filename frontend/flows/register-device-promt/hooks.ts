import { blobFromHex, blobFromUint8Array } from "@dfinity/candid"
import { apiResultToLoginResult } from "frontend/ii-utils/api-result-to-login-result"
import { retryGetDelegation } from "frontend/ii-utils/auth"
import { IIConnection } from "frontend/ii-utils/iiConnection"
import React from "react"

export const useRegisterDevicePromt = () => {
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
