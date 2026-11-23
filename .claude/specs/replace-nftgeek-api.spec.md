# Spec: Replace NFTGeek API + favorite tokens and contacts

> Status: APPROVED
> Shortcut: sc-19876, sc-19792, sc-19793, sc-19794
> Created: 2026-11-23

## Overview

NFTGeek (`api.nftgeek.app`) is shutting down, and it is the only source of a user's ICP NFTs in the
wallet (`nftGeekService` → `NftService.getICPNFTs`). Replace it with sources we can rely on: the
Toniq/Entrepot API (one backend, run by Toniq Labs) for EXT collections, EXT canister `stats()` for
floor prices, and our marketplace oracle plus direct ICRC-7 canister calls for ICRC-7 collections.
Yumi, ICPSwap and Memecake NFTs, which only NFTGeek provided, are dropped. All NFT data is cached and
shown from cache straight away on load, then refreshed in the background.

## Scope

- App/area: `apps/nfid-frontend/src/integration/nft/` (service, geek, mapper, impl), callers in
  `features/collectibles`, `integration/portfolio-balance`, `packages/ui` profile template (cache
  invalidation), `apps/nfid-frontend/webpack.config.js` (CSP allowlist and dev proxy),
  `apps/nfid-frontend-e2e` (NFT features).
- Entry point: NFTs tab (Collectibles), NFT details page, portfolio total, view-only mode for an ICP
  principal, Send NFT dialog (NFT picker).
- Exit state: the user sees their EXT/legacy NFTs (with floor price) and ICRC-7 NFTs (with lowest
  listing price where one exists); no request goes to `api.nftgeek.app`.

## Requirements

1. No code path calls `api.nftgeek.app`. `nftGeekService`, `ICP_NFT_GEEK_CACHE_NAME` and the
   NFTGeek types are removed; `api.nftgeek.app` is removed from the CSP `connect-src` list and the
   `/nft_geek_api` dev proxy is removed from `webpack.config.js`.
2. **EXT ownership.** For a principal, the wallet derives the account identifier (subaccount 0, hex)
   and loads the owned tokens from `GET https://us-central1-entrepot-api.cloudfunctions.net/api/user/{accountId}/all`.
   Every returned token whose collection is in Entrepot `/collections` with `standard` `ext`,
   `legacy` or `legacy1.5` becomes an EXT NFT; tokens of unknown collections or other standards are
   skipped.
3. **EXT collection data.** Collection name comes from Entrepot `/collections`; the token index is
   decoded from the EXT token identifier. Existing EXT details (image, about, properties,
   transactions via Entrepot `/api/token/{id}`, Toniq links) keep working as today.
4. **EXT floor price.** Floor price in ICP is the 4th field of the collection canister's `stats()`
   (e8s → ICP); USD is derived with `exchangeRateService`. A collection whose `stats()` fails or
   returns floor 0 has no floor price (NFT counts as "without price").
5. **ICRC-7 collections.** Collections = `marketplaceService.getCollections()` minus status `Spam` and
   `Hidden`, minus collections the user has set `Inactive` in `icrc7RegistryService`.
6. **ICRC-7 ownership.** For each collection, owned token ids come from `icrc7_tokens_of` (owner =
   principal, default subaccount, paged until exhausted) and metadata from `icrc7_token_metadata`
   (`icrc7:name`, `icrc7:image`, `icrc7:description`). Each token becomes an NFT with
   `MarketPlace.ICRC7`, `getNftStandard()` = `ICRC-7`, collection name from the oracle.
7. **ICRC-7 floor price.** Floor price = lowest price among the collection's `Active` listings on our
   marketplace (`marketplaceService.getListings`); USD via `exchangeRateService`. No active listing →
   no floor price.
8. **Dropped marketplaces.** `MarketPlace.YUKU`, `ICPSWAP`, `MEMECAKE` and their implementations
   (`impl/yumi`, `impl/icpswap`, `impl/memecake`) are removed; no UI references them.
9. **Cache, stale-while-revalidate.** Every source above is cached in persistent storage
   (`ttlCacheService`). On every load the cached value is returned immediately, **even when not
   expired**, and a background refresh always runs; when it finishes, the NFT list and total price
   re-render with the new data. TTLs: user's NFT list 5 min; Entrepot `/collections` 24 h; floor
   prices (EXT `stats()`, ICRC-7 listings) 1 h; oracle collections 1 h. With no cache, the first load
   waits for the fetch.
10. **Partial failure.** If Entrepot is down or a single EXT/ICRC-7 canister call fails, the wallet
    shows everything that loaded plus the cached data for the failed source; there is no global error
    screen. Errors are logged.
11. **Refresh.** The profile template's "refresh NFTs" invalidates the new cache keys (replacing
    `ICP_NFT_GEEK_CACHE_NAME`) so a manual refresh refetches all ICP NFT sources.
12. **View-only.** `getViewOnlyNFTs(address, "icp")` uses the same EXT + ICRC-7 pipeline for the
    given principal (ICRC-7 Inactive filtering applies only to the signed-in user).
