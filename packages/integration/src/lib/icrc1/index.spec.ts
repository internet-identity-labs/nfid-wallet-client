/**
 * @jest-environment jsdom
 */
import {DelegationIdentity, Ed25519KeyIdentity} from "@dfinity/identity"

import {iCRC1, replaceActorIdentity} from '../actors';
import {generateDelegationIdentity} from "../test-utils"
import {addICRC1Canister, getICRC1Canisters} from "./index";
import {mockIdentityA} from "@nfid/integration";

describe("ICRC1 suite", () => {
  jest.setTimeout(200000)

  it("Store/retrieve canister id", async () => {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)
    await replaceActorIdentity(iCRC1, delegationIdentity)
    const canister_id = generateRandomString(5)
    await addICRC1Canister(canister_id)
    const canisters = await getICRC1Canisters() as string[];
    expect(canisters).toContain(canister_id)
  })
})

function generateRandomString(length: number, charset = 'ABCDEFGHIJK'): string {
  let result = '';
  const charsetLength = charset.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charsetLength);
    result += charset.charAt(randomIndex);
  }

  return result;
}
