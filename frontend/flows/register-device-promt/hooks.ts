import { blobFromHex, blobFromUint8Array } from "@dfinity/candid"
import {
  apiResultToLoginResult,
  LoginSuccess,
} from "frontend/ii-utils/api-result-to-login-result"
import { retryGetDelegation } from "frontend/ii-utils/auth"
import { PublicKey } from "frontend/ii-utils/generated/internet_identity_types"
import { IIConnection } from "frontend/ii-utils/iiConnection"
import { getUserNumber } from "frontend/ii-utils/userNumber"
import React from "react"

type RemoteLoginMessage = {
  delegation: {
    pubkey: PublicKey
    expiration: string
    target?: string
  }
  signature: number[]
  userKey: PublicKey
  userNumber?: number
}

export const useRegisterDevicePromt = () => {
  const userNumber = React.useMemo(() => getUserNumber(), [])

  const selfAuthenticate = React.useCallback(async () => {
    if (!userNumber) {
      throw new Error("Device not registered")
    }
    const response = await IIConnection.login(userNumber)
    const result = apiResultToLoginResult(response)
    return result
  }, [userNumber])

  const createRemoteDelegate = React.useCallback(
    async (secret: string, scope: string, result: LoginSuccess) => {
      if (!userNumber) {
        throw new Error("Device not registered")
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
      return parsedSignedDelegation
    },
    [userNumber],
  )

  const remoteLogin = React.useCallback(
    async ({ secret, scope, register = false }) => {
      if (!userNumber) {
        throw new Error("Device not registered")
      }

      const result = await selfAuthenticate()

      if (result.tag !== "ok") {
        console.error(result)
        return { ...result, status_code: 400 }
      }

      const parsedSignedDelegation = await createRemoteDelegate(
        secret,
        scope,
        result,
      )

      return await IIConnection.putDelegate(
        secret,
        JSON.stringify({
          ...parsedSignedDelegation,
          ...(register ? { userNumber: userNumber.toString() } : {}),
        }),
      )
    },
    [createRemoteDelegate, selfAuthenticate, userNumber],
  )

  return { remoteLogin }
}
