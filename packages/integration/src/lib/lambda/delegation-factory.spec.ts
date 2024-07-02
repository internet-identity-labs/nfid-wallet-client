import {DelegationChain, DelegationIdentity, Ed25519KeyIdentity,} from "@dfinity/identity"
import {TextEncoder} from "util"

import {delegationFactory, replaceActorIdentity} from "@nfid/integration"

import {getDelegationChainSignedByCanister, getPrincipalSignedByCanister,} from "./delegation-factory"

describe("Delegation Factory Tests", () => {
  jest.setTimeout(80000)
  it("get-principal", async function() {
    const mockedIdentity = getIdentity("97654321876543218765432187654388")
    await replaceActorIdentity(delegationFactory,mockedIdentity)
    const principal = await getPrincipalSignedByCanister( BigInt(200000007), "nfid.one")
    expect("mqv3l-ovus6-4k6vq-tw2bx-4fxqm-snv6c-73mzp-qh2b4-qlsk4-g2mrl-fae")
      .toEqual(principal.toText())
  })

  it("get delegation", async function () {
    const mockedIdentity = getIdentity("97654321876543218765432187654388")
    const sessionKey = Ed25519KeyIdentity.generate()
    const chainRoot = await DelegationChain.create(
      mockedIdentity,
      sessionKey.getPublicKey(),
      new Date(Date.now() + 3_600_000 * 44),
      {},
    )
    const di = DelegationIdentity.fromDelegation(sessionKey, chainRoot)
    expect(di.getPrincipal().toText()).toEqual(mockedIdentity.getPrincipal().toText())
    const pk = new Uint8Array(sessionKey.getPublicKey().toDer())

    const delegationChain = await getDelegationChainSignedByCanister(
      di, [], pk, BigInt(200000007), "nfid.one"
    )
    const rootDelegation = DelegationIdentity.fromDelegation(
      sessionKey,
      delegationChain,
    )

    expect("mqv3l-ovus6-4k6vq-tw2bx-4fxqm-snv6c-73mzp-qh2b4-qlsk4-g2mrl-fae")
      .toEqual(rootDelegation.getPrincipal().toText())
  })
})

const getIdentity = (seed: string): Ed25519KeyIdentity => {
  const seedEncoded = new TextEncoder().encode(seed)
  return Ed25519KeyIdentity.generate(seedEncoded)
}
