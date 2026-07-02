export interface PromotionConfig {
  minBidE8s: bigint
  bidIncrementE8s: bigint
  lockedPeriodMs: number
  featureDurationMs: number
  ledgerCanisterId: string
  treasuryPrincipal: string
}

export interface FeaturedSlot {
  appId: number
  bidder: string
  bidAmountE8s: bigint
  bidTime: Date
  lockedUntil: Date
  expiresAt: Date
}

export interface PromotionStatus {
  config: PromotionConfig
  featured?: FeaturedSlot
  minNextBidE8s: bigint
  locked: boolean
  now: Date
}

export interface HistoricalBid {
  appId: number
  bidder: string
  bidAmountE8s: bigint
  bidTime: Date
}

export type PlaceBidError =
  | { kind: "locked"; until: Date }
  | { kind: "belowFloor"; floorE8s: bigint }
  | { kind: "belowIncrement"; requiredE8s: bigint }
  | { kind: "unknownApp" }
  | { kind: "transferFailed"; message: string }
  | { kind: "notConfigured" }

export class PromotionError extends Error {
  constructor(public readonly cause: PlaceBidError) {
    super(cause.kind)
    this.name = "PromotionError"
  }
}

export interface PromoteData {
  fee: bigint
  feeFormatted: string
  feeUsdFormatted: string
  targetAddress: string
  dappName: string
  minAmount: number
}
