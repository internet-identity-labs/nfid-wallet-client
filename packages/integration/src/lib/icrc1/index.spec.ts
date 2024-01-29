/**
 * @jest-environment jsdom
 */
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import { mockIdentityA } from "@nfid/integration"

import { TransferArg } from "../_ic_api/icrc1.d"
import { HTTPAccountResponse } from "../_ic_api/identity_manager.d"
import { iCRC1, im, replaceActorIdentity } from "../actors"
import { generateDelegationIdentity } from "../test-utils"
import {
  addICRC1Canister,
  getICRC1Canisters,
  getICRC1Data,
  ICRC1Data,
  transferICRC1,
} from "./index"

describe("ICRC1 suite", () => {
  jest.setTimeout(200000)
  const iCRC1TestCanister = "6jq2j-daaaa-aaaap-absuq-cai"
  it("Store/retrieve canister id", async () => {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)
    await replaceActorIdentity(iCRC1, delegationIdentity)
    await replaceActorIdentity(im, delegationIdentity)
    await addICRC1Canister(iCRC1TestCanister)
    await replaceActorIdentity(im, delegationIdentity)
    const account = (await im.get_account()) as HTTPAccountResponse
    const root = account.data[0]!.principal_id
    const canisters = (await getICRC1Canisters(root)) as string[]
    expect(canisters).toContain(iCRC1TestCanister)
  })

  it("Get data", async () => {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)
    await replaceActorIdentity(iCRC1, delegationIdentity)
    await replaceActorIdentity(im, delegationIdentity)
    const account = (await im.get_account()) as HTTPAccountResponse
    const root = account.data[0]!.principal_id
    const data = (await getICRC1Data(
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
})
