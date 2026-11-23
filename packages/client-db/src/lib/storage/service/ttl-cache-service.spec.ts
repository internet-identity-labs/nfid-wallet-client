import { TtlStorage } from "../ttl-storage"

import { TtlCacheService } from "./ttl-cache-service"

type Entry = { value: unknown; expired: boolean }

class FakeStorage {
  readonly entries = new Map<string, Entry>()
  readonly set = jest.fn(async (key: string, value: unknown) => {
    this.entries.set(key, { value, expired: false })
  })

  async getEvenExpired(key: string): Promise<Entry | undefined> {
    return this.entries.get(key)
  }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe("TtlCacheService", () => {
  let storage: FakeStorage
  let service: TtlCacheService

  beforeEach(() => {
    storage = new FakeStorage()
    service = new TtlCacheService(storage as unknown as TtlStorage<unknown>)
  })

  it("fetches and stores when nothing is cached", async () => {
    const fetcher = jest.fn().mockResolvedValue("fresh")

    await expect(service.getOrFetch("k", fetcher, 1000)).resolves.toBe("fresh")

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(storage.set).toHaveBeenCalledWith("k", "fresh", 1000)
  })

  it("returns a fresh cache without fetching by default", async () => {
    storage.entries.set("k", { value: "cached", expired: false })
    const fetcher = jest.fn().mockResolvedValue("fresh")

    await expect(service.getOrFetch("k", fetcher, 1000)).resolves.toBe("cached")
    await flush()

    expect(fetcher).not.toHaveBeenCalled()
  })

  it("returns an expired cache and refreshes it in background", async () => {
    storage.entries.set("k", { value: "stale", expired: true })
    const fetcher = jest.fn().mockResolvedValue("fresh")
    const onRevalidated = jest.fn()

    await expect(
      service.getOrFetch("k", fetcher, 1000, { onRevalidated }),
    ).resolves.toBe("stale")
    await flush()

    expect(storage.entries.get("k")?.value).toBe("fresh")
    expect(onRevalidated).toHaveBeenCalledWith("fresh")
  })

  it('with revalidate "always" refreshes a fresh cache too', async () => {
    storage.entries.set("k", { value: "cached", expired: false })
    const fetcher = jest.fn().mockResolvedValue("fresh")
    const onRevalidated = jest.fn()

    await expect(
      service.getOrFetch("k", fetcher, 1000, {
        revalidate: "always",
        onRevalidated,
      }),
    ).resolves.toBe("cached")
    await flush()

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(onRevalidated).toHaveBeenCalledWith("fresh")
  })

  it("does not report a refresh that returns the cached value", async () => {
    storage.entries.set("k", { value: { a: 1 }, expired: false })
    const onRevalidated = jest.fn()

    await service.getOrFetch("k", async () => ({ a: 1 }), 1000, {
      revalidate: "always",
      onRevalidated,
    })
    await flush()

    expect(onRevalidated).not.toHaveBeenCalled()
  })

  it("shares one background refresh between concurrent calls", async () => {
    storage.entries.set("k", { value: "cached", expired: false })
    let resolve: (value: string) => void = () => undefined
    const fetcher = jest.fn(() => new Promise<string>((r) => (resolve = r)))

    await Promise.all([
      service.getOrFetch("k", fetcher, 1000, { revalidate: "always" }),
      service.getOrFetch("k", fetcher, 1000, { revalidate: "always" }),
    ])
    resolve("fresh")
    await flush()

    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it("keeps the cache and reports a failed background refresh", async () => {
    storage.entries.set("k", { value: "cached", expired: true })
    const error = new Error("offline")
    const onBackgroundError = jest.fn()

    await expect(
      service.getOrFetch("k", () => Promise.reject(error), 1000, {
        onBackgroundError,
      }),
    ).resolves.toBe("cached")
    await flush()

    expect(onBackgroundError).toHaveBeenCalledWith(error)
    expect(storage.entries.get("k")?.value).toBe("cached")
  })

  it("serializes on store and deserializes on read", async () => {
    storage.entries.set("k", { value: "2", expired: false })

    await expect(
      service.getOrFetch("k", async () => BigInt(3), 1000, {
        serialize: (v) => v.toString(),
        deserialize: (v) => BigInt(v as string),
      }),
    ).resolves.toBe(BigInt(2))
  })
})