13. Total price (`getNFTsTotalPrice`) and sorting by floor price keep working with the new data.
14. **ICRC-7 revoke in Activity.** ICRC-3 blocks `37revoke` and `37revoke_coll` where `from` is the
    user are parsed as event kind `revoke` (with `spender` when present) instead of being skipped.
    They show in Activity as a new action `IActivityAction.REVOKE` ("Revoke"): its own row label and
    icon like Approve, `to` = spender, and a "Revoke" option in the Activity action filter.
    Metadata-update blocks stay hidden. Collection-wide `37revoke_coll` blocks carry no token id
    and stay hidden, like `37approve_coll`.

### Favorite tokens and contacts (sc-19792 / sc-19793 / sc-19794)

15. **Storage.** Favorites are stored on the user profile in `user_registry` (`favorites_get`,
    `favorites_set_token(id, bool)`, `favorites_set_contact(id, bool)`), so they are the same on all
    the user's devices. A token id is `<chainId>:<token address>`; a contact id is the address book
    entry id. The frontend calls these methods through its own IDL (the generated `_ic_api` bindings
    are regenerated by the engineer later).
16. **Cache.** Favorites are cached (`ttlCacheService`, 1 h, always revalidate) and shown from cache on
    load. Toggling updates the UI optimistically and rolls back with an error toast if the call fails.
17. **Token star.** Each row on the Tokens tab has a star button (`aria-label` "Add to favorites" /
    "Remove from favorites", filled when favorite). Hidden in view-only mode, for private accounts and
    vaults.
18. **Token order** (default sorting): favorites (in the order they were added), then ICP, NFIDW,
    native tokens (BTC, ETH, other natives), SNS, chain fusion, ERC-20, community, then the rest as
    today (known, testnets, spam). Sorting by USD balance ignores favorites.
19. **Contact star.** Each address book row has the same star button.
20. **Contact order** (default sorting): favorites, then alphabetically by name (case-insensitive).
    Sorting by name ascending/descending ignores favorites. A contact deleted from the address book
    disappears from favorites (backend).

## User Flow

1. User opens the wallet → NFTs tab.
2. Cached NFTs (if any) render at once; a background refresh loads Entrepot ownership, EXT floor
   prices, oracle collections, ICRC-7 tokens and listing prices.
3. The list and the total update when the refresh finishes.
4. User opens an NFT → details (image, standard, collection, about, properties/transactions for EXT).

## Data & State

- Fetch: Entrepot `/api/user/{accountId}/all`, `/api/collections`, `/api/token/{id}` (existing); EXT
  canister `stats()` (query); `marketplaceService.getCollections()`, `getListings()`;
  `icrc7RegistryService.getStoredCollections()`; ICRC-7 `icrc7_tokens_of`, `icrc7_token_metadata`.
- Mutations and side effects: none on chain; cache writes to IndexedDB via `ttlCacheService`.
- New state: none (no machine/atom); a background-refresh path in the NFT service that triggers the
  existing SWR keys (`nftList`, `nftTotalPrice`) to revalidate.

## UI

No new UI. Existing Collectibles states stay:

| State   | Trigger                       | UI behaviour                              |
| ------- | ----------------------------- | ----------------------------------------- |
| loading | no cache, first fetch running | existing skeleton                         |
| empty   | user owns no supported NFTs   | existing empty state                      |
| error   | a source failed               | show what loaded + cache, no error screen |
| success | data loaded / refreshed       | list re-renders, total updates            |

## E2E expectations

Engineer decision (2026-11-23): **no new E2E scenarios** — ICRC-7 E2E skipped; favorites covered by
unit tests.

- Existing `asset/Nft.feature` (`@nft-details`, EXT Boxy Dude on anchor 200000099) and
  `SendNFT.feature` keep passing through the Entrepot source; NFT counts in them are updated if the
  test user also holds ICRC-7 NFTs.
- Revoke in Activity: unit tests on `parseIcrc7Block` and the row mapper; no E2E.
- EXT ownership itself is not mocked (live Entrepot API).

## Edge Cases

- Entrepot returns tokens of a collection missing from `/collections` → skipped.
- Collection in the oracle whose canister is not ICRC-7 or traps → skipped, others shown.
- ICRC-7 token without `icrc7:image` → placeholder image; without `icrc7:name` → `<collection> #<id>`.
- `stats()` unavailable on a legacy canister → no floor price.
- Very large holders (1000+ EXT tokens) → no per-token network call needed to render the list.
- Cache present but stale and refresh fails → cached data stays on screen.
- User marks a collection Inactive → it disappears on the next refresh (registry cache invalidated).

## Out of Scope

- Yumi, ICPSwap, Memecake NFTs (removed).
- ICRC-7 transactions/properties on the NFT details page beyond name/image/description.
- EVM NFTs (unchanged).
- Any change to the marketplace oracle or ICRC-7 canisters.
- UI for marking ICRC-7 collections Inactive.
- Favorites in the Send dialogs' token/contact pickers (only Tokens tab and Address book).

## Approval log

- 2026-11-23: spec approved ("approved"), revoke added at approval.
- 2026-11-23: engineer asked to implement everything in one branch, including favorites, and to skip
  ICRC-7 E2E ("E2E для ICRC-7 скипни, реализуй в этой ветке - все и избранное в том числе").
