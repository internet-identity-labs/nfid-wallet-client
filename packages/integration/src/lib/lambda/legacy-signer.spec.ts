import { DelegationChain, Ed25519KeyIdentity } from "@icp-sdk/core/identity"
import { Principal } from "@icp-sdk/core/principal"

import { type DelegationChain as CandidDelegationChain } from "../_ic_api/ecdsa_storage.d"
import { toDelegationChain, unwrap } from "./legacy-signer"

describe("legacy signer", () => {
  it("maps the canister delegation chain without changing any byte", async () => {
    // Given a chain signed the way the canister signs it
    const signer = Ed25519KeyIdentity.generate(new Uint8Array(32).fill(1))
    const session = Ed25519KeyIdentity.generate(new Uint8Array(32).fill(2))
    const targets = [Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai")]
    const expected = await DelegationChain.create(
      signer,
      session.getPublicKey(),
      new Date(1_767_225_600_000),
      { targets },
    )
    const { delegation, signature } = expected.delegations[0]
    const candid: CandidDelegationChain = {
      delegations: [
        {
          delegation: {
            pubkey: Array.from(delegation.pubkey),
            expiration: delegation.expiration,
            targets: [targets],
          },
          signature: Array.from(new Uint8Array(signature)),
        },
      ],
      public_key: new Uint8Array(expected.publicKey),
    }

    // When it is converted
    const actual = toDelegationChain(candid)

    // Then it is identical to the original chain
    expect(JSON.stringify(actual.toJSON())).toEqual(
      JSON.stringify(expected.toJSON()),
    )
  })

  it("keeps an unrestricted delegation without targets", () => {
    const actual = toDelegationChain({
      delegations: [
        {
          delegation: { pubkey: [1, 2], expiration: BigInt(5), targets: [] },
          signature: [3],
        },
      ],
      public_key: [4],
    })

    expect(actual.delegations[0].delegation.targets).toBeUndefined()
  })

  it("throws the canister error", () => {
    expect(unwrap({ Ok: 1 })).toEqual(1)
    expect(() => unwrap({ Err: "No global key for this account" })).toThrow(
      "No global key for this account",
    )
  })
})
