import { State } from "../token/icrc1/enum/enums"
import { Icrc7RegistryService } from "./icrc7-registry-service"

const store = new Map<string, unknown>()
jest.mock("@nfid/client-db", () => ({
  storageWithTtl: {
    remove: jest.fn(async (k: string) => void store.delete(k)),
  },
  ttlCacheService: {
    getOrFetch: jest.fn(async (k: string, fetch: () => Promise<unknown>) => {
      if (!store.has(k)) store.set(k, await fetch())
      return store.get(k)
    }),
  },
}))

const registry = new Map<string, "Active" | "Inactive">()
jest.mock("../actors", () => ({
  userRegistry: {
    get_icrc7_collections_by_root: jest.fn(async () =>
      Array.from(registry, ([canister_id, s]) => ({
        canister_id,
        state: { [s]: null },
      })),
    ),
    store_icrc7_collection: jest.fn(
      async (id: string, state: Record<string, null>) =>
        void registry.set(id, Object.keys(state)[0] as "Active" | "Inactive"),
    ),
    remove_icrc7_collection: jest.fn(
      async (id: string) => void registry.delete(id),
    ),
  },
}))

jest.mock("../authentication", () => ({
  authState: { getUserIdData: () => ({ userId: "root", anchor: 1 }) },
}))

const COLLECTION = "vehwg-aiaaa-aaaag-aciuq-cai"

describe("Icrc7RegistryService", () => {
  it("stores, hides and removes a collection, refreshing the cache", async () => {
    const service = new Icrc7RegistryService()
    expect(await service.getStoredCollections()).toEqual([])

    await service.storeCollection(COLLECTION, State.Active)
    expect(await service.getStoredCollections()).toEqual([
      { canisterId: COLLECTION, state: State.Active },
    ])

    await service.storeCollection(COLLECTION, State.Inactive)
    expect(await service.getStoredCollections()).toEqual([
      { canisterId: COLLECTION, state: State.Inactive },
    ])

    await service.removeCollection(COLLECTION)
    expect(await service.getStoredCollections()).toEqual([])
  })
})
