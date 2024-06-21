import { DerEncodedPublicKey, Signature } from "@dfinity/agent"
import {
  Delegation,
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import { JsonnableEd25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519"
import { TextEncoder } from "util"

import { mapOptional } from "@nfid/integration"

import {
  getDelegation,
  prepareDelegation,
  PrepareDelegationArgs,
} from "./delegation-factory"

describe("Delegation Factory Tests", () => {
  jest.setTimeout(80000)
  it("register ecdsa ETH", async function () {
    const sessionPair = getIdentity("87654321876543218765432187654311")
    const pk = new Uint8Array(sessionPair.getPublicKey().toDer())
    const args: PrepareDelegationArgs = {
      userNumber: BigInt(10001),
      frontendHostname: "nfid.one",
      sessionKey: pk,
      maxTimeToLive: [],
    }
    const prepareDelegationResponse = await prepareDelegation(args)
    console.log(JSON.stringify(prepareDelegationResponse))
    expect(prepareDelegationResponse[0]).toBeDefined()
    expect(prepareDelegationResponse[1]).toBeDefined()

    const getDelegationResponse = await getDelegation({
      userNumber: BigInt(10001),
      frontendHostname: "nfid.one",
      sessionKey: pk,
      expiration: prepareDelegationResponse[1],
    }).then((r) => {
      console.log(JSON.stringify(r))
      if ("signed_delegation" in r) {
        return {
          delegation: {
            expiration: r.signed_delegation.delegation.expiration,
            pubkey: r.signed_delegation.delegation.pubkey,
            targets: mapOptional(r.signed_delegation.delegation.targets),
          },
          signature: r.signed_delegation.signature,
        }
      } else {
        throw new Error("No such delegation")
      }
    })

    const chain = DelegationChain.fromDelegations(
      [
        {
          delegation: new Delegation(
            new Uint8Array(getDelegationResponse.delegation.pubkey).buffer,
            getDelegationResponse.delegation.expiration,
            getDelegationResponse.delegation.targets,
          ),
          signature: new Uint8Array(getDelegationResponse.signature)
            .buffer as Signature,
        },
      ],
      new Uint8Array(sessionPair.getPublicKey().toDer())
        .buffer as DerEncodedPublicKey,
    )

    const delegationIdentity = DelegationIdentity.fromDelegation(
      sessionPair,
      chain,
    )

    expect(
      "duwbk-wkvu3-p5ej3-z3w4g-j5opx-vfkl5-t6qc6-vkcah-2psnh-dbf6b-vae",
    ).toEqual(delegationIdentity.getPrincipal().toText())
  })
})

const getIdentity = (seed: string): Ed25519KeyIdentity => {
  const seedEncoded = new TextEncoder().encode(seed)
  return Ed25519KeyIdentity.generate(seedEncoded)
}
