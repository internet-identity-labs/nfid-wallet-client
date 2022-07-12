import { fromHexString } from "@dfinity/candid/lib/cjs/utils/buffer"

import {
  PublicKey,
  SessionKey,
  SignedDelegation,
} from "frontend/comm/idl/internet_identity_types"
import { retryGetDelegation } from "frontend/comm/services/internet-identity/auth"
import { IIConnection } from "frontend/comm/services/internet-identity/iiConnection"

/**
 * @deprecated: no need to use the session key as secret
 *
 * @export
 * @param {string} secret
 * @return {*}
 */
export function getSessionKey(secret: string) {
  const blobReverse = fromHexString(secret)
  const sessionKey = Array.from(new Uint8Array(blobReverse))
  return sessionKey
}

/**
 * fetches the third party delegation
 *
 * @export
 * @param {IIConnection} connection
 * @param {bigint} anchor
 * @param {string} scope
 * @param {SessionKey} sessionKey
 * @return {*}
 */
export async function fetchDelegation(
  connection: IIConnection,
  anchor: bigint,
  scope: string,
  sessionKey: SessionKey,
): Promise<[PublicKey, SignedDelegation]> {
  const prepRes = await connection.prepareDelegation(anchor, scope, sessionKey)
  // TODO: move to error handler
  if (prepRes.length !== 2) {
    throw new Error(
      `Error preparing the delegation. Result received: ${prepRes}`,
    )
  }
  const [userKey, timestamp] = prepRes

  const signedDelegation = await retryGetDelegation(
    connection,
    anchor,
    scope,
    sessionKey,
    timestamp,
  )
  return [userKey, signedDelegation]
}

export interface JSONSerialisableSignedDelegation {
  delegation: {
    pubkey: PublicKey
    expiration: string
    targets: undefined
  }
  signature: number[]
  userKey: PublicKey
}

/**
 * Builds a json serializable SignedDelegation to send
 * over the pubsub channel
 *
 * @export
 * @param {PublicKey} publicKey
 * @param {SignedDelegation} signedDelegation
 * @return {*}
 */
export function buildSerializableSignedDelegation(
  publicKey: PublicKey,
  signedDelegation: SignedDelegation,
): JSONSerialisableSignedDelegation {
  return {
    delegation: {
      pubkey: signedDelegation.delegation.pubkey,
      expiration: signedDelegation.delegation.expiration.toString(),
      targets: undefined,
    },
    signature: signedDelegation.signature,
    userKey: publicKey,
  }
}
