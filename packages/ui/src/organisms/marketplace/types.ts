import { BuyQuote, Listing } from "@nfid/integration/marketplace"

export enum MarketplaceType {
  Browsing = "browsing",
  MyListings = "my listings",
}
export interface MarketplaceListingWithFormatting extends Listing {
  imageUrl?: string
  collectionName: string
  floorPriceIcp?: string
  floorPriceUsd?: string
  isOwnListing: boolean
  icpPriceFormatted: string
  usdPriceFormatted: string
}

export interface BuyQuoteWithFormatting extends BuyQuote {
  icpPriceFormatted: string
  usdPriceFormatted: string
  icpFeeFormatted: string
  icpFeeUsdFormatted: string
  total: bigint
  totalFormatted: string
  totalUsdFormatted: string
  sellerReceivesFormatted: string
}
