import { Principal } from "@icp-sdk/core/principal"

import { authState, exchangeRateService } from "@nfid/integration"
import {
  Listing,
  ListingQuery,
  marketplaceService,
} from "@nfid/integration/marketplace"
import {
  E8S,
  ICP_CANISTER_ID,
  ICP_DECIMALS,
  TRIM_ZEROS,
} from "@nfid/integration/token/constants"
import {
  BuyQuoteWithFormatting,
  MarketplaceListingWithFormatting,
} from "packages/ui/src/organisms/marketplace/types"

export const PAGE_SIZE = 8

const fetchTokenImageUrl = async (
  collectionId: string,
  tokenId: bigint,
): Promise<string | undefined> => {
  const metadataMap = await marketplaceService.getTokenMetadata(collectionId, [
    tokenId,
  ])
  const entries = metadataMap.get(tokenId) ?? []
  const imageEntry = entries.find(
    ([key]) =>
      key === "icrc7:metadata:uri:image" ||
      key === "icrc7:metadata:image" ||
      key === "icrc7:image",
  )
  if (!imageEntry) return undefined
  const value = imageEntry[1]
  if ("Text" in value) return value.Text
  return undefined
}

const enrichListing = async (
  listing: Listing,
  isOwnListing: boolean,
): Promise<MarketplaceListingWithFormatting> => {
  const [imageUrl, collectionMeta, usdPrice] = await Promise.all([
    fetchTokenImageUrl(listing.collectionId, listing.tokenId),
    marketplaceService.getCollectionMetadata(listing.collectionId),
    exchangeRateService.usdPriceForICRC1(ICP_CANISTER_ID),
  ])
  return {
    ...listing,
    imageUrl,
    collectionName: collectionMeta.name,
    isOwnListing,
    icpPriceFormatted: `${(Number(listing.priceE8s) / E8S).toFixed(ICP_DECIMALS).replace(TRIM_ZEROS, "")} ICP`,
    usdPriceFormatted: !usdPrice
      ? "Unknown"
      : `${usdPrice.value.multipliedBy(Number(listing.priceE8s) / E8S).toFixed(2)} USD`,
    floorPriceIcp: "",
  }
}

export const fetchListings = async (
  pageNumber: number,
  query?: Omit<ListingQuery, "offset">,
): Promise<{ items: MarketplaceListingWithFormatting[]; total: number }> => {
  const { publicKey } = authState.getUserIdData()
  const limit = query?.limit ?? PAGE_SIZE
  const page = await marketplaceService.getListings({
    ...query,
    offset: (pageNumber - 1) * limit,
    limit,
  })
  const items = await Promise.all(
    page.items.map((listing) =>
      enrichListing(listing, listing.seller === publicKey),
    ),
  )
  return { items, total: page.total }
}

export const fetchListingById = async (
  id: bigint,
): Promise<MarketplaceListingWithFormatting | undefined> => {
  const { publicKey } = authState.getUserIdData()
  const listing = await marketplaceService.getListing(id)
  if (!listing) return undefined
  return enrichListing(listing, listing.seller === publicKey)
}

export const fetchListingForNFT = async (
  collectionId: string,
  tokenId: string,
): Promise<MarketplaceListingWithFormatting | undefined> => {
  const { publicKey } = authState.getUserIdData()
  const page = await marketplaceService.getListings({
    collectionId,
    limit: 100,
  })
  const listing = page.items.find((l) => l.tokenId.toString() === tokenId)
  if (!listing) return undefined
  return enrichListing(listing, listing.seller === publicKey)
}

export const fetchSellerListings = async (): Promise<
  MarketplaceListingWithFormatting[]
> => {
  const { publicKey } = authState.getUserIdData()
  const listings = await marketplaceService.getListingsBySeller(
    Principal.fromText(publicKey),
  )
  const active = listings.filter((l) => l.status === "Active")
  return Promise.all(active.map((listing) => enrichListing(listing, true)))
}

export const fetchBuyQuote = async (
  id: bigint,
): Promise<BuyQuoteWithFormatting> => {
  const [buyQuote, usdPrice] = await Promise.all([
    marketplaceService.getBuyQuote(id),
    exchangeRateService.usdPriceForICRC1(ICP_CANISTER_ID),
  ])

  return {
    ...buyQuote,
    icpPriceFormatted: `${(Number(buyQuote.priceE8s) / E8S).toFixed(ICP_DECIMALS).replace(TRIM_ZEROS, "")} ICP`,
    usdPriceFormatted: !usdPrice
      ? "Unknown"
      : `${usdPrice.value.multipliedBy(Number(buyQuote.priceE8s) / E8S).toFixed(2)} USD`,
    icpFeeFormatted: `${((Number(buyQuote.ledgerFeeE8s) * 3) / E8S).toFixed(ICP_DECIMALS).replace(TRIM_ZEROS, "")} ICP`,
    icpFeeUsdFormatted: !usdPrice
      ? "Unknown"
      : `${usdPrice.value.multipliedBy((Number(buyQuote.ledgerFeeE8s) * 3) / E8S).toFixed(2)} USD`,
    total: buyQuote.totalCostE8s,
    totalFormatted: `${(Number(buyQuote.totalCostE8s) / E8S).toFixed(ICP_DECIMALS).replace(TRIM_ZEROS, "")} ICP`,
    totalUsdFormatted: !usdPrice
      ? "Unknown"
      : `${usdPrice.value.multipliedBy(Number(buyQuote.totalCostE8s) / E8S).toFixed(2)} USD`,
    sellerReceivesFormatted: `${(Number(buyQuote.sellerReceivesE8s) / E8S).toFixed(ICP_DECIMALS).replace(TRIM_ZEROS, "")} ICP`,
  }
}
