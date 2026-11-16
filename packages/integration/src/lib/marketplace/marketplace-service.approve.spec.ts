import { HttpAgent } from "@icp-sdk/core/agent"
import { Ed25519KeyIdentity } from "@icp-sdk/core/identity"

import { callIcrc7Batch } from "./icrc7-calls"
import { MarketplaceService } from "./marketplace-service"

jest.mock("./icrc7-calls", () => ({
  ...jest.requireActual("./icrc7-calls"),
  callIcrc7Batch: jest.fn(),
}))
const call = callIcrc7Batch as jest.Mock

const COLLECTION = "vehwg-aiaaa-aaaag-aciuq-cai"
const ORACLE = "ys266-uyaaa-aaaal-ajs4q-cai"

describe("MarketplaceService.approveNft", () => {
  const identity = Ed25519KeyIdentity.generate()
  let service: MarketplaceService

  beforeEach(() => {
    call.mockReset()
    jest.spyOn(HttpAgent.prototype, "syncTime").mockResolvedValue()
    jest.spyOn(HttpAgent.prototype, "getTimeDiffMsecs").mockReturnValue(0)
    service = new MarketplaceService({ oracleCanisterId: ORACLE })
    jest.spyOn(service, "isApproved").mockResolvedValue(true)
  })

  const createdAt = (i: number) =>
    call.mock.calls[i][3][0].approval_info.created_at_time as bigint

  it("retries a CreatedInFuture approval with the collection's time", async () => {
    const ledgerTime = BigInt(1_794_853_717_119_149_924)
    call
      .mockResolvedValueOnce([
        { Err: { CreatedInFuture: { ledger_time: ledgerTime } } },
      ])
      .mockResolvedValueOnce([{ Ok: BigInt(5) }])

    await service.approveNft(identity, COLLECTION, BigInt(1))

    expect(call).toHaveBeenCalledTimes(2)
    expect(createdAt(1)).toBe(ledgerTime)
  })

  it("reports other refusals with the reason", async () => {
    call.mockResolvedValue([{ Err: { Unauthorized: null } }])

    await expect(
      service.approveNft(identity, COLLECTION, BigInt(1)),
    ).rejects.toThrow("approvalFailed: Unauthorized")
    expect(call).toHaveBeenCalledTimes(1)
  })

  it("uses the network time instead of the device clock", async () => {
    jest.spyOn(HttpAgent.prototype, "getTimeDiffMsecs").mockReturnValue(-60_000)
    call.mockResolvedValue([{ Ok: BigInt(5) }])

    await service.approveNft(identity, COLLECTION, BigInt(1))

    const deviceNs = BigInt(Date.now()) * BigInt(1_000_000)
    const skewMs = Number(deviceNs - createdAt(0)) / 1_000_000
    expect(skewMs).toBeGreaterThan(59_000)
    expect(skewMs).toBeLessThan(61_000)
  })
})
