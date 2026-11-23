import { encodeTokenIdentifier } from "src/integration/entrepot/ext"
import { MarketPlace } from "src/integration/nft/enum/enums"
import { IcpNftToken } from "src/integration/nft/sources/nft-sources-types"

interface MockRegistry {
  registry: Record<
    string,
    {
      tokens: Array<{
        timeMillis: number
        tokenId: number
        [k: string]: unknown
      }>
      tokenFloorPriceIcp?: number
      [k: string]: unknown
    }
  >
  collections: Array<{
    canisterId: string
    name: string
    interface: string
    [k: string]: unknown
  }>
}

/** Owned tokens and collections of the test principal (former NFTGeek fixture). */
const mockRegistry: MockRegistry = {
  registry: {
    "lix2q-6yaaa-aaaal-qdbaa-cai": {
      tokens: [
        {
          timeMillis: 1721253656611,
          tokenId: 1480,
          uniqueIdentifier: {
            uniqueIdentifierType: "ACCOUNT_IDENTIFIER",
            id: "0051449d6ed40385865c7ddd44e1ce87a4e0c3d054bd86b936a9aedf094f62df",
          },
        },
      ],
      tokenFloorPriceIcp: 6000000,
      tokenFloorPriceUsd: 6143,
    },
    "64x4q-laaaa-aaaal-qdjca-cai": {
      tokens: [
        {
          timeMillis: 1721253726158,
          tokenId: 2066,
          uniqueIdentifier: {
            uniqueIdentifierType: "ACCOUNT_IDENTIFIER",
            id: "0051449d6ed40385865c7ddd44e1ce87a4e0c3d054bd86b936a9aedf094f62df",
          },
        },
      ],
      tokenFloorPriceIcp: 2000000,
      tokenFloorPriceUsd: 4607,
    },
    "nbg4r-saaaa-aaaah-qap7a-cai": {
      tokens: [
        {
          timeMillis: 1721253656133,
          tokenId: 963,
          uniqueIdentifier: {
            uniqueIdentifierType: "ACCOUNT_IDENTIFIER",
            id: "0051449d6ed40385865c7ddd44e1ce87a4e0c3d054bd86b936a9aedf094f62df",
          },
        },
      ],
      tokenFloorPriceIcp: 75000000,
      tokenFloorPriceUsd: 76795,
    },
    "p5jg7-6aaaa-aaaah-qcolq-cai": {
      tokens: [
        {
          timeMillis: 1721254927631,
          tokenId: 695,
          uniqueIdentifier: {
            uniqueIdentifierType: "ACCOUNT_IDENTIFIER",
            id: "0051449d6ed40385865c7ddd44e1ce87a4e0c3d054bd86b936a9aedf094f62df",
          },
        },
      ],
      tokenFloorPriceIcp: 10000,
      tokenFloorPriceUsd: 10,
    },
    "yzrp5-oaaaa-aaaah-ad2xa-cai": {
      tokens: [
        {
          timeMillis: 1721253579367,
          tokenId: 9103,
          uniqueIdentifier: {
            uniqueIdentifierType: "ACCOUNT_IDENTIFIER",
            id: "0051449d6ed40385865c7ddd44e1ce87a4e0c3d054bd86b936a9aedf094f62df",
          },
        },
      ],
    },
    "fab4i-diaaa-aaaah-acr2q-cai": {
      tokens: [
        {
          timeMillis: 1721253579367,
          tokenId: 4612,
          uniqueIdentifier: {
            uniqueIdentifierType: "ACCOUNT_IDENTIFIER",
            id: "0051449d6ed40385865c7ddd44e1ce87a4e0c3d054bd86b936a9aedf094f62df",
          },
        },
      ],
    },
    "gfcya-pyaaa-aaaan-qbxda-cai": {
      tokens: [
        {
          timeMillis: 1721253502478,
          tokenId: 6050,
          uniqueIdentifier: {
            uniqueIdentifierType: "ACCOUNT_IDENTIFIER",
            id: "0051449d6ed40385865c7ddd44e1ce87a4e0c3d054bd86b936a9aedf094f62df",
          },
        },
      ],
      tokenFloorPriceIcp: 20000000,
      tokenFloorPriceUsd: 20478,
    },
    "p5rex-yqaaa-aaaag-qb42a-cai": {
      tokens: [
        {
          timeMillis: 1721253502478,
          tokenId: 92,
          uniqueIdentifier: {
            uniqueIdentifierType: "ACCOUNT_IDENTIFIER",
            id: "0051449d6ed40385865c7ddd44e1ce87a4e0c3d054bd86b936a9aedf094f62df",
          },
        },
      ],
      tokenFloorPriceIcp: 20000000,
      tokenFloorPriceUsd: 20478,
    },
    "gdeb6-lqaaa-aaaah-abvpq-cai": {
      tokens: [
        {
          timeMillis: 1721253214177,
          tokenId: 5671,
          uniqueIdentifier: {
            uniqueIdentifierType: "ACCOUNT_IDENTIFIER",
            id: "0051449d6ed40385865c7ddd44e1ce87a4e0c3d054bd86b936a9aedf094f62df",
          },
        },
        {
          timeMillis: 1721253870829,
          tokenId: 5002,
          uniqueIdentifier: {
            uniqueIdentifierType: "ACCOUNT_IDENTIFIER",
            id: "0051449d6ed40385865c7ddd44e1ce87a4e0c3d054bd86b936a9aedf094f62df",
          },
        },
      ],
    },
    "ok3ug-2iaaa-aaaag-qbilq-cai": {
      tokens: [
        {
          timeMillis: 1721253870829,
          tokenId: 2226,
          uniqueIdentifier: {
            uniqueIdentifierType: "ACCOUNT_IDENTIFIER",
            id: "0051449d6ed40385865c7ddd44e1ce87a4e0c3d054bd86b936a9aedf094f62df",
          },
        },
      ],
    },
  },
  collections: [
    {
      canisterId: "lix2q-6yaaa-aaaal-qdbaa-cai",
      name: "IC KONG",
      alias: "ic-kong",
      interface: "EXT",
    },
    {
      canisterId: "64x4q-laaaa-aaaal-qdjca-cai",
      name: "Cellphones",
      alias: "cellphones",
      interface: "EXT",
    },
    {
      canisterId: "nbg4r-saaaa-aaaah-qap7a-cai",
      name: "Starverse",
      alias: "starverse",
      interface: "EXT",
    },
    {
      canisterId: "gdeb6-lqaaa-aaaah-abvpq-cai",
      name: "Boxy Land",
      alias: "boxyland",
      interface: "MEMECAKE",
    },
    {
      canisterId: "p5jg7-6aaaa-aaaah-qcolq-cai",
      name: "ICAliens",
      alias: "icaliens",
      interface: "EXT",
    },
    {
      canisterId: "gfcya-pyaaa-aaaan-qbxda-cai",
      name: "SNS&GHOST NFT",
      alias: "snsandghostnft",
      interface: "ICPSWAP",
    },
    {
      canisterId: "p5rex-yqaaa-aaaag-qb42a-cai",
      name: "SNS&GHOST NFT",
      alias: "snsandghostnft",
      interface: "ICPSWAP",
    },
    {
      canisterId: "yzrp5-oaaaa-aaaah-ad2xa-cai",
      name: "Mifoko",
      alias: "",
      interface: "YUKU",
    },
    {
      canisterId: "fab4i-diaaa-aaaah-acr2q-cai",
      name: "ICTempies",
      alias: "",
      interface: "YUKU",
    },
    {
      canisterId: "ok3ug-2iaaa-aaaag-qbilq-cai",
      name: "ICTempies",
      alias: "",
      interface: "EXT",
    },
  ],
}

/** EXT tokens as `entrepotSource.getUserTokens` returns them (no floor price). */
export const mockExtTokens: IcpNftToken[] = mockRegistry.collections
  .filter((c) => c.interface === "EXT")
  .flatMap((c) =>
    (mockRegistry.registry[c.canisterId]?.tokens ?? []).map((t) => ({
      marketPlace: MarketPlace.EXT as const,
      tokenId: encodeTokenIdentifier(c.canisterId, t.tokenId),
      tokenNumber: t.tokenId,
      collectionId: c.canisterId,
      collectionName: c.name,
      millis: t.timeMillis,
    })),
  )

/** Floor prices in e8s by collection, as `extFloorPriceService` returns them. */
export const mockExtFloorPrices: Record<string, number | undefined> =
  Object.fromEntries(
    Object.entries(mockRegistry.registry).map(([id, r]) => [
      id,
      r.tokenFloorPriceIcp,
    ]),
  )
