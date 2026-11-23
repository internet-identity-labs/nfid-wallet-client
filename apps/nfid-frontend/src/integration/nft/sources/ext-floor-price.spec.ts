import { Actor } from "@icp-sdk/core/agent"

import { ttlCacheService } from "@nfid/client-db"

import { ExtFloorPriceService } from "./ext-floor-price"

const COLLECTION = "bzsui-sqaaa-aaaah-qce2a-cai"

const stats = (floor: bigint) => [
  BigInt(1),
  BigInt(2),
  BigInt(3),
  floor,
  BigInt(4),
  BigInt(5),
  BigInt(6),
]

describe("ExtFloorPriceService", () => {
  beforeEach(() => {
    jest
      .spyOn(ttlCacheService, "getOrFetch")
      .mockImplementation((_key, fetcher) => fetcher())
  })

  afterEach(() => jest.restoreAllMocks())

  const mockStats = (impl: () => Promise<unknown>) =>
    jest
      .spyOn(Actor, "createActor")
      .mockReturnValue({ stats: impl } as unknown as ReturnType<
        typeof Actor.createActor
      >)

  it("returns the 4th stats field as the floor in e8s", async () => {
    mockStats(async () => stats(BigInt(600_000_000)))

    await expect(
      new ExtFloorPriceService().getFloorPrice(COLLECTION),
    ).resolves.toBe(600_000_000)
  })

  it("has no floor when nothing is listed", async () => {
    mockStats(async () => stats(BigInt(0)))

    await expect(
      new ExtFloorPriceService().getFloorPrice(COLLECTION),
    ).resolves.toBeUndefined()
  })

  it("has no floor when stats() fails", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined)
    mockStats(async () => {
      throw new Error("no stats method")
    })

    await expect(
      new ExtFloorPriceService().getFloorPrice(COLLECTION),
    ).resolves.toBeUndefined()
  })
})
