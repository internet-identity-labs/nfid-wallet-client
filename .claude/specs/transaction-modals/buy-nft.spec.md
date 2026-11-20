# Buy NFT Action — Feature Spec

**Status:** Reference — documents existing behaviour
**Related:** `overview.spec.md`, `../nft-marketplace.spec.md`

---

## 1. Summary

Purchases a listed ICRC-7 NFT from the marketplace. The buyer grants an ICP ICRC-2 allowance to the oracle, which then transfers the NFT and pays the seller.

---

## 2. Scope

### In scope

- ICRC-7 NFTs with an active listing
- Buyer pays: listing price + 3× ICP ledger fee (oracle charges all three fees)
- Triggered from Marketplace Browse tab or NFT details page (non-owner, listing exists)

### Out of scope

- Buying own listings (guarded by `isOwnListing` / `isOwner` checks — Buy button not shown)
- Fungible token purchases
- Auctions

---

## 3. User Flow

```
Marketplace Browse tab / NFT details page (non-owner, listing exists)
  ──[Buy now]──▶  Buy NFT modal opens
                    │
            Quote fetched: fetchBuyQuote(listingId)
            Breakdown shown:
              - Listing price (ICP)
              - Fee (3× ledger fee)
              - Total you pay (ICP)
                    │
            [Confirm]
                    │
            marketplaceService.buy(identity, listingId)
              └─ ICRC-2 approve: allowance = price + 2×fee, TTL = 10 min
              └─ oracle.buy(listingId)
                    │
            ┌─── Error? ──▶ error message shown in modal (modal stays open)
            │
            Success state shown (modal stays open until user closes)
            [Close] → SWR mutations: "listings" + "user-listings" + "nftList"
```

---

## 4. Entry Points

**From Marketplace Browse tab** (non-owner listing — `!isOwnListing`):

```ts
transferService.send({ type: "ASSIGN_VAULTS_CANISTER", data: "" })
transferService.send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
transferService.send({ type: "CHANGE_DIRECTION", data: ModalType.BUY_NFT })
transferService.send({
  type: "ASSIGN_SELECTED_LISTING",
  data: { id: listing.id, collectionId: "" },
})
transferService.send({ type: "SHOW" })
```

**From NFT details page** (non-owner, `!isOwner && listing`): same event sequence.

---

## 5. UI States

| State      | Trigger                     | UI Behaviour                                         |
| ---------- | --------------------------- | ---------------------------------------------------- |
| loading    | Modal opens, quote fetching | Spinner / skeleton in price breakdown                |
| idle       | Quote loaded                | Price breakdown visible, Confirm button enabled      |
| submitting | User clicks Confirm         | Spinner, button disabled, modal stays open           |
| success    | `buy` resolves              | Success message shown, modal stays open until closed |
| error      | `buy` throws                | Error message shown, user can retry or close         |

**Important:** SWR cache mutations (`"listings"`, `"user-listings"`, `"nftList"`) are deferred until the user closes the modal — this ensures the success UI remains visible and the listing doesn't disappear from the cache while the user is reading the confirmation.

---

## 6. Buy Quote Fee Calculation

`fetchBuyQuote(listingId)` calls `marketplaceService.getBuyQuote(listingId)` and formats:

| Line item | Value                                     |
| --------- | ----------------------------------------- |
| Price     | `listing.priceE8s / 1e8` ICP              |
| Fee       | `ledgerFeeE8s × 3 / 1e8` ICP              |
| **Total** | `(priceE8s + 3 × ledgerFeeE8s) / 1e8` ICP |

The oracle charges 3 ledger fees: one for the buyer's ICP approval, one for the ICP transfer to the seller, one for the ICP transfer of the oracle's commission.

---

## 7. State Machine Integration

**`ModalType`:** `BUY_NFT`
**Machine state:** `BuyNFTMachine`

**Context fields read:**

| Field               | Purpose             |
| ------------------- | ------------------- |
| `selectedListingId` | `{ id: listingId }` |

**On close:** fires `HIDE`.

---

## 8. Service Layer

```ts
marketplaceService.buy(identity, listingId)
```

Internally:

1. `getBuyQuote(listingId)` — reads price + fee from oracle
2. `ledger.approve({ spender: oracleAccount, amount: price + 2×fee, expires_at: now + 10min })` — ICRC-2 allowance
3. `oracle.buy(listingId)` — oracle escrows ICP, transfers NFT to buyer, pays seller

**SWR mutations on close (deferred):** `mutate("listings")`, `mutate("user-listings")`, `mutate("nftList")`

---

## 9. Key Files

| File                                                              | Role                             |
| ----------------------------------------------------------------- | -------------------------------- |
| `features/transfer-modal/components/buy-nft.tsx`                  | Buy NFT modal UI + confirm logic |
| `features/marketplace/index.tsx`                                  | Entry point (Browse tab)         |
| `features/marketplace/utils.ts`                                   | `fetchBuyQuote` + formatting     |
| `features/nft-details/index.tsx`                                  | Entry point (NFT details page)   |
| `packages/integration/src/lib/marketplace/marketplace-service.ts` | `buy`, `getBuyQuote`             |
