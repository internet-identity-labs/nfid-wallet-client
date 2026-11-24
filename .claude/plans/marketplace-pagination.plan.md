# Plan: Marketplace Pagination & ICRC-7 NFT Marketplace Fixes

> Status: IN PROGRESS
> Branch: `feature/sc-19790-implement-an-nft-marketplace-with-support-for`
> Spec: inline
> Created: 2026-11-23

## Summary

Add "Load More" pagination to the marketplace Browse tab. Fix NFT details page listing lookup,
buy-nft listing lookup, URL routing for ICRC-7 tokens, listing match on NFTs page, floor price
display, cache invalidation on list/delist/buy, isTradable support, getTransactions/getProperties
for ICRC-7, and global loader unmounting modal after listing.

## Modified Files

| File                                                                       | Change                                                                                                                           |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `apps/nfid-frontend/src/features/marketplace/utils.ts`                     | Add `fetchListings`, `fetchListingById`, `fetchListingForNFT`, `fetchSellerListings`; real floor price                           |
| `apps/nfid-frontend/src/features/marketplace/index.tsx`                    | Add `currentPage` state, `useEffect` to accumulate listings, pass `onLoadMore`/`hasMore`                                         |
| `packages/ui/src/organisms/marketplace/index.tsx`                          | Add `onLoadMore`, `hasMore`, `isLoadMoreLoading` props; render Load More button in Browse tab                                    |
| `apps/nfid-frontend/src/features/collectibles/utils/util.ts`               | `fetchNFT`/`fetchViewOnlyNFT`: accept `collectionId`; fall back when result is `undefined`                                       |
| `apps/nfid-frontend/src/features/nft-details/index.tsx`                    | Per-NFT `fetchListingForNFT`; `isOwner` check; `onListNFT`/`onDelistNFT`/`onBuy`; remove `isListingLoading` from blocking render |
| `apps/nfid-frontend/src/features/transfer-modal/components/buy-nft.tsx`    | `fetchListingById`; `statusRef` unmount cleanup for cache mutates; floor price invalidation on success                           |
| `apps/nfid-frontend/src/features/transfer-modal/components/delist-nft.tsx` | Filter-mutate for `"listing"` keys; `return` promise to fix premature modal close; floor price invalidation                      |
| `apps/nfid-frontend/src/features/transfer-modal/components/list-nft.tsx`   | Filter-mutate for `"listing"` keys; await floor price invalidation before mutate                                                 |
| `apps/nfid-frontend/src/integration/nft/test/nft.spec.ts`                  | Mock `icrc7RegistryService.getStoredCollections` to fix pre-existing test failure                                                |
| `apps/nfid-frontend/src/integration/ft/test/ft.spec.ts`                    | Mock `icrc7RegistryService.getStoredCollections` in `beforeEach`                                                                 |
| `apps/nfid-frontend/src/integration/nft/impl/icrc7/nft-icrc7.ts`           | Resolve merge conflict; `isTradable()`; `getTransactions()` via icrc7HistoryService; `getProperties()` from metadata             |
| `apps/nfid-frontend/src/integration/nft/nft-service.ts`                    | Resolve merge conflict; `getPublicIcrc7NFT`; `collectionId` param on `getNFTByTokenId`/`getViewOnlyNFT`                          |
| `apps/nfid-frontend/src/integration/nft/sources/nft-sources-types.ts`      | Add `tradable?: boolean` and `metadata?: Array<[string, string]>` to `IcpNftToken`                                               |
| `apps/nfid-frontend/src/integration/nft/sources/icrc7-source.ts`           | Pick `tradable`; `metaProperties` from `icrc7:attributes`; `invalidateFloorPrice`; fix `tokenId` to `id.toString()`              |
| `apps/nfid-frontend/src/integration/nft/sources/icrc7-source.spec.ts`      | Update tokenId expectations from composite to `id.toString()`; add `tradable`/`metadata` fields                                  |
| `apps/nfid-frontend/src/integration/nft/impl/icrc7/nft-icrc7.spec.ts`      | Mock `authState.getUserIdData` and `icrc7HistoryService.getUserEvents` for `getTransactions` test                                |
| `packages/ui/src/organisms/nfts/index.tsx`                                 | Fix listing match: use `BigInt(nft.getTokenNumber())` instead of string comparison                                               |

