import {
  PublicKey,
  SignedDelegation,
} from "frontend/integration/idl/internet_identity_types"

import { IIConnection } from "./iiConnection"
import { hasOwnProperty } from "./utils"

export const retryGetDelegation = async (
  connection: IIConnection,
  userNumber: bigint,
  hostname: string,
  sessionKey: PublicKey,
  timestamp: bigint,
  maxRetries = 5,
): Promise<SignedDelegation> => {
  for (let i = 0; i < maxRetries; i++) {
    // Linear backoff
    await new Promise((resolve) => {
      setInterval(resolve, 1000 * i)
    })
    const res = await connection.getDelegation(
      userNumber,
      hostname,
      sessionKey,
      timestamp,
    )
    if (hasOwnProperty(res, "signed_delegation")) {
      return res.signed_delegation
    }
  }
  throw new Error(
    `Failed to retrieve a delegation after ${maxRetries} retries.`,
  )
}
