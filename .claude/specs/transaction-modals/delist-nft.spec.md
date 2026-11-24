# Delist NFT Action — Feature Spec

**Status:** Reference — documents existing behaviour
**Related:** `overview.spec.md`, `../nft-marketplace.spec.md`

---

## 1. Summary

Cancels an active ICRC-7 NFT marketplace listing. Revokes the oracle's ICRC-37 approval on the token and removes the listing from the oracle canister.

---

## 2. Scope

### In scope

- ICRC-7 NFTs with an active listing (`listing` found in `"listings"` SWR)
- Triggered from NFT details page (owner, listing exists) or My Listings tab

### Out of scope

- Fungible token operations
- Listings owned by other users

---

## 3. User Flow

```
NFT details page (owner, listing exists)  OR  My Listings tab
  ──[Delist]──▶  Delist NFT modal opens
                   │
           Confirmation UI (listing price shown)
                   │
           [Confirm]
                   │
           marketplaceService.cancelListing(identity, listingId)
             └─ oracle.cancel_listing(listingId)
             └─ revokeNftApproval() — best effort
                   │
           ┌─── Error? ──▶ error message shown
           │
           Success state → SWR mutations
           [Close] → "user-listings" + "listings" cache refreshed
```

---

## 4. Entry Points

**From NFT details page** (owner with active listing):

```ts
transferService.send({ type: "ASSIGN_VAULTS_CANISTER", data: "" })
transferService.send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
transferService.send({ type: "CHANGE_DIRECTION", data: ModalType.DELIST_NFT })
transferService.send({
  type: "ASSIGN_SELECTED_LISTING",
  data: { id: BigInt(listingId), collectionId: "" },
})
transferService.send({ type: "SHOW" })
```

**From My Listings tab** in the Marketplace page — same event sequence, `listing.id` from `"user-listings"` SWR.

---

## 5. UI States

| State      | Trigger                  | UI Behaviour                                  |
| ---------- | ------------------------ | --------------------------------------------- |
| idle       | Modal opens              | Confirmation prompt, Confirm + Cancel buttons |
| submitting | User clicks Confirm      | Spinner, buttons disabled                     |
| success    | `cancelListing` resolves | Success message shown                         |
| error      | `cancelListing` throws   | Error message shown, user can retry or close  |

---

## 6. State Machine Integration

**`ModalType`:** `DELIST_NFT`
**Machine state:** `DelistNFTMachine`

**Context fields read:**

| Field               | Purpose             |
| ------------------- | ------------------- |
| `selectedListingId` | `{ id: listingId }` |

**On close:** fires `HIDE`.

---

## 7. Service Layer

```ts
marketplaceService.cancelListing(identity, listingId, { revokeApproval: true })
```

Internally:

1. `oracle.cancel_listing(listingId)` — removes the listing
2. `revokeNftApproval(identity, collectionId, tokenId)` — removes ICRC-37 approval (best effort, failure is logged but not thrown)

**SWR mutations on success (deferred to close):** `mutate("user-listings")`, `mutate("listings")`

---

## 8. Key Files

| File                                                              | Role                                 |
| ----------------------------------------------------------------- | ------------------------------------ |
| `features/transfer-modal/components/delist-nft.tsx`               | Delist NFT modal UI + logic          |
| `features/nft-details/index.tsx`                                  | Entry point (NFT details)            |
| `features/marketplace/index.tsx`                                  | Entry point (My Listings)            |
| `packages/integration/src/lib/marketplace/marketplace-service.ts` | `cancelListing`, `revokeNftApproval` |
