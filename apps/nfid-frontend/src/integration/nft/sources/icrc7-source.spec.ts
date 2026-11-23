import { Principal } from "@icp-sdk/core/principal"
import { MarketPlace } from "src/integration/nft/enum/enums"

import { ttlCacheService } from "@nfid/client-db"
import {
  icrc7RegistryService,
  Listing,
  marketplaceService,
  NftCollection,
} from "@nfid/integration/marketplace"
import { State } from "@nfid/integration/token/icrc1/enum/enums"

import { Icrc7Source } from "./icrc7-source"

const user = Principal.fromText(
  "kw2io-yqjdh-j7e5y-sjlzt-ka6ro-ojv35-gqwni-fq72a-wgkqs-alhrg-kqe",
)

const collection = (
  canisterId: string,
  status: NftCollection["status"],
): NftCollection => ({
  canisterId,
  name: `Collection ${canisterId.slice(0, 5)}`,
  symbol: "C",
  logo: `logo-${canisterId.slice(0, 5)}`,
  status,
  dateAdded: new Date(0),
  tradable: true,
})

const ORBS = "pwy6s-kiaaa-aaaak-acm3q-cai"
const TEST = "vehwg-aiaaa-aaaag-aciuq-cai"
const SPAM = "ryjl3-tyaaa-aaaaa-aaaba-cai"
const HIDDEN = "mxzaz-hqaaa-aaaar-qaada-cai"

const listing = (priceE8s: bigint, status: Listing["status"]): Listing => ({
  id: BigInt(1),
  collectionId: ORBS,
  tokenId: BigInt(1),
  seller: "s",
  priceE8s,
  status,
  createdAt: new Date(0),
  updatedAt: new Date(0),
})

describe("Icrc7Source", () => {
  beforeEach(() => {
    jest
      .spyOn(ttlCacheService, "getOrFetch")
      .mockImplementation((_key, fetcher) => fetcher())
    jest
      .spyOn(marketplaceService, "getCollections")
      .mockResolvedValue([
        collection(ORBS, "Verified"),
        collection(TEST, "Community"),
        collection(SPAM, "Spam"),
        collection(HIDDEN, "Hidden"),
      ])
    jest
      .spyOn(icrc7RegistryService, "getStoredCollections")
      .mockResolvedValue([{ canisterId: TEST, state: State.Inactive }])
  })

  afterEach(() => jest.restoreAllMocks())

  it("skips Spam, Hidden and, for the own wallet, Inactive collections", async () => {
    const source = new Icrc7Source()

    expect(
      (await source.getCollections(false)).map((c) => c.canisterId),
    ).toEqual([ORBS, TEST])
    expect(
      (await source.getCollections(true)).map((c) => c.canisterId),
    ).toEqual([ORBS])
  })

  it("loads owned tokens with metadata and the lowest active listing", async () => {
    const owned = jest
      .spyOn(marketplaceService, "getOwnedTokenIds")
      .mockImplementation(async (id) =>
        id === ORBS ? [BigInt(1), BigInt(6)] : [],
      )
    jest.spyOn(marketplaceService, "getTokenMetadata").mockResolvedValue(
      new Map([
        [
          BigInt(1),
          [
            ["icrc7:name", { Text: "NFID Orb #1" }],
            ["icrc7:image", { Text: "data:image/svg+xml;base64,AA" }],
            ["icrc7:description", { Text: "A violet orb" }],
          ],
        ],
        [BigInt(6), []],
      ]),
    )
    jest.spyOn(marketplaceService, "getListings").mockResolvedValue({
      items: [
        listing(BigInt(50_000_000), "Locked"),
        listing(BigInt(70_000_000), "Active"),
        listing(BigInt(90_000_000), "Active"),
      ],
      total: 3,
    })

    const tokens = await new Icrc7Source().getUserTokens(user, false)

    expect(owned).toHaveBeenCalledWith(ORBS, user, {
      prev: undefined,
      take: BigInt(100),
    })
    expect(tokens).toEqual([
      {
        marketPlace: MarketPlace.ICRC7,
        tokenId: `${ORBS}:1`,
        tokenNumber: 1,
        collectionId: ORBS,
        collectionName: `Collection pwy6s`,
        millis: 0,
        tokenFloorPriceIcp: 70_000_000,
        name: "NFID Orb #1",
        image: "data:image/svg+xml;base64,AA",
        description: "A violet orb",
        collectionLogo: "logo-pwy6s",
      },
      expect.objectContaining({
        tokenId: `${ORBS}:6`,
        tokenNumber: 6,
        name: undefined,
        image: undefined,
      }),
    ])
  })

  it("pages through icrc7_tokens_of", async () => {
    const page = Array.from({ length: 100 }, (_, i) => BigInt(i + 1))
    const owned = jest
      .spyOn(marketplaceService, "getOwnedTokenIds")
      .mockImplementation(async (id, _owner, opts) => {
        if (id !== ORBS) return []
        return opts?.prev === undefined ? page : [BigInt(101)]
      })
    jest
      .spyOn(marketplaceService, "getTokenMetadata")
      .mockResolvedValue(new Map())
    jest
      .spyOn(marketplaceService, "getListings")
      .mockResolvedValue({ items: [], total: 0 })

    const tokens = await new Icrc7Source().getUserTokens(user, false)

    expect(tokens).toHaveLength(101)
    expect(owned).toHaveBeenCalledWith(ORBS, user, {
      prev: BigInt(100),
      take: BigInt(100),
    })
    expect(tokens[0].tokenFloorPriceIcp).toBeUndefined()
  })

  it("skips a failing collection and keeps the others", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined)
    jest
      .spyOn(marketplaceService, "getOwnedTokenIds")
      .mockImplementation(async (id) => {
        if (id === ORBS) throw new Error("trap")
        return [BigInt(9)]
      })
    jest
      .spyOn(marketplaceService, "getTokenMetadata")
      .mockResolvedValue(new Map())
    jest
      .spyOn(marketplaceService, "getListings")
      .mockResolvedValue({ items: [], total: 0 })

    const tokens = await new Icrc7Source().getUserTokens(user, false)

    expect(tokens.map((t) => t.tokenId)).toEqual([`${TEST}:9`])
  })
})
