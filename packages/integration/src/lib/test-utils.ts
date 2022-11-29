import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"

export async function generateDelegationIdentity(identity: Ed25519KeyIdentity) {
  const sessionKey = Ed25519KeyIdentity.generate()
  const chain = await DelegationChain.create(
    identity,
    sessionKey.getPublicKey(),
    new Date(Date.now() + 3_600_000 * 44),
    {},
  )
  return DelegationIdentity.fromDelegation(sessionKey, chain)
}
