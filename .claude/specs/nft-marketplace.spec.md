# Spec: ICRC-7 NFT Marketplace

> Status: COMPLETE
> Created: 2026-11-11
> Completed: 2026-11-20

## Overview

A Marketplace tab in the wallet sidebar that lets users browse ICRC-7 NFTs listed for sale on-chain, buy them, list their own NFTs, and delist active listings. The page has two sub-tabs — Browse and My Listings. Buy/List/Delist actions also surface on the individual NFT details page.

## Scope

- App/area: `nfid-frontend` — `/wallet/marketplace`
- Entry point: "Marketplace" tab in wallet navigation
- Also surfaced on NFT details page (`/wallet/nfts/:collectionId/:tokenId`)
- viewOnly mode: Browse tab only (no Buy/List/Delist in viewOnly)

## User Flow

### Browse sub-tab

1. User navigates to `/wallet/marketplace` — lands on Browse sub-tab by default
2. SWR key `"listings"` fetches active listings via `fetchListings()` (enriched with image, collection name, floor price, `isOwnListing`)
3. Cards render in a responsive grid or table (toggle switch)
4. Each card: NFT image, `#tokenId`, collection name, listing price (ICP + USD)
5. Own listings show **"Your listing"** badge — no Buy button
6. User clicks **Buy now** → transfer modal opens in `BUY_NFT` direction
7. Modal shows `BuyQuote` breakdown (price, 3× ledger fee, total); user confirms
8. On success: modal stays open showing success state; SWR cache (`"listings"`, `"user-listings"`, `"nftList"`) mutated on close

### My Listings sub-tab

1. SWR key `"user-listings"` fetches via `fetchSellerListings()`
2. Table shows: NFT image, `#tokenId`, collection name, floor price, listing price, Delist button
3. User clicks **Delist** → transfer modal opens in `DELIST_NFT` direction
4. On success: SWR mutations invalidate `"user-listings"`

### NFT Details page — owner

- If NFT is listed → **Delist** button (send button disabled with tooltip "Cannot send while listed")
- If NFT is not listed and `isTradable()` → **List for sale** button
- If NFT is not tradable → "Can't be listed" badge

### NFT Details page — non-owner

- If NFT is listed (found in `"listings"` SWR) → **Buy now** button
- `isOwner` checked by: does the NFT appear in `"nftList"` SWR (user's own wallet)?

### Send NFT — auto-delist

When a user sends an ICRC-7 NFT that is currently listed, `send-nft.tsx` automatically calls `marketplaceService.cancelListing()` before the transfer so the oracle approval is revoked.

## Data & State Design

### SWR Keys

| Key               | Fetcher                 | Contents                                                 |
| ----------------- | ----------------------- | -------------------------------------------------------- |
| `"listings"`      | `fetchListings()`       | First page of all active marketplace listings (enriched) |
| `"user-listings"` | `fetchSellerListings()` | Current user's active listings (enriched)                |
| `"nftList"`       | `fetchNFTs()`           | User's owned NFT list                                    |

### Transfer Machine Extensions

New `ModalType` values: `LIST_NFT`, `DELIST_NFT`, `BUY_NFT`

New context field: `selectedListingId: { id: bigint; collectionId: string }`

New event: `ASSIGN_SELECTED_LISTING` → assigns `selectedListingId`

New guards: `isListNftMachine`, `isDelistNftMachine`, `isBuyNftMachine`

New machine states in coordinator: `ListNFTMachine`, `DelistNFTMachine`, `BuyNFTMachine`

### Buy Quote Fee

`fetchBuyQuote` multiplies `ledgerFeeE8s × 3` for display — the oracle charges 3 ledger fees per transaction (buyer pays all).

### Non-Owner NFT Viewing

`nftService.getPublicIcrc7NFT(collectionId, tokenId)` fetches NFT metadata without ownership, used as fallback in `fetchNFT` and `fetchViewOnlyNFT` when the NFT is not in the user's wallet (e.g. navigating from marketplace to an NFT you don't own).

### ViewOnly Mode

`fetchViewOnlyNFT` also falls back to `getPublicIcrc7NFT` when the NFT is not in the viewOnly address's collection. `?viewOnly=` query param is preserved when navigating from Marketplace to NFT details page.

## Component Architecture

```
Marketplace page (apps/.../features/marketplace/index.tsx)
└── Marketplace organism (packages/ui/.../organisms/marketplace/index.tsx)
    ├── Browse tab
    │   ├── Grid view: MarketplaceCard × N
    │   └── Table view: inline table rows
    └── My Listings tab: inline table rows

NFT Details page (apps/.../features/nft-details/index.tsx)
└── NFTDetails organism (packages/ui/.../organisms/nft-details/index.tsx)
    └── Buy / List / Delist buttons (conditional)

Transfer Modal coordinator
├── BUY_NFT  → buy-nft.tsx
├── LIST_NFT → list-nft.tsx
└── DELIST_NFT → delist-nft.tsx
```

## Key Files

| File                                                                       | Role                                                    |
| -------------------------------------------------------------------------- | ------------------------------------------------------- |
| `apps/nfid-frontend/src/features/marketplace/index.tsx`                    | Marketplace page — SWR, tab state, event handlers       |
| `apps/nfid-frontend/src/features/marketplace/utils.ts`                     | `fetchListings`, `fetchSellerListings`, `fetchBuyQuote` |
| `apps/nfid-frontend/src/features/transfer-modal/components/buy-nft.tsx`    | Buy modal UI + confirm logic                            |
| `apps/nfid-frontend/src/features/transfer-modal/components/list-nft.tsx`   | List modal UI + submit logic                            |
| `apps/nfid-frontend/src/features/transfer-modal/components/delist-nft.tsx` | Delist modal UI + confirm logic                         |
| `apps/nfid-frontend/src/features/transfer-modal/machine.ts`                | Extended with marketplace modal types                   |
| `apps/nfid-frontend/src/features/nft-details/index.tsx`                    | NFT details with Buy/List/Delist wiring                 |
| `apps/nfid-frontend/src/integration/nft/nft-service.ts`                    | `getPublicIcrc7NFT`; ICRC-7 in viewOnly methods         |
| `packages/ui/src/organisms/marketplace/index.tsx`                          | Marketplace organism                                    |
| `packages/ui/src/organisms/marketplace/components/marketplace-card.tsx`    | Browse card                                             |
| `packages/ui/src/organisms/nft-details/index.tsx`                          | NFT details UI with marketplace buttons                 |

## Deferred

- Load more / pagination on Browse tab
- `CallCanisterICRC7Approve` signer popup (nfid-frontend wallet UI for `icrc37_approve_tokens` requests)
- Sorting / filtering UI in Browse
- Collection detail pages
