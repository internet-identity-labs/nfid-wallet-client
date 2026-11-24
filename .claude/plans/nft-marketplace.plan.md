# Plan: ICRC-7 NFT Marketplace

> Status: COMPLETE
> Spec: .claude/specs/nft-marketplace.spec.md
> Created: 2026-11-11
> Completed: 2026-11-20

## Already Wired (no action needed)

| Item                                         | Location                                                          |
| -------------------------------------------- | ----------------------------------------------------------------- |
| `ProfileConstants.marketplace` route key     | `apps/nfid-frontend/src/apps/identity-manager/profile/routes.tsx` |
| `/wallet/marketplace` route                  | `apps/nfid-frontend/src/features/wallet/index.tsx`                |
| "Marketplace" tab in `TabsSwitcher`          | `packages/ui/src/templates/profile-template/Template.tsx`         |
| `marketplaceService` with all needed methods | `packages/integration/src/lib/marketplace/marketplace-service.ts` |

## New Files

| File                                                                       | Type      | Purpose                                                 |
| -------------------------------------------------------------------------- | --------- | ------------------------------------------------------- |
| `apps/nfid-frontend/src/features/marketplace/index.tsx`                    | Feature   | Marketplace page with Browse / My Listings tabs         |
| `apps/nfid-frontend/src/features/marketplace/utils.ts`                     | Utils     | `fetchListings`, `fetchSellerListings`, `fetchBuyQuote` |
| `apps/nfid-frontend/src/features/transfer-modal/components/buy-nft.tsx`    | Component | Buy NFT modal — quote display + confirm                 |
| `apps/nfid-frontend/src/features/transfer-modal/components/list-nft.tsx`   | Component | List NFT modal — price input + submit                   |
| `apps/nfid-frontend/src/features/transfer-modal/components/delist-nft.tsx` | Component | Delist NFT modal — confirm + cancel                     |
| `packages/ui/src/organisms/marketplace/index.tsx`                          | Organism  | `Marketplace` organism — Browse + My Listings tabs      |
| `packages/ui/src/organisms/marketplace/components/marketplace-card.tsx`    | Component | Browse grid card with hover Buy overlay                 |
| `packages/ui/src/organisms/marketplace/types.ts`                           | Types     | `MarketplaceListingWithFormatting`, `MarketplaceType`   |
| `packages/ui/src/atoms/skeleton/user-listings-skeleton.tsx`                | Atom      | Skeleton for My Listings tab                            |

## Modified Files

| File                                                                     | Change                                                                                                             |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `apps/nfid-frontend/src/features/transfer-modal/machine.ts`              | Added `list_nft`, `delist_nft`, `buy_nft` directions; `selectedListingId` context; `ASSIGN_SELECTED_LISTING` event |
| `apps/nfid-frontend/src/features/transfer-modal/types/index.ts`          | Added `LIST_NFT`, `DELIST_NFT`, `BUY_NFT` to `ModalType` enum                                                      |
| `apps/nfid-frontend/src/features/transfer-modal/coordinator.tsx`         | Wired `LIST_NFT`, `DELIST_NFT`, `BUY_NFT` modal states to components                                               |
| `apps/nfid-frontend/src/features/transfer-modal/utils.ts`                | Added `updateNftList` with `collectionId` param to fix cross-collection filter                                     |
| `apps/nfid-frontend/src/features/transfer-modal/components/send-nft.tsx` | Auto-delist listed ICRC-7 NFT before sending; `userListings` SWR                                                   |
| `apps/nfid-frontend/src/features/nft-details/index.tsx`                  | Added `isOwner` check; Buy/List/Delist buttons; `listing` from SWR                                                 |
| `apps/nfid-frontend/src/features/collectibles/utils/util.ts`             | `fetchNFT` / `fetchViewOnlyNFT` fallback to `getPublicIcrc7NFT`; `collectionId` param                              |
| `apps/nfid-frontend/src/integration/nft/nft-service.ts`                  | `getPublicIcrc7NFT`; ICRC-7 in `getViewOnlyNFTs` / `getViewOnlyNFTByTokenId`                                       |
| `packages/ui/src/organisms/nft-details/index.tsx`                        | `isOwner`, `onBuy`, `listing` props; Buy/List/Delist conditional buttons                                           |
| `packages/ui/src/organisms/marketplace/index.tsx`                        | `initialTab`, `isViewOnlyMode`, `locationSearch` preservation                                                      |
| `packages/ui/src/organisms/marketplace/components/marketplace-card.tsx`  | `isViewOnlyMode`; `navigate` with `location.search`; `stopPropagation`                                             |
| `packages/ui/src/templates/profile-template/Template.tsx`                | `navigate(-1)` on NFT details back button                                                                          |
| `packages/ui/src/molecules/choose-modal/nft-modal.tsx`                   | Disable listed NFTs from being selected for other operations                                                       |

