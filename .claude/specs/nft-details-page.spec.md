# NFT Details Page — Feature Spec

**Status:** Reference — documents existing behaviour
**Related:** `nft-marketplace.spec.md`, `transaction-modals/list-nft.spec.md`, `transaction-modals/delist-nft.spec.md`, `transaction-modals/buy-nft.spec.md`, `transaction-modals/send.spec.md`

---

## 1. Summary

A full-page detail view for a single NFT, accessible by URL. Shows image, metadata, properties, transaction history, and conditionally exposes Send / List / Delist / Buy actions based on ownership and listing state. Supports both authenticated and viewOnly modes.

---

## 2. Scope

### In scope

- ICRC-7, ICRC-721, and EVM (ERC-721/1155) NFTs
- Authenticated owner view: Send, List (if tradable + unlisted), Delist (if listed)
- Non-owner view: Buy (if listing exists)
- viewOnly mode: read-only display; actions hidden; falls back to `getPublicIcrc7NFT` if NFT not in viewOnly address's collection
- Loading and not-found states

### Out of scope

- Minting or burning
- Editing metadata
- Bidding / auction

---

## 3. Route

```
/profile/nfts/:collectionId/:tokenId
```

Optional location state: `{ currentPage: number }` — passed from the collectibles grid to maintain pagination context when going back.

---

## 4. Data Fetching

### Primary NFT

```ts
useSWR(["nft", collectionId, tokenId], ...)
```

**Authenticated:** `fetchNFT(tokenId, collectionId, currentPage, limitPerPage)`
**viewOnly:** `fetchViewOnlyNFT(tokenId, viewOnlyAddress, viewOnlyAddressType, collectionId, currentPage, limitPerPage)`

`fetchViewOnlyNFT` falls back to `nftService.getPublicIcrc7NFT(collectionId, tokenId)` if the NFT is not found in the viewOnly address's collection. This allows viewing marketplace NFTs that are not owned by the viewOnly address.

### Ownership check

```ts
useSWR(isViewOnlyMode ? ["nftList", viewOnlyAddress] : "nftList", fetchNFTs, {
  revalidateOnMount: false,
  revalidateOnFocus: false,
})
```

`isOwner = nftList.items.some(n => n.getCollectionId() === nft.getCollectionId() && n.getTokenId() === nft.getTokenId())`

### Active listing

```ts
useSWR("listings", () => fetchListings(), { revalidateOnFocus: false })
```

Finds listing where `l.collectionId === nft.getCollectionId() && l.tokenId.toString() === nft.getTokenId()`.

### Lazy details (fetched after primary NFT loads)

Dispatched via `useReducer` (`nftReducer`):

- `nftDetails.getAbout()` → `about`
- `nftDetails.getAssetFullSize()` → `fullSize`
- `nftDetails.getProperties()` → `properties`
- `nftDetails.getTransactions(0, 10)` → `transactions`

Each section has its own `isLoading` and `error` state. Errors are logged but do not block the page.

---

## 5. Action Matrix

| Condition              | Actions available in header / NFTDetails component       |
| ---------------------- | -------------------------------------------------------- |
| `isViewOnlyMode`       | None (header actions hidden entirely)                    |
| `isOwner && !listing`  | Send (header), List (NFTDetails — if `nft.isTradable()`) |
| `isOwner && listing`   | Send disabled with tooltip, Delist (NFTDetails)          |
| `!isOwner && listing`  | Buy (NFTDetails)                                         |
| `!isOwner && !listing` | None                                                     |
| `nft.getError()`       | Header actions hidden                                    |

**Send** is disabled (cursor-not-allowed, opacity-30) when a listing is active — tooltip says "Cannot send while listed".

---

## 6. Action Handlers

### Send (`onTransferNFT`)

```ts
transferService.send({ type: "ASSIGN_SELECTED_NFT", data: nft.getTokenId() })
transferService.send({ type: "CHANGE_TOKEN_TYPE", data: "nft" })
transferService.send({ type: "CHANGE_DIRECTION", data: ModalType.SEND })
transferService.send({ type: "SHOW" })
```

### List (`onListNFT(nftId)`)

```ts
transferService.send({ type: "ASSIGN_VAULTS_CANISTER", data: "" })
transferService.send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
transferService.send({ type: "CHANGE_DIRECTION", data: ModalType.LIST_NFT })
transferService.send({
  type: "ASSIGN_SELECTED_LISTING",
  data: { id: BigInt(nftId), collectionId: nft.getCollectionId() },
})
transferService.send({ type: "SHOW" })
```

### Delist (`onDelistNFT(listingId)`)

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

### Buy (`onBuy(listingId)`)

```ts
transferService.send({ type: "ASSIGN_VAULTS_CANISTER", data: "" })
transferService.send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
transferService.send({ type: "CHANGE_DIRECTION", data: ModalType.BUY_NFT })
transferService.send({
  type: "ASSIGN_SELECTED_LISTING",
  data: { id: BigInt(listingId), collectionId: "" },
})
transferService.send({ type: "SHOW" })
```

---

## 7. Loading and Error States

| State                          | Trigger                                             | UI                            |
| ------------------------------ | --------------------------------------------------- | ----------------------------- |
| Full-page loading              | `isLoading \|\| isNftLoading \|\| isListingLoading` | `<Loader isLoading />`        |
| Not found                      | `nft` is `undefined` after load                     | `<NotFound hideNavigation />` |
| Section loading (about, props) | `state.*.isLoading === true`                        | Per-section skeleton          |
| Section error                  | `state.*.error` set                                 | Error text in section         |

---

## 8. viewOnly Mode

- `isViewOnlyMode` comes from `ProfileContext`
- viewOnly header actions are suppressed: the entire `headerMenu` is hidden when `isViewOnlyMode` is true
- `fetchViewOnlyNFT` calls `nftService.getViewOnlyNFTByTokenId` first; on failure, falls back to `nftService.getPublicIcrc7NFT(collectionId, tokenId)` if `collectionId` is defined
- This allows non-owner users (e.g., a watcher address) to view marketplace NFTs that belong to other wallets

---

## 9. Key Files

| File                                                            | Role                                           |
| --------------------------------------------------------------- | ---------------------------------------------- |
| `apps/nfid-frontend/src/features/nft-details/index.tsx`         | Page container: data fetching, action handlers |
| `apps/nfid-frontend/src/features/nft-details/utils.ts`          | `nftReducer`, `nftInitialState`                |
| `packages/ui/src/organisms/nft-details/index.tsx`               | Presentational `NFTDetails` organism           |
| `apps/nfid-frontend/src/features/collectibles/utils/util.ts`    | `fetchNFT`, `fetchViewOnlyNFT`, `fetchNFTs`    |
| `apps/nfid-frontend/src/features/marketplace/utils.ts`          | `fetchListings`                                |
| `apps/nfid-frontend/src/features/transfer-modal/types/index.ts` | `ModalType` enum                               |
