import { DerEncodedPublicKey, Signature } from "@dfinity/agent"
import {
  Delegation,
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
  SignedDelegation,
} from "@dfinity/identity"

import { im, replaceActorIdentity } from "../actors"
import { Chain, ecdsaGetAnonymous } from "../lambda/ecdsa"
import { getAnonymousDelegate } from "./get-delegate"

describe("get-delegate suite", () => {
  jest.setTimeout(80000)
  it("should return a delegate", async () => {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson([
      "302a300506032b65700321003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
      "00000000000000000000000000000000000000000000000000000000000000003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
    ])

    const nfidSessionKey = Ed25519KeyIdentity.generate()
    const chainRoot = await DelegationChain.create(
      mockedIdentity,
      nfidSessionKey.getPublicKey(),
      new Date(Date.now() + 3_600_000 * 44),
      {},
    )
    const nfidDelegationIdentity = DelegationIdentity.fromDelegation(
      nfidSessionKey,
      chainRoot,
    )

    const dappSessionKey = Ed25519KeyIdentity.fromParsedJson([
      "302a300506032b65700321003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
      "00000000000000000000000000000000000000000000000000000000000000003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
    ])
    // NOTE: this is what we receive from authClient
    // https://github.com/dfinity/agent-js/blob/1d35889e0d0c0fd4a33d02a341bd90ee156da1cd/packages/auth-client/src/index.ts#L517
    const dappSessionPublicKey = new Uint8Array(
      dappSessionKey.getPublicKey().toDer(),
    )

    const anonymousDelegation = await ecdsaGetAnonymous(
      "nfid.one",
      dappSessionPublicKey,
      nfidDelegationIdentity,
      Chain.IC,
    )

    const actualIdentity = DelegationIdentity.fromDelegation(
      dappSessionKey,
      anonymousDelegation,
    )

    const { delegation, signature } = anonymousDelegation.delegations[0]

    // const anonymousDelegation = await getAnonymousDelegate(
    //   dappSessionPublicKey,
    //   nfidDelegationIdentity,
    // )

    // // happens inside prepareClientDelegate
    // // https://github.com/internet-identity-labs/nfid-frontend/blob/26d834fbdaaa989d7eafa67e1e98e7d1117335a7/apps/nfid-frontend/src/integration/windows/index.ts#L80-L89
    const delegations = [
      {
        delegation: {
          pubkey: new Uint8Array(delegation.pubkey),
          expiration: delegation.expiration,
          targets: delegation.targets,
        },
        signature: new Uint8Array(signature),
      },
    ]

    // happens inside authClient on 3rd party side
    // https://github.com/dfinity/agent-js/blob/67b1e38e7d234e03a859f77da6fe40571408815a/packages/auth-client/src/index.ts#L350-L364

    const parsedDelegation = delegations.map((signedDelegation) => {
      return {
        delegation: new Delegation(
          signedDelegation.delegation.pubkey,
          signedDelegation.delegation.expiration,
          signedDelegation.delegation.targets,
        ),
        signature: signedDelegation.signature.buffer as Signature,
      }
    })

    const delegationChain = DelegationChain.fromDelegations(
      parsedDelegation,
      dappSessionPublicKey.buffer as DerEncodedPublicKey,
    )
    const identity = DelegationIdentity.fromDelegation(
      dappSessionKey,
      delegationChain,
    )

    const principalId = identity.getPrincipal().toText()

    console.debug("actualIdentity", actualIdentity.getPrincipal().toText())
    console.debug("thirdPartyIdentity", identity.getPrincipal().toText())

    expect(principalId).toBe(
      "535yc-uxytb-gfk7h-tny7p-vjkoe-i4krp-3qmcl-uqfgr-cpgej-yqtjq-rqe",
    )

    await replaceActorIdentity(im, identity)
    await im.get_account()
  })
})
