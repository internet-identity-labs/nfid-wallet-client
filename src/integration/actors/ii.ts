import { DerEncodedPublicKey, Signature } from "@dfinity/agent"
import {
  Delegation,
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"

import { ii } from "."
import { reverseMapDate, reverseMapOptional, mapDate } from "./.common"

/**
 * Retrieve user's principal for a domain + persona hash.
 * @returns Principal
 */
export function fetchPrincipal(anchor: number, salt: string) {
  return ii.get_principal(BigInt(anchor), salt)
}

/**
 * Generate scope string with host and persona. Omits persona salt for null or zero personas for parity with legacy II.
 * @param host the domain being connected to
 * @param persona number or null specifying the users persona
 * @returns
 */
export function scopeString(host: string, persona?: number) {
  return `${persona ? `${persona}@` : ""}${host}`
}

export interface ScopedDelegation {
  delegation: {
    pubkey: Uint8Array
    expiration: Date
    targets: undefined
  }
  signature: Uint8Array
  scope: {
    persona?: number | undefined
    host: string
  }
}

/**
 * Build a delegation identity from II.
 */
export async function fetchDelegation(
  anchor: number,
  scope: {
    persona?: number
    host: string
  },
  sessionKey: number[],
  ttl?: number,
): Promise<DelegationIdentity> {
  const [userKey, timestamp] = await ii.prepare_delegation(
    BigInt(anchor),
    scopeString(scope.host, scope.persona),
    sessionKey,
    reverseMapOptional(ttl ? reverseMapDate(ttl) : undefined),
  )
  const res = await ii.get_delegation(
    BigInt(anchor),
    scopeString(scope.host, scope.persona),
    sessionKey,
    timestamp,
  )
  if (!("signed_delegation" in res)) {
    throw new Error("Failed to retrieve delegation from ii.")
  }
  const signedDelegation = res.signed_delegation
  const delegation = {
    delegation: new Delegation(
      Uint8Array.from(signedDelegation.delegation.pubkey),
      signedDelegation.delegation.expiration,
      undefined,
    ),
    signature: new Uint8Array(signedDelegation.signature).buffer as Signature,
  }
  const delegationChain = DelegationChain.fromDelegations(
    [delegation],
    new Uint8Array(userKey).buffer as DerEncodedPublicKey,
  )
  return DelegationIdentity.fromDelegation(
    Ed25519KeyIdentity.generate(),
    delegationChain,
  )
}
