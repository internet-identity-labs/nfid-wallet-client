import { mapError } from "./marketplace-service"
import { MarketplaceTx, isPurchaseSuccessful } from "./types"

describe("marketplace mapError", () => {
  it("maps unit variants to camelCase kinds", () => {
    expect(mapError({ NotOwner: null })).toEqual({ kind: "notOwner" })
    expect(mapError({ CannotBuyOwnListing: null })).toEqual({
      kind: "cannotBuyOwnListing",
    })
    expect(mapError({ NftUnavailable: null })).toEqual({
      kind: "nftUnavailable",
    })
  })

  it("keeps payloads", () => {
    expect(mapError({ PriceTooLow: { min_price_e8s: BigInt(5) } })).toEqual({
      kind: "priceTooLow",
      minPriceE8s: BigInt(5),
    })
    expect(mapError({ AlreadyListed: { listing_id: BigInt(3) } })).toEqual({
      kind: "alreadyListed",
      listingId: BigInt(3),
    })
    expect(mapError({ PaymentFailed: "InsufficientAllowance" })).toEqual({
      kind: "paymentFailed",
      message: "InsufficientAllowance",
    })
  })
})

describe("isPurchaseSuccessful", () => {
  const tx = (status: MarketplaceTx["status"]) => ({ status }) as MarketplaceTx

  it("is true once the buyer has the NFT", () => {
    expect(isPurchaseSuccessful(tx("Completed"))).toBe(true)
    expect(isPurchaseSuccessful(tx("PayoutPending"))).toBe(true)
  })

  it("is false otherwise", () => {
    for (const s of [
      "PaymentPending",
      "NftTransferPending",
      "RefundPending",
      "Refunded",
      "Failed",
    ] as const) {
      expect(isPurchaseSuccessful(tx(s))).toBe(false)
    }
  })
})
