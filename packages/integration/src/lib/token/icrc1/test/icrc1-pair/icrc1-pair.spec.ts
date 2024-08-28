/**
 * @jest-environment jsdom
 */
import {DelegationIdentity, Ed25519KeyIdentity} from "@dfinity/identity"

import {generateDelegationIdentity, iCRC1Registry, im, mockIdentityA, replaceActorIdentity} from "@nfid/integration"
import {Principal} from "@dfinity/principal";
import {HTTPAccountResponse} from "../../../../_ic_api/identity_manager.d"
import {Icrc1Pair} from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair";

const principal = Principal.fromText(
  "j5zf4-bzab2-e5w4v-kagxz-p35gy-vqyam-gazwu-vhgmz-bb3bh-nlwxc-tae",
)

describe("ICRC1 pair suite", () => {
  jest.setTimeout(200000)
  let root: string
  beforeAll(async () => {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)
    await replaceActorIdentity(iCRC1Registry, delegationIdentity)
    await replaceActorIdentity(im, delegationIdentity)
    const account = (await im.get_account()) as HTTPAccountResponse
    root = account.data[0]!.principal_id
  })

  it("Fail because already added", async () => {
    const icrcPair = new Icrc1Pair("2ouva-viaaa-aaaaq-aaamq-cai", "qhbym-qaaaa-aaaaa-aaafq-cai")
    try {
      await icrcPair.validateIfExists(root)
      fail("Should throw error")
    } catch (e: any) {
      expect(e.message).toEqual(
        "Canister already added.",
      )
    }
  })

  it("Fail if incorrect index canister", async () => {
    const icrcPair = new Icrc1Pair("ca6gz-lqaaa-aaaaq-aacwa-cai", "qhbym-qaaaa-aaaaa-aaafq-cai")
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
    const icrcPair = new Icrc1Pair("qhbym-qaaaa-aaaaa-aaafq-cai", "qhbym-qaaaa-aaaaa-aaafq-cai")
    try {
      await icrcPair.validateStandard()
      fail("Should throw error")
    } catch (e: any) {
      expect(e.message).toEqual(
        "This does not appear to be an ICRC-1 compatible canister.",
      )
    }
  })

  it("Get balance", async () => {
    const icrcPair = new Icrc1Pair("ryjl3-tyaaa-aaaaa-aaaba-cai", "qhbym-qaaaa-aaaaa-aaafq-cai")
    const balance = await icrcPair.getBalance(principal.toText())
    expect(balance).toBeGreaterThan(0)
  })

  it("Get metadata", async () => {
    const icrcPair = new Icrc1Pair("ryjl3-tyaaa-aaaaa-aaaba-cai", "qhbym-qaaaa-aaaaa-aaafq-cai")
    const metadata = await icrcPair.getMetadata()
    expect(metadata.logo).not.toBeDefined()
    expect(metadata.symbol).toEqual("ICP")
    expect(metadata.name).toEqual("Internet Computer")
    expect(metadata.decimals).toEqual(8)
    expect(Number(metadata.fee)).toEqual(10000)
  })

})
