# Plan: Marketplace Pagination

> Status: COMPLETE
> Branch: `feature/sc-19790-implement-an-nft-marketplace-with-support-for`
> Spec: inline
> Created: 2026-11-23

## Summary

Add "Load More" pagination to the marketplace Browse tab (same pattern as NFTs page).
Fix NFT details page listing lookup to work without fetching all listings.
Fix buy-nft listing lookup for the same reason.
Fix fetchNFT / fetchViewOnlyNFT to fall back to public ICRC7 when result is undefined (not just on exception).

## Modified Files

| File                                                                       | Change                                                                                        |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `apps/nfid-frontend/src/features/marketplace/utils.ts`                     | Add `fetchListings`, `fetchListingById`, `fetchListingForNFT`                                 |
| `apps/nfid-frontend/src/features/marketplace/index.tsx`                    | Add `currentPage` state, `useEffect` to accumulate listings, pass `onLoadMore`/`hasMore`      |
| `packages/ui/src/organisms/marketplace/index.tsx`                          | Add `onLoadMore`, `hasMore`, `isLoadMoreLoading` props; render Load More button in Browse tab |
| `apps/nfid-frontend/src/features/collectibles/utils/util.ts`               | `fetchNFT`/`fetchViewOnlyNFT`: also fall back when result is `undefined`                      |
| `apps/nfid-frontend/src/features/nft-details/index.tsx`                    | Replace global `"listings"` SWR with per-NFT `fetchListingForNFT`                             |
| `apps/nfid-frontend/src/features/transfer-modal/components/buy-nft.tsx`    | Replace global `"listings"` SWR with `fetchListingById`                                       |
| `apps/nfid-frontend/src/features/transfer-modal/components/delist-nft.tsx` | Add filter-mutate for `"listing"` cache keys after delist                                     |
| `apps/nfid-frontend/src/features/transfer-modal/components/list-nft.tsx`   | Add filter-mutate for `"listing"` cache keys after list                                       |
| `apps/nfid-frontend/src/integration/nft/test/nft.spec.ts`                  | Mock `icrc7RegistryService.getStoredCollections` to fix pre-existing test failure             |
| `apps/nfid-frontend/src/integration/ft/test/ft.spec.ts`                    | Mock `icrc7RegistryService.getStoredCollections` in `beforeEach` to fix pre-existing failure  |

## Implementation Checklist

- [x] Add `fetchListingsPage(page, query?)`, `fetchListingById(id)`, `fetchListingForNFT(collectionId, tokenId)` to `apps/nfid-frontend/src/features/marketplace/utils.ts`
- [x] Add `onLoadMore`, `hasMore`, `isLoadMoreLoading` props to `packages/ui/src/organisms/marketplace/index.tsx`; render Load More button after the Browse grid/table
- [x] Update `apps/nfid-frontend/src/features/marketplace/index.tsx`: `currentPage` state, `useEffect` appending pages, pass new props
- [x] Fix `fetchNFT` and `fetchViewOnlyNFT` in `apps/nfid-frontend/src/features/collectibles/utils/util.ts`
- [x] Replace listings SWR in `apps/nfid-frontend/src/features/nft-details/index.tsx` with `fetchListingForNFT`
- [x] Replace listings SWR in `apps/nfid-frontend/src/features/transfer-modal/components/buy-nft.tsx` with `fetchListingById`; add filter-mutate
- [x] Add filter-mutate in `delist-nft.tsx` and `list-nft.tsx`
- [x] Fix pre-existing test failure in `apps/nfid-frontend/src/integration/nft/test/nft.spec.ts`: mock `icrc7RegistryService.getStoredCollections` so `getNFTByTokenId` test doesn't hit `authState`
- [x] Fix pre-existing test failure in `apps/nfid-frontend/src/integration/ft/test/ft.spec.ts`: same mock in `beforeEach`
