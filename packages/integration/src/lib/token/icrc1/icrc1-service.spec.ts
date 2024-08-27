/**
 * @jest-environment jsdom
 */
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"

import { mockIdentityA } from "@nfid/integration"

import { HTTPAccountResponse } from "../../_ic_api/identity_manager.d"
import { iCRC1Registry, im, replaceActorIdentity } from "../../actors"
import { generateDelegationIdentity } from "../../test-utils"
import { icrc1Service } from "./icrc1-service"

describe("ICRC1 suite", () => {
  jest.setTimeout(200000)

  it("Fail if incorrect index canister", async () => {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)
    await replaceActorIdentity(iCRC1Registry, delegationIdentity)
    await replaceActorIdentity(im, delegationIdentity)
    const account = (await im.get_account()) as HTTPAccountResponse
    const root = account.data[0]!.principal_id
    try {
      await icrc1Service.isICRC1Canister(
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
})
