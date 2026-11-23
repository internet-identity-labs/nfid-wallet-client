import { AccountIdentifier } from "@icp-sdk/canisters/ledger/icp"
import { Principal } from "@icp-sdk/core/principal"
import { encodeTokenIdentifier } from "src/integration/entrepot/ext"
import { MarketPlace } from "src/integration/nft/enum/enums"

import { ttlCacheService } from "@nfid/client-db"

import { ENTREPOT_API, EntrepotSource } from "./entrepot-source"

const principal = Principal.fromText(
  "j5zf4-bzab2-e5w4v-kagxz-p35gy-vqyam-gazwu-vhgmz-bb3bh-nlwxc-tae",
)
const accountId = AccountIdentifier.fromPrincipal({ principal }).toHex()

const EXT = "64x4q-laaaa-aaaal-qdjca-cai"
const LEGACY = "nbg4r-saaaa-aaaah-qap7a-cai"
const OTHER = "p5jg7-6aaaa-aaaah-qcolq-cai"
const UNKNOWN = "lix2q-6yaaa-aaaal-qdbaa-cai"

const collections = [
  { id: EXT, name: "Cellphones ", standard: "ext" },
  { id: LEGACY, name: "Starverse", standard: "legacy1.5" },
  { id: OTHER, name: "Other", standard: "icrc7" },
]

const userTokens = [
  {
    id: encodeTokenIdentifier(EXT, 2066),
    owner: accountId,
    canister: EXT,
    price: 0,
    time: 1721253726158000000,
  },
  {
    id: encodeTokenIdentifier(LEGACY, 963),
    owner: accountId,
    canister: LEGACY,
    price: 0,
    time: 0,
  },
  { id: "not-a-token-id", owner: accountId, canister: EXT, price: 0, time: 0 },
  {
    id: encodeTokenIdentifier(OTHER, 1),
    owner: accountId,
    canister: OTHER,
    price: 0,
    time: 0,
  },
  {
    id: encodeTokenIdentifier(UNKNOWN, 2),
    owner: accountId,
    canister: UNKNOWN,
    price: 0,
    time: 0,
  },
]

const respond = (body: unknown, ok = true) =>
  Promise.resolve({ ok, status: ok ? 200 : 500, json: async () => body })

describe("EntrepotSource", () => {
  const fetchMock = jest.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    global.fetch = fetchMock as unknown as typeof fetch
    jest
      .spyOn(ttlCacheService, "getOrFetch")
      .mockImplementation((_key, fetcher) => fetcher())
  })

  afterEach(() => jest.restoreAllMocks())

  it("maps the user's EXT and legacy tokens and skips the rest", async () => {
    fetchMock.mockImplementation((url: string) =>
      respond(url.endsWith("/collections") ? collections : userTokens),
    )

    const tokens = await new EntrepotSource().getUserTokens(principal)

    expect(fetchMock).toHaveBeenCalledWith(
      `${ENTREPOT_API}/user/${accountId}/all`,
      expect.anything(),
    )
    expect(tokens).toEqual([
      {
        marketPlace: MarketPlace.EXT,
        tokenId: encodeTokenIdentifier(EXT, 2066),
        tokenNumber: 2066,
        collectionId: EXT,
        collectionName: "Cellphones",
        millis: 1721253726158,
      },
      {
        marketPlace: MarketPlace.EXT,
        tokenId: encodeTokenIdentifier(LEGACY, 963),
        tokenNumber: 963,
        collectionId: LEGACY,
        collectionName: "Starverse",
        millis: 0,
      },
    ])
  })

  it("fails when Entrepot answers with an error", async () => {
    fetchMock.mockImplementation((url: string) =>
      url.endsWith("/collections") ? respond(collections) : respond({}, false),
    )

    await expect(new EntrepotSource().getUserTokens(principal)).rejects.toThrow(
      "Entrepot 500",
    )
  })
})
