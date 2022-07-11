import { toHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
  unwrapDER,
} from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import nacl_util from "tweetnacl-util"

import { verifyPhoneNumber, verifySignature } from "../actors/lambda"

const buffer_1 = require("@dfinity/identity/lib/cjs/buffer")
const der_1 = require("@dfinity/identity/lib/cjs/identity/der")

/**
 * Build an identity from example JSON exported by the frontend.
 */
function reconstructIdentity() {
  const { chain, sessionKey } = {
    chain: DelegationChain.fromJSON(
      JSON.stringify({
        delegations: [
          {
            delegation: {
              expiration: "16ff575e09b48640",
              pubkey:
                "302a300506032b6570032100d3dffc8aec4e64d902168879bc69453fae88822015bb0b605ec193cdccd3380e",
              targets: [
                "00000000000000070101",
                "00000000014000800101",
                "0000000000D0006E0101",
                "0000000001C0006C0101",
                "00000000015002820101",
              ],
            },
            signature:
              "d9d9f7a3697369676e61747572655846304402203bc1bf15aa4cb75e7677cf9b5b60e74ebde0fab99888432df08e0343c5d19ec5022057d6398f03c1d10b8b067b2713a7e8c84a3d67ae06fc27df49f2e447b6fbb12470636c69656e745f646174615f6a736f6e78aa7b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a22476d6c6a4c584a6c6358566c63335174595856306143316b5a57786c5a324630615739757a517655792d435157635674425a6144314f635954674a767871324473337a67674955304f6c4744564773222c226f726967696e223a22687474703a2f2f6c6f63616c686f73743a39303930222c2263726f73734f726967696e223a66616c73657d7261757468656e74696361746f725f64617461582549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000",
          },
        ],
        publicKey:
          "305e300c060a2b0601040183b8430101034e00a501020326200121582087f5265a5104b080645e5d8f918460c9a38d9b0202428719879634dd4238b687225820188b9d65450cda4cc47ad6563735d6532246a1f2b09c57e99689c65779f34409",
      }),
    ),
    sessionKey: Ed25519KeyIdentity.fromJSON(
      JSON.stringify([
        "302a300506032b6570032100d3dffc8aec4e64d902168879bc69453fae88822015bb0b605ec193cdccd3380e",
        "f1aad3b1323581f96b70d20a85f36311e0a412eb66036cc2c1ab679d7fbc99a4d3dffc8aec4e64d902168879bc69453fae88822015bb0b605ec193cdccd3380e",
      ]),
    ),
  }
  return {
    identity: DelegationIdentity.fromDelegation(sessionKey, chain),
    sessionKey,
    chain,
  }
}

describe("Lambda phone verification integration", () => {
  it("exists", () => {
    expect(verifyPhoneNumber).toBeDefined()
  })

  it("test message encryption w/ generated key", async () => {
    let kp = Ed25519KeyIdentity.generate()
    let testString = "+3805011111111"
    const msg = nacl_util.decodeUTF8(testString)
    let signature = await kp.sign(msg)
    let signatureHEX = toHexString(signature)
    let pk = JSON.stringify(kp.toJSON()[0])

    let deref = buffer_1.fromHexString(JSON.parse(pk))
    let der = der_1.unwrapDER(deref, der_1.ED25519_OID)
    let principal = Principal.fromUint8Array(der)
    let ver = verifySignature(testString, signatureHEX, principal)
    expect(ver).toBeTruthy()
  })

  it("reconstruct keypair extracted from frontend application", () => {
    const { identity } = reconstructIdentity()
    expect(identity.getPrincipal().toText()).toBe(
      "sfcjo-vlerf-ijr4g-mncgx-ckvvb-v3btk-sylxy-ce54x-hdvry-c54dn-eae",
    )
  })

  it("test message encryption w/ reconstructed session key", async () => {
    const { identity } = reconstructIdentity()
    let testString = "+3805011111111"
    const msg = nacl_util.decodeUTF8(testString)
    let signature = await identity.sign(msg)
    let signatureHEX = toHexString(signature)

    let deref = identity.getDelegation().delegations[0].delegation.pubkey
    let der = unwrapDER(deref, der_1.ED25519_OID)
    let principal = Principal.fromUint8Array(der)
    let ver = verifySignature(testString, signatureHEX, principal)
    expect(ver).toBeTruthy()
  })

  it("test validation of delegation chain public key", async () => {
    const { identity } = reconstructIdentity()
    expect(Principal.fromHex(identity.getPrincipal().toHex()).toText()).toBe(
      "sfcjo-vlerf-ijr4g-mncgx-ckvvb-v3btk-sylxy-ce54x-hdvry-c54dn-eae",
    )
  })
})
