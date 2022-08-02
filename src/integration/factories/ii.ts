import { DerEncodedPublicKey } from "@dfinity/agent"
import {
  Delegation,
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"

import { ScopedDelegation } from "../actors/ii"

/**
 * Turn an object into an ArrayBuffer.
 */
function encodeObject(object: {}): Uint8Array {
  return Buffer.from(JSON.stringify(object))
}

export async function factoryDelegationIdentity(): Promise<DelegationIdentity> {
  const id = Ed25519KeyIdentity.generate()
  const delegation = new Delegation(
    new Uint8Array(id.getPublicKey().toDer()),
    BigInt(new Date().getTime() + 3_600_000),
    undefined,
  )
  const signature = await id.sign(encodeObject(delegation))
  const signedDelegation = {
    delegation,
    signature,
  }
  const delegationChain = DelegationChain.fromDelegations(
    [signedDelegation],
    new Uint8Array(id.getPublicKey().toDer()).buffer as DerEncodedPublicKey,
  )
  return DelegationIdentity.fromDelegation(
    Ed25519KeyIdentity.generate(),
    delegationChain,
  )
}
