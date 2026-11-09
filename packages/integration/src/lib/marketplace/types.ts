export type NftCollectionStatus = "Verified" | "Community" | "Spam" | "Hidden"

export interface NftCollection {
  canisterId: string
  name: string
  symbol: string
  logo?: string
  description?: string
  status: NftCollectionStatus
  dateAdded: Date
  /** NFTs of this collection can be listed and bought (Verified or Community). */
  tradable: boolean
}

export interface NftCollectionRequest {
  canisterId: string
  name: string
  symbol: string
  logo?: string
  description?: string
}

export interface MarketplaceConfig {
  icpLedgerId: string
  minPriceE8s: bigint
  maxRetries: number
}

export type ListingStatus = "Active" | "Locked" | "Sold" | "Cancelled"

export interface Listing {
  id: bigint
  collectionId: string
  tokenId: bigint
  seller: string
  priceE8s: bigint
  /** Locked: a purchase is in progress. */
  status: ListingStatus
  createdAt: Date
  updatedAt: Date
}

export type ListingSort = "PriceAsc" | "PriceDesc" | "Newest" | "Oldest"

export interface ListingQuery {
  /** Only this collection. */
  collectionId?: string
  /** Default "Newest". */
  sort?: ListingSort
  /** Default 0. */
  offset?: number
  /** Default 25, max 100. */
  limit?: number
}

export interface ListingPage {
  items: Listing[]
  /** All matches before paging. */
  total: number
}

export interface CreateListingParams {
  collectionId: string
  tokenId: bigint
  priceE8s: bigint
}

/**
 * Pending statuses name the step that runs next; the marketplace retries
 * them every 5 minutes. The rest are final.
 */
export type MarketplaceTxStatus =
  | "PaymentPending"
  | "NftTransferPending"
  | "PayoutPending"
  | "RefundPending"
  | "Completed"
  | "Refunded"
  | "Failed"
  | "ClosedByAdmin"

export interface MarketplaceTx {
  id: bigint
  listingId: bigint
  collectionId: string
  tokenId: bigint
  seller: string
  buyer: string
  priceE8s: bigint
  feeE8s: bigint
  status: MarketplaceTxStatus
  /** Retries ran out; waits for support. */
  needsReview: boolean
  lastError?: string
  paymentBlock?: bigint
  nftBlock?: bigint
  /** Block of the payout (Completed) or refund (Refunded). */
  settleBlock?: bigint
  createdAt: Date
  updatedAt: Date
}

/** What a purchase costs the buyer and what the seller gets. */
export interface BuyQuote {
  priceE8s: bigint
  ledgerFeeE8s: bigint
  /** price + approve fee + transfer fee. */
  totalCostE8s: bigint
  /** price - payout fee. */
  sellerReceivesE8s: bigint
}

export type MarketplaceErrorCause =
  | { kind: "notConfigured" }
  | { kind: "unauthorized" }
  | { kind: "anonymousCaller" }
  | { kind: "collectionNotFound" }
  | { kind: "collectionNotAllowed" }
  | { kind: "priceTooLow"; minPriceE8s: bigint }
  | { kind: "notOwner" }
  | { kind: "notApproved" }
  | { kind: "alreadyListed"; listingId: bigint }
  | { kind: "listingNotFound" }
  | { kind: "listingNotActive" }
  | { kind: "purchaseInProgress" }
  | { kind: "cannotBuyOwnListing" }
  | { kind: "nftUnavailable" }
  | { kind: "paymentFailed"; message: string }
  | { kind: "callFailed"; message: string }
  | { kind: "txNotFound" }
  | { kind: "invalidTxState" }
  /** The collection did not record the ICRC-37 approval. */
  | { kind: "approvalFailed" }

export class MarketplaceError extends Error {
  constructor(public readonly cause: MarketplaceErrorCause) {
    super(cause.kind)
    this.name = "MarketplaceError"
  }
}

/** The buyer has the NFT (the seller payout may still be retrying). */
export function isPurchaseSuccessful(tx: MarketplaceTx): boolean {
  return tx.status === "Completed" || tx.status === "PayoutPending"
}
