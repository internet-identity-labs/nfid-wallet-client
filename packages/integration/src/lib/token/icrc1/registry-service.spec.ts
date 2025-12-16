/**
 * @jest-environment jsdom
 */
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"

import { authState, mockIdentityA } from "@nfid/integration"
import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { icrc1RegistryService } from "@nfid/integration/token/icrc1/service/icrc1-registry-service"

import { HTTPAccountResponse } from "../../_ic_api/identity_manager.d"
import { iCRC1Registry, im, replaceActorIdentity } from "../../actors"
import { generateDelegationIdentity } from "../../test-utils"

describe("ICRC1 suite", () => {
  jest.setTimeout(200000)
  let root: string
  it("Store/retrieve canister id", async () => {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const { delegationIdentity } =
      await generateDelegationIdentity(mockedIdentity)
    await authState.set({
      identity: delegationIdentity,
      delegationIdentity: delegationIdentity,
    })
    await replaceActorIdentity(iCRC1Registry, delegationIdentity)
    await replaceActorIdentity(im, delegationIdentity)
    const edId = Ed25519KeyIdentity.generate()
    await icrc1RegistryService.storeICRC1Canister(
      edId.getPrincipal().toText(),
      State.Active,
    )
    const account = (await im.get_account()) as HTTPAccountResponse
    root = account.data[0]!.principal_id
    const canisters = await icrc1RegistryService.getStoredUserTokens()
    expect(canisters.map((l) => l.ledger)).toContain(
      edId.getPrincipal().toText(),
    )
    const activeCanisters = await icrc1RegistryService.getStoredUserTokens()
    expect(
      activeCanisters.find((l) => l.ledger === edId.getPrincipal().toText())!
        .state,
    ).toEqual({ Active: null })
    await icrc1RegistryService.storeICRC1Canister(
      edId.getPrincipal().toText(),
      State.Inactive,
    )
    const inactiveCanisters =
      await icrc1RegistryService.getStoredUserTokens(root)
    expect(
      inactiveCanisters.find((l) => l.ledger === edId.getPrincipal().toText())!
        .state,
    ).toEqual({ Inactive: null })
  })
})
