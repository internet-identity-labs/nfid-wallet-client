import { ActorSubclass } from "@dfinity/agent"
import { Ed25519KeyIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import { DIP20 } from "."
import { mockIdentityA } from "../../identity/mocks"
import { stringify } from "../../test-utils"
import { E8S } from "../icp"
import * as mockedTransfer from "../icp/transfer"
import * as mockedDip20Actor from "./actor"
import { swapFromICP } from "./swap-from-icp"

describe("swapFromIcp", () => {
  it("should work", async () => {
    const expectedBlockHeight = BigInt(10)
    const transferMock = jest
      .spyOn(mockedTransfer, "transfer")
      .mockReturnValue(Promise.resolve(expectedBlockHeight))

    const expectedMintResponse = { OK: BigInt(1 * E8S) }
    const dip20ActorMock = {
      mint: jest.fn().mockReturnValue(Promise.resolve(expectedMintResponse)),
    } as unknown as ActorSubclass<DIP20>

    const makeDip20ActorMock = jest
      .spyOn(mockedDip20Actor, "makeDip20Actor")
      .mockReturnValue(dip20ActorMock)

    const sourceIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)

    const response = await swapFromICP({
      sourceIdentity,
      tokenAccountId:
        "cc659fe529756bae6f72db9937c6c60cf7ad57eb4ac5f930a75748927aab469a",
      canisterId: "canisterId",
      principalId: sourceIdentity.getPrincipal().toText(),
      amount: 1,
    })

    expect(stringify(response)).toEqual(stringify(expectedMintResponse))

    expect(transferMock).toHaveBeenCalledWith({
      amount: 1,
      to: "cc659fe529756bae6f72db9937c6c60cf7ad57eb4ac5f930a75748927aab469a",
      identity: sourceIdentity,
      memo: undefined,
    })
    expect(makeDip20ActorMock).toHaveBeenCalledWith(
      "canisterId",
      sourceIdentity,
    )
    expect(dip20ActorMock.mint).toHaveBeenCalledWith(
      Principal.fromText(sourceIdentity.getPrincipal().toText()),
      expectedBlockHeight,
    )
  })
})
