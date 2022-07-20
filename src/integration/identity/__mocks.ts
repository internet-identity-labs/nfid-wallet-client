import { DerEncodedPublicKey } from "@dfinity/agent"
import { WebAuthnIdentity } from "@dfinity/identity"
import {
  Delegation,
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"

export async function mockWebAuthnCreate() {
  return WebAuthnIdentity.fromJSON(
    JSON.stringify({
      publicKey:
        "a501020326200121582060e4ba52ed4527f037bc3530c3ed40aec3579e6b5eaf222196c2ec3d19f14e1f225820c7debdc95b6937fcc34c1435bb3d4331fce016486fa9a02e1734e35417fb45d0",
      rawId:
        "4eafd1acf03edb17657429f253a2a217e198e71ac17d596fdbf5b70bc6751d1428c939cebd74ed7c70c9844e36fe39055018acab9185b8949213320dc1e37f51cc6310d71af4cd012bd12002de58cfa78edea4",
    }),
  )
}

/**
 * Turn an object into an ArrayBuffer.
 */
function encodeObject(object: {}): Uint8Array {
  return Buffer.from(JSON.stringify(object))
}

export async function factoryDelegationChain(): Promise<DelegationChain> {
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
  return DelegationChain.fromDelegations(
    [signedDelegation],
    new Uint8Array(id.getPublicKey().toDer()).buffer as DerEncodedPublicKey,
  )
}

export async function factoryDelegationIdentity(): Promise<DelegationIdentity> {
  return DelegationIdentity.fromDelegation(
    Ed25519KeyIdentity.generate(),
    await factoryDelegationChain(),
  )
}
