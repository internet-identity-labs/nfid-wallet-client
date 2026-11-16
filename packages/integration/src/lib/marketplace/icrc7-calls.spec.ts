import { IDL } from "@icp-sdk/core/candid"

import { decodeBatchReply, describeIcrcError } from "./icrc7-calls"

const hex = (s: string) =>
  Uint8Array.from(s.match(/../g)!.map((b) => parseInt(b, 16)))

// Replies of ORIGYN core_nft (dev collection vehwg-aiaaa-aaaag-aciuq-cai).
const APPROVE_CREATED_IN_FUTURE = hex(
  "4449444c076b02bc8a0101c5fed201046d026e036b02bc8a017dc5fed201046b07d1c4987c05b492c5f5047ffc8ae2b6057fd4b4c59a097ff087e6db090685d5a1990b0593e5bec80c7f6c02c7ebc4d00971c498b1b50d7d6c01a3bb918c0a780100000101010435640d4dda91e818",
)
const APPROVE_OK = hex(
  "4449444c076b02bc8a0101c5fed201046d026e036b02bc8a017dc5fed201046b07d1c4987c05b492c5f5047ffc8ae2b6057fd4b4c59a097ff087e6db090685d5a1990b0593e5bec80c7f6c02c7ebc4d00971c498b1b50d7d6c01a3bb918c0a7801000001010016",
)
const REVOKE_OK = hex(
  "4449444c076b02bc8a0101c5fed201046d026e036b02bc8a017dc5fed201046b07d1c4987c05fc8ae2b6057fd4b4c59a097ff087e6db0906c0aca6a20a7f85d5a1990b0593e5bec80c7f6c02c7ebc4d00971c498b1b50d7d6c01a3bb918c0a7801000001010017",
)
const TRANSFER_INVALID_RECIPIENT = hex(
  "4449444c076d016e026b02bc8a017dc5fed201036b08d1c4987c04eb82a8970405fc8ae2b6057fd4b4c59a097ff087e6db0906828cdda60a7f85d5a1990b0493e5bec80c7f6c02c7ebc4d00971c498b1b50d7d6c018bbdf29b017d6c01a3bb918c0a7d010001010105",
)

describe("decodeBatchReply", () => {
  it("reads a refused approval inside an Ok reply", () => {
    const [res] = decodeBatchReply(
      "icrc37_approve_tokens",
      APPROVE_CREATED_IN_FUTURE,
    )
    expect(res && "Err" in res && Object.keys(res.Err)).toEqual([
      "CreatedInFuture",
    ])
  })

  it("reads successful approve and revoke replies", () => {
    expect(decodeBatchReply("icrc37_approve_tokens", APPROVE_OK)).toEqual([
      { Ok: BigInt(22) },
    ])
    expect(
      decodeBatchReply("icrc37_revoke_token_approvals", REVOKE_OK),
    ).toEqual([{ Ok: BigInt(23) }])
  })

  it("reads the spec shape (vec opt Result)", () => {
    expect(
      decodeBatchReply("icrc7_transfer", TRANSFER_INVALID_RECIPIENT),
    ).toEqual([{ Err: { InvalidRecipient: null } }])

    const Err = IDL.Variant({ TooOld: IDL.Null })
    const spec = IDL.encode(
      [IDL.Vec(IDL.Opt(IDL.Variant({ Ok: IDL.Nat, Err })))],
      [[[{ Ok: BigInt(5) }], [], [{ Err: { TooOld: null } }]]],
    )
    expect(decodeBatchReply("icrc37_approve_tokens", spec)).toEqual([
      { Ok: BigInt(5) },
      undefined,
      { Err: { TooOld: null } },
    ])
  })

  it("reads an outer error and ignores an unknown reply", () => {
    const outer = IDL.encode(
      [
        IDL.Variant({
          Ok: IDL.Vec(IDL.Opt(IDL.Variant({ Ok: IDL.Nat }))),
          Err: IDL.Variant({
            GenericBatchError: IDL.Record({
              message: IDL.Text,
              error_code: IDL.Nat,
            }),
          }),
        }),
      ],
      [
        {
          Err: {
            GenericBatchError: { message: "too many", error_code: BigInt(1) },
          },
        },
      ],
    )
    expect(decodeBatchReply("icrc37_approve_tokens", outer)).toEqual([
      {
        Err: {
          GenericBatchError: { message: "too many", error_code: BigInt(1) },
        },
      },
    ])

    jest.spyOn(console, "warn").mockImplementation(() => undefined)
    expect(
      decodeBatchReply("icrc37_approve_tokens", IDL.encode([IDL.Text], ["?"])),
    ).toEqual([])
  })
})

describe("describeIcrcError", () => {
  it("names the error and its details", () => {
    expect(describeIcrcError({ Unauthorized: null })).toBe("Unauthorized")
    expect(
      describeIcrcError({ CreatedInFuture: { ledger_time: BigInt(7) } }),
    ).toBe('CreatedInFuture {"ledger_time":"7"}')
  })
})
