import { ActorSubclass } from "@dfinity/agent"
import { Ed25519KeyIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import { DIP20 } from "."
import { mockIdentityA, mockIdentityB } from "../../identity/mocks"
import * as mockedDip20Actor from "./actor"
import { TxError } from "./dip-20.d"
import { transfer } from "./transfer"

const transactionError: TxError[] = [
  { InsufficientAllowance: null },
  { InsufficientBalance: null },
  { ErrorOperationStyle: null },
  { Unauthorized: null },
  { LedgerTrap: null },
  { ErrorTo: null },
  { Other: "Any other error" },
  { BlockUsed: null },
  { AmountTooSmall: null },
]

describe("transfer", () => {
  it("should call dependend methods with the correct parameter", async () => {
    const sourceIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const receiverIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityB)

    const expectedTransferResponse = { Ok: BigInt(1) }
    const dip20ActorMock = {
      transfer: jest
        .fn()
        .mockReturnValue(Promise.resolve(expectedTransferResponse)),
    } as unknown as ActorSubclass<DIP20>

    const makeDip20ActorMock = jest
      .spyOn(mockedDip20Actor, "makeDip20Actor")
      .mockReturnValue(dip20ActorMock)

    const response = await transfer({
      sourceIdentity,
      canisterId: "utozz-siaaa-aaaam-qaaxq-cai",
      to: receiverIdentity.getPrincipal().toString(),
      amount: 1,
    })

    expect(response).toBe(BigInt(1))

    expect(makeDip20ActorMock).toHaveBeenCalledWith(
      "utozz-siaaa-aaaam-qaaxq-cai",
      sourceIdentity,
    )
    expect(dip20ActorMock.transfer).toHaveBeenCalledWith(
      Principal.fromText(receiverIdentity.getPrincipal().toString()),
      BigInt(1),
    )
  })
  it.each(transactionError)(
    "should throw an error if the transfer fails with %s",
    async (error) => {
      const sourceIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
      const receiverIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityB)

      const expectedTransferResponse = { Err: error }
      const dip20ActorMock = {
        transfer: jest
          .fn()
          .mockReturnValue(Promise.resolve(expectedTransferResponse)),
      } as unknown as ActorSubclass<DIP20>

      jest
        .spyOn(mockedDip20Actor, "makeDip20Actor")
        .mockReturnValue(dip20ActorMock)

      try {
        await transfer({
          sourceIdentity,
          canisterId: "utozz-siaaa-aaaam-qaaxq-cai",
          to: receiverIdentity.getPrincipal().toString(),
          amount: 1,
        })
      } catch (e: any) {
        const expected = "Other" in error ? error.Other : Object.keys(error)[0]
        expect(e.message).toBe(expected)
      }
    },
  )
})