## Implementation Checklist

### Types & Interfaces

- [x] `MarketplaceListingWithFormatting` and `MarketplaceType` in `packages/ui/src/organisms/marketplace/types.ts`
- [x] `LIST_NFT`, `DELIST_NFT`, `BUY_NFT` added to `ModalType` enum
- [x] `selectedListingId: { id: bigint; collectionId: string }` added to transfer machine context

### Data Layer

- [x] `fetchListings()` — calls `marketplaceService.getListings()` + enriches with image, collection name, floor price, `isOwnListing`
- [x] `fetchSellerListings()` — calls `marketplaceService.getListingsBySeller()` + enriches
- [x] `fetchBuyQuote(listingId)` — calls `marketplaceService.getBuyQuote()`, formats ICP price + fee
- [x] `getPublicIcrc7NFT(collectionId, tokenId)` — fetches NFT metadata without ownership check (for non-owner viewing marketplace listings)
- [x] `getViewOnlyNFTs` / `getViewOnlyNFTByTokenId` extended to include ICRC-7

### State Machine

- [x] `ASSIGN_SELECTED_LISTING` event added to transfer machine
- [x] `list_nft`, `delist_nft`, `buy_nft` directions wired through `TransferModal` guard chain
- [x] `isListNftMachine`, `isDelistNftMachine`, `isBuyNftMachine` guards added
- [x] `ListNFTMachine`, `DelistNFTMachine`, `BuyNFTMachine` states added to coordinator

### Components — Feature

- [x] `buy-nft.tsx` — fetches `BuyQuote`, shows price breakdown, confirms purchase; SWR mutations deferred to close handler
- [x] `list-nft.tsx` — price input form, calls `marketplaceService.createListing()`
- [x] `delist-nft.tsx` — confirmation UI, calls `marketplaceService.cancelListing()`
- [x] `Marketplace` organism — Browse tab (grid + search + table toggle), My Listings tab (table), skeleton states, empty states
- [x] `MarketplaceCard` — hover overlay Buy button, "Your listing" badge, `isViewOnlyMode` support
- [x] NFT details page — Buy/List/Delist buttons based on `isOwner` + `listing` + `isTradable()`
- [x] `send-nft.tsx` — auto-delist ICRC-7 NFT before sending if currently listed

### Bug Fixes Implemented

- [x] `stopPropagation` in marketplace card Buy button (replaced `<Link>` with `<div onClick>`)
- [x] NFT not found for non-owner navigating to marketplace listing (public fallback)
- [x] Buy success modal closing before showing success state (deferred SWR mutations to close handler)
- [x] `isTradable()` returning false for non-owner NFTs (use collection metadata)
- [x] Back button always going to NFTs page (use `navigate(-1)` on NFT details page)
- [x] `updateNftList` removing both NFTs with same tokenId from different collections (added `collectionId` param)
- [x] ViewOnly mode missing `?viewOnly=` param when navigating from Marketplace (preserve `location.search`)
- [x] NFT details page tokenId mismatch in viewOnly mode (match by collectionId + tokenId)
- [x] `fetchViewOnlyNFT` not finding marketplace NFTs not owned by viewOnly address (public fallback)

### Verification

- [x] TypeScript check passes (`tsc --noEmit`)
- [x] Browse tab: skeleton → grid/table renders, search filters, Buy modal opens with quote
- [x] My Listings tab: seller's listings show with Delist button
- [x] Buy flow: quote shown, confirm triggers purchase, success state shown before close
- [x] List flow: price input, submit creates listing
- [x] Delist flow: confirmation, cancel removes listing
- [x] NFT details: Buy/List/Delist buttons render correctly for owner vs non-owner
- [x] viewOnly mode: marketplace navigates with `?viewOnly=` param preserved

## Deferred

- Load more / pagination on marketplace Browse tab (explicitly deferred)
- `CallCanisterICRC7Approve` signer popup in nfid-frontend (for `icrc37_approve_tokens` wallet approval UI)
