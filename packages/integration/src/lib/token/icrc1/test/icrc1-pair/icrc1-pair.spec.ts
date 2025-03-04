/**
 * @jest-environment jsdom
 */
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import { JsonnableEd25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519"
import { Principal } from "@dfinity/principal"

import {
  authState,
  generateDelegationIdentity,
  iCRC1Registry,
  im,
  mockIdentityA,
  replaceActorIdentity,
} from "@nfid/integration"
import { Icrc1Pair } from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair"

import { HTTPAccountResponse } from "../../../../_ic_api/identity_manager.d"

const principal = Principal.fromText(
  "j5zf4-bzab2-e5w4v-kagxz-p35gy-vqyam-gazwu-vhgmz-bb3bh-nlwxc-tae",
)
const mock: JsonnableEd25519KeyIdentity = [
  "302a300506032b65700321003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
  "00000000000000000000000000000000000000000000000000000000000000003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
]

describe("ICRC1 pair suite", () => {
  jest.setTimeout(200000)
  let root: string
  beforeAll(async () => {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const { delegationIdentity } = await generateDelegationIdentity(
      mockedIdentity,
    )
    await replaceActorIdentity(iCRC1Registry, delegationIdentity)
    await replaceActorIdentity(im, delegationIdentity)
    const account = (await im.get_account()) as HTTPAccountResponse
    root = account.data[0]!.principal_id
  })

  it("Fail because already added", async () => {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mock)
    const sessionKey = Ed25519KeyIdentity.generate()
    const chainRoot = await DelegationChain.create(
      mockedIdentity,
      sessionKey.getPublicKey(),
      new Date(Date.now() + 3_600_000 * 44),
      {},
    )
    const delegationIdentity = DelegationIdentity.fromDelegation(
      sessionKey,
      chainRoot,
    )
    await authState.set({
      identity: delegationIdentity,
      delegationIdentity: delegationIdentity,
    })
    const icrcPair = new Icrc1Pair(
      "2ouva-viaaa-aaaaq-aaamq-cai",
      "qhbym-qaaaa-aaaaa-aaafq-cai",
    )
    try {
      await icrcPair.validateIfExists(root)
      fail("Should throw error")
    } catch (e: any) {
      expect(e.message).toEqual("Canister already added.")
    }
  })

  it("Fail if incorrect index canister", async () => {
    const icrcPair = new Icrc1Pair(
      "ca6gz-lqaaa-aaaaq-aacwa-cai",
      "qhbym-qaaaa-aaaaa-aaafq-cai",
    )
    try {
      await icrcPair.validateIndexCanister()
      fail("Should throw error")
    } catch (e: any) {
      expect(e.message).toEqual(
        "Ledger canister does not match index canister.",
      )
    }
  })

  it("Fail if incorrect standard", async () => {
    const icrcPair = new Icrc1Pair(
      "qhbym-qaaaa-aaaaa-aaafq-cai",
      "qhbym-qaaaa-aaaaa-aaafq-cai",
    )
    try {
      await icrcPair.validateStandard()
      fail("Should throw error")
    } catch (e: any) {
      expect(e.message).toEqual(
        "This does not appear to be an ICRC-1 compatible ledger canister.",
      )
    }
  })

  it("Get balance", async () => {
    const icrcPair = new Icrc1Pair(
      "ryjl3-tyaaa-aaaaa-aaaba-cai",
      "qhbym-qaaaa-aaaaa-aaafq-cai",
    )
    const balance = await icrcPair.getBalance(principal.toText())
    expect(balance).toBeGreaterThan(0)
  })

  it("Get metadata", async () => {
    const icrcPair = new Icrc1Pair(
      "ryjl3-tyaaa-aaaaa-aaaba-cai",
      "qhbym-qaaaa-aaaaa-aaafq-cai",
    )
    const metadata = await icrcPair.getMetadata()
    expect(metadata.logo).not.toBeDefined()
    expect(metadata.symbol).toEqual("ICP")
    expect(metadata.name).toEqual("Internet Computer")
    expect(metadata.decimals).toEqual(8)
    expect(Number(metadata.fee)).toEqual(10000)
  })
})
