# List NFT Action — Feature Spec

**Status:** Reference — documents existing behaviour
**Related:** `overview.spec.md`, `../nft-marketplace.spec.md`

---

## 1. Summary

Lists an ICRC-7 NFT for sale on the NFID marketplace. The user sets a price in ICP; the action grants the marketplace oracle an ICRC-37 approval on the token and creates an on-chain listing.

---

## 2. Scope

### In scope

- ICRC-7 NFTs only (identified by `MarketPlace.ICRC7`)
- Price input in ICP (e8s internally)
- Min price enforced by `marketplaceConfig.minPriceE8s`
- Triggered from NFT details page (owner, `isTradable()`, not already listed)

### Out of scope

- Fungible token sales
- Auction / time-limited listings
- Editing an existing listing price (must delist and re-list)

---

## 3. User Flow

```
NFT details page (owner, tradable, not listed)
  ──[List for sale]──▶  List NFT modal opens
                          │
                  Price input (ICP amount)
                  Min price validation
                          │
                  [List]
                          │
                  marketplaceService.createListing(identity, collectionId, tokenId, priceE8s)
                    └─ internally: approveNft() → icrc37_approve_tokens
                    └─ then: oracle.create_listing()
                          │
                  ┌─── Error? ──▶ error message shown in modal
                  │
                  Success state shown → SWR mutations
                  [Close] → "user-listings" + "listings" cache refreshed
```

---

## 4. Entry Point

Triggered from NFT details page when: `isOwner && !listing && nft.isTradable()`.

```ts
transferService.send({ type: "ASSIGN_VAULTS_CANISTER", data: "" })
transferService.send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
transferService.send({ type: "CHANGE_DIRECTION", data: ModalType.LIST_NFT })
transferService.send({
  type: "ASSIGN_SELECTED_LISTING",
  data: { id: BigInt(nftId), collectionId },
})
transferService.send({ type: "SHOW" })
```

The `selectedListingId.id` is used as the `tokenId` (bigint) for the listing. `collectionId` is the ICRC-7 canister ID.

---

## 5. UI States

| State      | Trigger                      | UI Behaviour                                 |
| ---------- | ---------------------------- | -------------------------------------------- |
| idle       | Modal opens                  | Price input, List button enabled             |
| invalid    | Price below minimum or empty | Validation error, List button disabled       |
| submitting | User clicks List             | Spinner, button disabled                     |
| success    | `createListing` resolves     | Success message shown                        |
| error      | `createListing` throws       | Error message shown, user can retry or close |

---

## 6. State Machine Integration

**`ModalType`:** `LIST_NFT`
**Machine state:** `ListNFTMachine`

**Context fields read:**

| Field               | Purpose                         |
| ------------------- | ------------------------------- |
| `selectedListingId` | `{ id: tokenId, collectionId }` |

**On close:** fires `HIDE`.

---

## 7. Service Layer

```ts
marketplaceService.createListing(identity, collectionId, tokenId, priceE8s)
```

Internally this:

1. Calls `approveNft(identity, collectionId, tokenId)` → `icrc37_approve_tokens` on the NFT canister
2. Calls `oracle.create_listing({ nft_canister, token_id, price_e8s })` on the oracle canister

**SWR mutations on success (deferred to close):** `mutate("user-listings")`, `mutate("listings")`

---

## 8. Key Files

| File                                                              | Role                          |
| ----------------------------------------------------------------- | ----------------------------- |
| `features/transfer-modal/components/list-nft.tsx`                 | List NFT modal UI + logic     |
| `features/nft-details/index.tsx`                                  | Entry point wiring            |
| `packages/integration/src/lib/marketplace/marketplace-service.ts` | `createListing`, `approveNft` |
