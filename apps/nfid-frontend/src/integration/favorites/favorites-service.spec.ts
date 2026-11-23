import { Actor } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"

import { ttlCacheService } from "@nfid/client-db"
import { authState } from "@nfid/integration"

import {
  FAVORITES_CACHE_NAME,
  FavoritesService,
  tokenFavoriteId,
} from "./favorites-service"

jest.mock("@nfid-frontend/utils", () => ({
  ...jest.requireActual("@nfid-frontend/utils"),
  createAgent: jest.fn().mockResolvedValue({}),
}))

const PRINCIPAL =
  "kw2io-yqjdh-j7e5y-sjlzt-ka6ro-ojv35-gqwni-fq72a-wgkqs-alhrg-kqe"

describe("FavoritesService", () => {
  const actor = {
    favorites_get: jest.fn(),
    favorites_set_token: jest.fn(),
    favorites_set_contact: jest.fn(),
  }
  let getOrFetch: jest.SpyInstance

  beforeEach(() => {
    jest.spyOn(authState, "get").mockReturnValue({
      delegationIdentity: {
        getPrincipal: () => Principal.fromText(PRINCIPAL),
      },
    } as unknown as ReturnType<typeof authState.get>)
    jest
      .spyOn(Actor, "createActor")
      .mockReturnValue(actor as unknown as ReturnType<typeof Actor.createActor>)
    getOrFetch = jest
      .spyOn(ttlCacheService, "getOrFetch")
      .mockImplementation((_key, fetcher) => fetcher())
  })

  afterEach(() => {
    jest.restoreAllMocks()
    Object.values(actor).forEach((fn) => fn.mockReset())
  })

  it("builds token ids from chain and address", () => {
    expect(tokenFavoriteId(1, "0xabc")).toBe("1:0xabc")
  })

  it("reads favorites through the per-user cache, always revalidating", async () => {
    actor.favorites_get.mockResolvedValue({ tokens: ["1:0xabc"], contacts: [] })
    const onRevalidated = jest.fn()

    await expect(new FavoritesService().get(onRevalidated)).resolves.toEqual({
      tokens: ["1:0xabc"],
      contacts: [],
    })
    expect(getOrFetch).toHaveBeenCalledWith(
      `${FAVORITES_CACHE_NAME}${PRINCIPAL}`,
      expect.any(Function),
      expect.any(Number),
      { revalidate: "always", onRevalidated },
    )
  })

  it("sets a token or a contact and stores the result in the cache", async () => {
    const saved = { tokens: ["0:ryjl3"], contacts: ["c1"] }
    actor.favorites_set_token.mockResolvedValue({ Ok: saved })
    actor.favorites_set_contact.mockResolvedValue({ Ok: saved })
    const service = new FavoritesService()

    await expect(service.set("token", "0:ryjl3", true)).resolves.toEqual(saved)
    await expect(service.set("contact", "c1", false)).resolves.toEqual(saved)

    expect(actor.favorites_set_token).toHaveBeenCalledWith("0:ryjl3", true)
    expect(actor.favorites_set_contact).toHaveBeenCalledWith("c1", false)
    expect(getOrFetch).toHaveBeenCalledWith(
      `${FAVORITES_CACHE_NAME}${PRINCIPAL}`,
      expect.any(Function),
      expect.any(Number),
      { forceRefetch: true },
    )
  })

  it("throws the canister error", async () => {
    actor.favorites_set_token.mockResolvedValue({
      Err: { MaxFavoritesReached: null },
    })

    await expect(
      new FavoritesService().set("token", "x", true),
    ).rejects.toThrow("Favorites: MaxFavoritesReached")
  })

  it("requires a signed-in user", async () => {
    jest
      .spyOn(authState, "get")
      .mockReturnValue({} as ReturnType<typeof authState.get>)

    await expect(new FavoritesService().get()).rejects.toThrow("not signed in")
  })
})
