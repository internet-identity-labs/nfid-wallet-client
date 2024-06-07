/**
 * @jest-environment jsdom
 */
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import { mockIdentityA } from "@nfid/integration"

import { TransferArg } from "../../_ic_api/icrc1.d"
import { ICRC1 } from "../../_ic_api/icrc1_registry.d"
import { HTTPAccountResponse } from "../../_ic_api/identity_manager.d"
import { iCRC1Registry, im, replaceActorIdentity } from "../../actors"
import { generateDelegationIdentity } from "../../test-utils"
import {
  addICRC1Canister,
  getICRC1Canisters,
  getICRC1DataForUser,
  getICRC1HistoryDataForUserPaginated,
  getICRC1IndexData,
  ICRC1Data,
  isICRC1Canister,
  removeICRC1Canister,
  transferICRC1,
} from "./index"

describe("ICRC1 suite", () => {
  jest.setTimeout(200000)
  let root: string
  const iCRC1TestCanister = "6jq2j-daaaa-aaaap-absuq-cai"
  it("Store/retrieve/remove canister id", async () => {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)
    await replaceActorIdentity(iCRC1Registry, delegationIdentity)
    await replaceActorIdentity(im, delegationIdentity)
    await addICRC1Canister(iCRC1TestCanister, undefined)
    await replaceActorIdentity(im, delegationIdentity)
    const account = (await im.get_account()) as HTTPAccountResponse
    root = account.data[0]!.principal_id
    const canisters = (await getICRC1Canisters(root)) as ICRC1[]
    expect(canisters.map((l) => l.ledger)).toContain(iCRC1TestCanister)
  })

  it("Fail if incorrect index canister", async () => {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)
    await replaceActorIdentity(iCRC1Registry, delegationIdentity)
    await replaceActorIdentity(im, delegationIdentity)
    const account = (await im.get_account()) as HTTPAccountResponse
    const root = account.data[0]!.principal_id
    try {
      await isICRC1Canister(
        "2ouva-viaaa-aaaaq-aaamq-cai",
        root,
        "sculj-2sjuf-dxqlm-dcv5y-hin5x-zfyvr-tzngf-bt5b5-dwhcc-zbsqf-rae",
        "qhbym-qaaaa-aaaaa-aaafq-cai",
      )
      fail("Should throw error")
    } catch (e: any) {
      expect(e.message).toEqual(
        "Ledger canister does not match index canister.",
      )
    }
  })

  it("Get data", async () => {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)
    await replaceActorIdentity(iCRC1Registry, delegationIdentity)
    await replaceActorIdentity(im, delegationIdentity)
    const account = (await im.get_account()) as HTTPAccountResponse
    const root = account.data[0]!.principal_id
    const data = (await getICRC1DataForUser(
      root,
      "sculj-2sjuf-dxqlm-dcv5y-hin5x-zfyvr-tzngf-bt5b5-dwhcc-zbsqf-rae",
    )) as Array<ICRC1Data>
    const testICRC1 = data[0]
    expect(testICRC1.balance).toBeGreaterThan(0)
    expect(testICRC1.fee).toEqual(BigInt(10000))
    expect(testICRC1.canisterId).toEqual(iCRC1TestCanister)
    expect(testICRC1.decimals).toEqual(8)
    expect(testICRC1.name).toEqual("ICPTestNfid")
    expect(testICRC1.symbol).toEqual("ICPTestNfid")
  })

  it.skip("Get index data", async () => {
    const data = await getICRC1HistoryDataForUserPaginated(
      [
        {
          icrc1: {
            ledger: "2ouva-viaaa-aaaaq-aaamq-cai",
            index: ["2awyi-oyaaa-aaaaq-aaanq-cai"],
          },
          blockNumberToStartFrom: BigInt(298680),
        },
      ],
      "7cpx7-5iqxa-df2t7-jktca-2mfbq-b7keh-dsunz-k256d-55byp-7lkyp-uqe",
      BigInt(1),
    )
    const testICRC1 = data[0]
    expect(testICRC1.transactions.length).toBeGreaterThan(0)
    expect(testICRC1.transactions[0].transactionId).toEqual(BigInt(298669))
    expect(testICRC1.transactions[0].from).toEqual(
      "7cpx7-5iqxa-df2t7-jktca-2mfbq-b7keh-dsunz-k256d-55byp-7lkyp-uqe",
    )
    expect(testICRC1.transactions[0].to).toEqual("l3k5l-liaaa-aaaan-qmhkq-cai")
    expect(testICRC1.transactions[0].type).toEqual("sent")
    expect(testICRC1.transactions[0].symbol).toEqual("CHAT")
    expect(testICRC1.transactions[0].amount).toEqual(BigInt(10000000))
    expect(testICRC1.oldestTransactionId).toEqual(BigInt(246792))
  })

  it("Transfer", async () => {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)
    const transferArgs: TransferArg = {
      amount: BigInt(10),
      created_at_time: [],
      fee: [],
      from_subaccount: [],
      memo: [],
      to: {
        subaccount: [],
        owner: Principal.fromText(
          "sculj-2sjuf-dxqlm-dcv5y-hin5x-zfyvr-tzngf-bt5b5-dwhcc-zbsqf-rae",
        ),
      },
    }
    const block = await transferICRC1(
      delegationIdentity,
      iCRC1TestCanister,
      transferArgs,
    )
    // @ts-ignore
    expect(block.Ok).toBeGreaterThan(0)
  })

  it("Remove canister id", async () => {
    let canisters = (await getICRC1Canisters(root)) as ICRC1[]
    expect(canisters.map((l) => l.ledger)).toContain(iCRC1TestCanister)
    await removeICRC1Canister(root, iCRC1TestCanister)
    canisters = (await getICRC1Canisters(root)) as ICRC1[]
    expect(canisters.map((l) => l.ledger)).not.toContain(iCRC1TestCanister)
  })
})