## Deviations

- `marketplace/utils.ts` scope expanded: added floor price fetch from `icrc7Source.getFloorPrice` on top of the planned listing fetchers.
- `nft-details/index.tsx` scope expanded: added `isOwner`, `onListNFT`, `onDelistNFT`, `onBuy` callbacks (were missing from original plan scope).
- `icrc7-source.ts` scope expanded: `MetadataValue` type, `metaProperties` for `icrc7:attributes`, `invalidateFloorPrice`, `tokenId` bug fix.
- `nft-icrc7.ts` scope expanded: real `getTransactions` and `getProperties` implementations.
- `delist-nft.tsx`: added `return` on `marketplaceService.cancelListing()` — promise was not returned, causing modal to close before delist completed.

## Known Issues / Follow-ups

- `getPublicIcrc7NFT` in `nft-service.ts` sets `tokenId: \`${collectionId}:${tokenIdBig}\``(composite) while owned tokens use`id.toString()`. Not a visible bug (public NFT is never `isOwner`), but inconsistent.
- `getPublicIcrc7NFT` does not populate `metadata`, so the Properties tab is empty when viewing an unowned NFT from the marketplace.
- `fetchListingForNFT` fetches at most 100 listings per collection — if a collection has >100 active listings the specific token's listing may not be found.
- `mutate` import inconsistency: `delist-nft.tsx` imports from `"swr"`, `buy-nft.tsx` from `"@nfid/swr"`.
- `Screenshot_2.png` accidentally committed to `apps/nfid-frontend/src/integration/nft/impl/icrc7/` — delete before PR.

## Implementation Checklist

- [x] Add `fetchListingsPage(page, query?)`, `fetchListingById(id)`, `fetchListingForNFT(collectionId, tokenId)` to `apps/nfid-frontend/src/features/marketplace/utils.ts`
- [x] Add `onLoadMore`, `hasMore`, `isLoadMoreLoading` props to `packages/ui/src/organisms/marketplace/index.tsx`; render Load More button after the Browse grid/table
- [x] Update `apps/nfid-frontend/src/features/marketplace/index.tsx`: `currentPage` state, `useEffect` appending pages, pass new props
- [x] Fix `fetchNFT` and `fetchViewOnlyNFT` in `apps/nfid-frontend/src/features/collectibles/utils/util.ts`
- [x] Replace listings SWR in `apps/nfid-frontend/src/features/nft-details/index.tsx` with `fetchListingForNFT`; add `isOwner`, listing action callbacks, remove `isListingLoading` from render gate
- [x] Replace listings SWR in `apps/nfid-frontend/src/features/transfer-modal/components/buy-nft.tsx` with `fetchListingById`; `statusRef` unmount cleanup; floor price invalidation
- [x] Add filter-mutate + floor price invalidation in `delist-nft.tsx` and `list-nft.tsx`; fix `return` on delist promise
- [x] Fix pre-existing test failure in `apps/nfid-frontend/src/integration/nft/test/nft.spec.ts`
- [x] Fix pre-existing test failure in `apps/nfid-frontend/src/integration/ft/test/ft.spec.ts`
- [x] Implement `isTradable()` for `NftIcrc7` via `token.tradable`
- [x] Implement `getTransactions()` for `NftIcrc7` using `icrc7HistoryService`
- [x] Implement `getProperties()` for `NftIcrc7` from `icrc7:attributes` metadata
- [x] Fix `tokenId: id.toString()` in `icrc7-source.ts` (was `collection.canisterId` — caused wrong URL routing)
- [x] Add `metadata` field to `IcpNftToken`; populate from `metaProperties` in `icrc7-source.ts`
- [x] Fix listing match in `packages/ui/src/organisms/nfts/index.tsx` to use `BigInt(nft.getTokenNumber())`
- [x] Add `invalidateFloorPrice` to `Icrc7Source`; call with await before mutates on list/delist/buy
