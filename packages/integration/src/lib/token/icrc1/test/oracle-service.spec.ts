/**
 * @jest-environment jsdom
 */
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"

import { iCRC1OracleActor, mockIdentityA } from "@nfid/integration"
import { Category, State } from "@nfid/integration/token/icrc1/enum/enums"
import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"
import { ICRC1 as ICRC1UserData } from "@nfid/integration/token/icrc1/types"

import { im, replaceActorIdentity } from "../../../actors"
import { generateDelegationIdentity } from "../../../test-utils"
import { icrc1StorageService } from "../service/icrc1-storage-service"

describe("ICRC1 suite", () => {
  jest.setTimeout(200000)
  let root: string
  it.skip("Store/retrieve canister id", async () => {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const { delegationIdentity } = await generateDelegationIdentity(
      mockedIdentity,
    )
    await replaceActorIdentity(iCRC1OracleActor, delegationIdentity)
    await replaceActorIdentity(im, delegationIdentity)
    const edId = Ed25519KeyIdentity.generate()
    const icrc1Data: ICRC1UserData = {
      decimals: 8,
      fee: BigInt(5),
      category: Category.Sns,
      index: "2awyi-oyaaa-aaaaq-aaanq-cai",
      ledger: "2ouva-viaaa-aaaaq-aaamq-cai",
      logo: undefined,
      name: "Chat",
      state: State.Active,
      symbol: "CHAT",
      rootCanisterId: undefined
    }
    await icrc1OracleService.addICRC1Canister(icrc1Data)
    const account = await im.get_account()
    root = account.data[0]!.principal_id
    const canisters = await icrc1StorageService.getICRC1Canisters(root)
    expect(canisters.map((l) => l.ledger)).toContain(
      edId.getPrincipal().toText(),
    )
  })
})
