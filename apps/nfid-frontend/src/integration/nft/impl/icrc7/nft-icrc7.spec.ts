import BigNumber from "bignumber.js"
import { MarketPlace } from "src/integration/nft/enum/enums"
import { NftImpl } from "src/integration/nft/impl/nft-abstract"
import { IcpNftToken } from "src/integration/nft/sources/nft-sources-types"

import { exchangeRateService } from "@nfid/integration"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

import { ICRC7_PLACEHOLDER_IMAGE, NftIcrc7 } from "./nft-icrc7"

const ORBS = "pwy6s-kiaaa-aaaak-acm3q-cai"

const token = (overrides: Partial<IcpNftToken> = {}): IcpNftToken => ({
  marketPlace: MarketPlace.ICRC7,
  tokenId: `${ORBS}:1`,
  tokenNumber: 1,
  collectionId: ORBS,
  collectionName: "NFID Orbs",
  millis: 0,
  ...overrides,
})

describe("NftIcrc7", () => {
  beforeEach(() => {
    jest
      .spyOn(NftImpl.prototype as never, "getCanisterStatus")
      .mockResolvedValue(undefined as never)
    jest
      .spyOn(exchangeRateService, "getICP2USD")
      .mockReturnValue(new BigNumber(10))
  })

  afterEach(() => jest.restoreAllMocks())

  it("uses the token metadata", async () => {
    const nft = new NftIcrc7(
      token({
        name: "NFID Orb #1",
        image: "https://img/1.png",
        description: "A violet orb",
        tokenFloorPriceIcp: 70_000_000,
      }),
    )
    await nft.init()

    expect(nft.getError()).toBeUndefined()
    expect(nft.getTokenName()).toBe("NFID Orb #1")
    expect(nft.getTokenId()).toBe(`${ORBS}:1`)
    expect(nft.getTokenNumber()).toBe(1)
    expect(nft.getMarketPlace()).toBe(MarketPlace.ICRC7)
    expect(nft.getNftStandard()).toBe("ICRC-7")
    expect(nft.getChainId()).toBe(ChainId.ICP)
    expect(nft.getAssetPreview()).toEqual({
      format: "img",
      url: "https://img/1.png",
    })
    expect(nft.getTokenFloorPriceFormatted()).toBe("0.7 ICP")
    expect(nft.getTokenFloorPriceUSD()).toBe(7)

    const details = await nft.getDetails()
    expect(details.getAbout()).toBe("A violet orb")
    await expect(details.getTransactions(0, 10)).resolves.toEqual({
      activity: [],
      isLastPage: true,
    })
    await expect(details.getProperties()).resolves.toEqual({
      mappedValues: [],
    })
  })

  it("falls back to the collection name, logo and a placeholder", async () => {
    const withLogo = new NftIcrc7(token({ collectionLogo: "logo.png" }))
    const bare = new NftIcrc7(token({ tokenNumber: 7, tokenId: `${ORBS}:7` }))
    await Promise.all([withLogo.init(), bare.init()])

    expect(bare.getTokenName()).toBe("NFID Orbs #7")
    expect(withLogo.getAssetPreview()?.url).toBe("logo.png")
    expect(bare.getAssetPreview()?.url).toBe(ICRC7_PLACEHOLDER_IMAGE)
    expect(bare.getTokenFloorPrice()).toBeUndefined()
  })
})
