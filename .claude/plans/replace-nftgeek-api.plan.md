# Plan: Replace NFTGeek API + favorite tokens and contacts

> Status: PR OPEN (approved 2026-11-23, engineer: "реализуй в этой ветке все и избранное")
> Spec: .claude/specs/replace-nftgeek-api.spec.md
> Shortcut: sc-19876, sc-19792, sc-19793, sc-19794
> Created: 2026-11-23
> Branch: `feature/sc-19876-replace-nftgeek-api`

## Goal

Replace NFTGeek as the source of a user's ICP NFTs (spec requirements 1–13): EXT/legacy NFTs from the
Toniq/Entrepot API with floor price from EXT `stats()`, ICRC-7 NFTs from the marketplace oracle +
`icrc7_tokens_of` with floor price from our marketplace listings, Yumi/ICPSwap/Memecake removed, all
sources cached with always-revalidate. Plus ICRC-7 revoke rows in Activity (requirement 14) and
favorite tokens/contacts stored in `user_registry` (requirements 15–20; backend PR
internet-identity-labs/nfid-wallet-server#447, deployed to dev). One PR.

## Findings

| What                                                                                                                                                                                                                                      | Evidence                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Only NFTGeek caller is `NftService.getICPNFTs`                                                                                                                                                                                            | `apps/nfid-frontend/src/integration/nft/nft-service.ts:21`                                                                                                  |
| `MappedToken` (NFTGeek shape) is the constructor input of `NftImpl` and all ICP impls                                                                                                                                                     | `impl/nft-abstract.ts:51`, `impl/nft-mapper.ts`                                                                                                             |
| NFTGeek cache key is invalidated by the profile refresh                                                                                                                                                                                   | `packages/ui/src/templates/profile-template/Template.tsx:72,514`                                                                                            |
| `ft.spec.ts` mocks `nftGeekService.fetchNftGeekData` with `mockGeekResponse`                                                                                                                                                              | `apps/nfid-frontend/src/integration/ft/test/ft.spec.ts:5,515`, `nft/mock/mock.ts`                                                                           |
| CSP allowlist + dev proxy for NFTGeek                                                                                                                                                                                                     | `apps/nfid-frontend/webpack.config.js:184,684`                                                                                                              |
| EXT details/transactions already use Entrepot `/api/token/{id}`                                                                                                                                                                           | `impl/ext/nft-ext.ts:16,72`                                                                                                                                 |
| Entrepot API (verified live, CORS `*`): `/api/user/{aid}/all` → `{id, owner, canister, price, time, metadata}`; `/api/collections` → 773 collections, `standard` ext 597 / legacy1.5 90 / legacy 85 / base-ext 1                          | curl probes 2026-11-23                                                                                                                                      |
| EXT `stats()` → `(volume, highest, lowest, floor, listings, supply, sales)`, floor in e8s                                                                                                                                                 | `dfx canister --ic call bzsui-… stats`                                                                                                                      |
| Account id helper exists                                                                                                                                                                                                                  | `AccountIdentifier.fromPrincipal` in `apps/nfid-frontend/src/util/get-address.ts:12`                                                                        |
| ICRC-7 data: oracle `marketplaceService.getCollections()` (status), `getOwnedTokenIds` (`icrc7_tokens_of`), `getTokenMetadata`, `getListings({collectionId, sort: "PriceAsc"})`; user state `icrc7RegistryService.getStoredCollections()` | `packages/integration/src/lib/marketplace/marketplace-service.ts:75,134,146,293`, `icrc7-registry-service.ts`                                               |
| No ICRC-7 `NFT` class exists, yet `MarketPlace.ICRC7` is checked in send flow                                                                                                                                                             | `enum/enums.ts:8`, `transfer-modal/components/send-nft.tsx:280,311`                                                                                         |
| `ttlCacheService.getOrFetch` returns a fresh cache without refetch; only expired cache is refreshed in background; no hook to notify UI                                                                                                   | `packages/client-db/src/lib/storage/service/ttl-cache-service.ts:38-78`; no spec file                                                                       |
| Collectibles uses SWR keys `nftList`, `["nftList", page]`, `nftTotalPrice` with `revalidateIfStale: false`                                                                                                                                | `apps/nfid-frontend/src/features/collectibles/index.tsx:40-100`                                                                                             |
| ICRC-7 history skips `37revoke*` (“Revokes … are not shown”)                                                                                                                                                                              | `packages/integration/src/lib/marketplace/icrc7-history.ts:162`                                                                                             |
| Activity action enum / filter / row icon                                                                                                                                                                                                  | `packages/integration/src/lib/token/icrc1/types.ts:5`, `packages/ui/src/organisms/activity/index.tsx:50`, `…/components/activity-table-row.tsx:168,307,399` |
| E2E: `@nft-details` expects exactly 2 NFTs for anchor 200000099 (EXT Boxy Dude)                                                                                                                                                           | `apps/nfid-frontend-e2e/src/features/asset/Nft.feature`                                                                                                     |
| No README mentions NFTGeek/Yumi/ICPSwap/Memecake/ttl cache                                                                                                                                                                                | grep over root, `docker-e2e-tests`, `packages/{ui,integration,client-db}`, `apps/nfid-frontend/src/integration` READMEs                                     |
| Favorites backend: `favorites_get` (composite query), `favorites_set_token/contact(text, bool) -> Result<Favorites, FavoritesError>` on `user_registry`; generated bindings in `_ic_api/` can't be edited (guard)                         | nfid-wallet-server#447                                                                                                                                      |
| Token order today: ICP/BTC/ETH, other natives, NFIDW/ckBTC/ckETH, then Native<ChainFusion<Sns<Known<Community<ERC20<testnets<Spam; ticket wants favorites, ICP, NFIDW, native, SNS, chain fusion, ERC-20, community                       | `apps/nfid-frontend/src/integration/ft/ft-service.ts:636`                                                                                                   |
| Tokens UI default sort keeps service order; address book default sort keeps canister order                                                                                                                                                | `packages/ui/src/organisms/tokens/index.tsx:160`, `packages/ui/src/organisms/address-book/index.tsx:95`                                                     |
| No star icon in `packages/ui/src/atoms/icons`                                                                                                                                                                                             | `ls`                                                                                                                                                        |
| Not verifiable locally: live Entrepot data per user, prod oracle contents; unit tests mock them                                                                                                                                           | —                                                                                                                                                           |

## Modified / New Files

| File                                                                                             | Phase | Change                                                                                                                                    |
| ------------------------------------------------------------------------------------------------ | ----- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/client-db/src/lib/storage/service/ttl-cache-service.ts`                                | 1     | `getOrFetch` option `revalidate: "always"` + `onRevalidated(value)` callback                                                              |
| `packages/client-db/src/lib/storage/service/ttl-cache-service.spec.ts`                           | 1     | new: fresh/expired/missing/always-revalidate/background-error                                                                             |
| `apps/nfid-frontend/src/integration/nft/sources/nft-sources-types.ts`                            | 2     | new: `IcpNftToken` (replaces `MappedToken`)                                                                                               |
| `apps/nfid-frontend/src/integration/nft/sources/entrepot-source.ts`                              | 2     | new: account id, `/user/{aid}/all`, `/collections` (24 h), standard filter, index decode                                                  |
| `apps/nfid-frontend/src/integration/nft/sources/entrepot-source.spec.ts`                         | 2     | new                                                                                                                                       |
| `apps/nfid-frontend/src/integration/nft/sources/ext-floor-price.ts`                              | 2     | new: `stats()` floor per collection (1 h)                                                                                                 |
| `apps/nfid-frontend/src/integration/nft/sources/ext-floor-price.spec.ts`                         | 2     | new                                                                                                                                       |
| `apps/nfid-frontend/src/integration/nft/sources/icrc7-source.ts`                                 | 3     | new: oracle − Spam/Hidden − Inactive, paged `icrc7_tokens_of`, metadata, lowest Active listing (1 h)                                      |
| `apps/nfid-frontend/src/integration/nft/sources/icrc7-source.spec.ts`                            | 3     | new                                                                                                                                       |
| `apps/nfid-frontend/src/integration/nft/impl/icrc7/nft-icrc7.ts`                                 | 3     | new: `NftIcrc7` (standard `ICRC-7`, image/name/description, no Toniq links)                                                               |
| `apps/nfid-frontend/src/integration/nft/impl/icrc7/nft-icrc7.spec.ts`                            | 3     | new                                                                                                                                       |
| `apps/nfid-frontend/src/integration/nft/impl/nft-abstract.ts`                                    | 2     | take `IcpNftToken`; token id from source                                                                                                  |
| `apps/nfid-frontend/src/integration/nft/impl/nft-mapper.ts`                                      | 3     | EXT + ICRC7 only                                                                                                                          |
| `apps/nfid-frontend/src/integration/nft/impl/ext/nft-ext.ts`                                     | 2     | adapt to `IcpNftToken`                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/ext/test/ext.spec.ts`                               | 2     | fixtures without geek types                                                                                                               |
| `apps/nfid-frontend/src/integration/nft/enum/enums.ts`                                           | 4     | drop `YUKU`, `ICPSWAP`, `MEMECAKE`                                                                                                        |
| `apps/nfid-frontend/src/integration/nft/nft-service.ts`                                          | 4     | `getICPNFTs` = Entrepot + ICRC-7, cached 5 min, always revalidate, partial failure, SWR `mutate` on refresh; export `ICP_NFT_CACHE_NAMES` |
| `apps/nfid-frontend/src/integration/nft/test/nft.spec.ts`                                        | 4     | rewrite against mocked sources                                                                                                            |
| `apps/nfid-frontend/src/integration/nft/mock/mock.ts`                                            | 4     | replace `mockGeekResponse` with Entrepot/ICRC-7 fixtures                                                                                  |
| `apps/nfid-frontend/src/integration/ft/test/ft.spec.ts`                                          | 4     | mock new sources instead of `nftGeekService`                                                                                              |
| `apps/nfid-frontend/src/integration/nft/geek/nft-geek-service.ts`                                | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/geek/geek-types.ts`                                      | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/geek/geek-types.spec.ts`                                 | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/yumi/idl/yumiNft.d.ts`                              | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/yumi/idl/yumiNft.ts`                                | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/yumi/nft-yumi.ts`                                   | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/yumi/properties/properties-service.ts`              | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/yumi/test/yumi.spec.ts`                             | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/yumi/transaction/yumi-transaction-mapper.ts`        | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/yumi/transaction/yumi-transactions.ts`              | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/yumi/transaction/yumi-trs-types.ts`                 | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/yumi/types/yumi-types.ts`                           | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/yumi/util/util.ts`                                  | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/icpswap/idl/SwapNFT.d.ts`                           | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/icpswap/idl/SwapNFT.ts`                             | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/icpswap/nft-icpswap.ts`                             | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/icpswap/properties/properties-service.ts`           | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/icpswap/transaction/icpswap-transaction-mapper.ts`  | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/icpswap/transaction/icpswap-transaction.ts`         | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/memecake/nft-memecake.ts`                           | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/memecake/transaction/mamcake-transaction-mapper.ts` | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/memecake/transaction/memecake-transactions.ts`      | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/memecake/transaction/transaction-types.ts`          | 4     | delete                                                                                                                                    |
| `apps/nfid-frontend/src/integration/nft/impl/memecake/types/memcake-types.ts`                    | 4     | delete                                                                                                                                    |
| `packages/ui/src/templates/profile-template/Template.tsx`                                        | 4     | invalidate `ICP_NFT_CACHE_NAMES` instead of `ICP_NFT_GEEK_CACHE_NAME`                                                                     |
| `apps/nfid-frontend/webpack.config.js`                                                           | 4     | remove `api.nftgeek.app` from CSP and `/nft_geek_api` proxy                                                                               |
| `packages/integration/src/lib/marketplace/icrc7-history.ts`                                      | 5     | parse `37revoke` / `37revoke_coll` as `revoke`                                                                                            |
| `packages/integration/src/lib/marketplace/icrc7-history.spec.ts`                                 | 5     | revoke cases                                                                                                                              |
| `packages/integration/src/lib/token/icrc1/types.ts`                                              | 5     | `IActivityAction.REVOKE = "Revoke"`                                                                                                       |
| `apps/nfid-frontend/src/features/activity/utils/icrc7-activity.ts`                               | 5     | map `revoke` → `REVOKE`, `to` = spender                                                                                                   |
| `apps/nfid-frontend/src/features/activity/utils/icrc7-activity.spec.ts`                          | 5     | new: row mapping incl. revoke                                                                                                             |
| `packages/ui/src/organisms/activity/index.tsx`                                                   | 5     | "Revoke" filter option                                                                                                                    |
| `packages/ui/src/organisms/activity/components/activity-table-row.tsx`                           | 5     | Revoke icon/bg and Approve-style columns                                                                                                  |
| `apps/nfid-frontend/src/integration/favorites/favorites-idl.ts`                                  | 7     | new: IDL of the 3 favorites methods on `user_registry`                                                                                    |
| `apps/nfid-frontend/src/integration/favorites/favorites-service.ts`                              | 7     | new: get (cached 1 h, always revalidate), setToken/setContact, `tokenFavoriteId`                                                          |
| `apps/nfid-frontend/src/integration/favorites/favorites-service.spec.ts`                         | 7     | new                                                                                                                                       |
| `apps/nfid-frontend/src/integration/favorites/use-favorites.ts`                                  | 7     | new: SWR hook with optimistic toggle + rollback                                                                                           |
| `apps/nfid-frontend/src/integration/ft/ft-service.ts`                                            | 7     | category order per sc-19793                                                                                                               |
| `apps/nfid-frontend/src/integration/ft/test/sort-tokens.spec.ts`                                 | 7     | new: order test                                                                                                                           |
| `packages/ui/src/atoms/icons/StarIcon.tsx`                                                       | 7     | new: outline/filled star                                                                                                                  |
| `packages/ui/src/molecules/favorite-button/index.tsx`                                            | 7     | new: star toggle button with aria-label                                                                                                   |
| `packages/ui/src/organisms/tokens/index.tsx`                                                     | 7     | `favoriteTokenIds`, `onToggleFavorite`; favorites first in default sort                                                                   |
| `packages/ui/src/organisms/tokens/components/active-asset.tsx`                                   | 7     | star button in row                                                                                                                        |
| `apps/nfid-frontend/src/features/fungible-token/index.tsx`                                       | 7     | wire `useFavorites`                                                                                                                       |
| `packages/ui/src/organisms/address-book/index.tsx`                                               | 7     | favorites + alphabetical default sort; props                                                                                              |
| `packages/ui/src/organisms/address-book/AddressBookRow.tsx`                                      | 7     | star button                                                                                                                               |
| `packages/ui/src/organisms/address-book/sort-addresses.ts`                                       | 7     | new: pure sort helper                                                                                                                     |
| `packages/ui/src/organisms/address-book/sort-addresses.spec.ts`                                  | 7     | new                                                                                                                                       |
| `apps/nfid-frontend/src/features/address-book/index.tsx`                                         | 7     | wire `useFavorites`                                                                                                                       |

## E2E scope

- **Existing scenarios affected:** `@nft-details`, `@sendnft` (EXT now comes from Entrepot),
  `@addressbook` and `@tokens` (star column added, default order changes). No new scenarios:
  engineer skipped ICRC-7 E2E; favorites covered by unit tests.

## Implementation Checklist

### Phase 1 — Always-revalidate cache

- [x] `getOrFetch(..., { revalidate: "always", onRevalidated })`: return any cache at once, refetch in
      background, store, call `onRevalidated(value)`; default behaviour unchanged
      (`ttl-cache-service.ts`)
- [x] Unit tests (`ttl-cache-service.spec.ts`), storage mocked
- [x] Phase check: `yarn nx lint client-db`, `yarn nx test client-db --testPathPatterns=ttl-cache-service`

### Phase 2 — EXT source from Entrepot

- [x] `IcpNftToken` type; `NftImpl`/`NftExt` take it (`nft-sources-types.ts`, `nft-abstract.ts`, `nft-ext.ts`)
- [x] `entrepot-source.ts`: principal → account id; `/user/{aid}/all`; `/collections` cached 24 h;
      keep `ext`/`legacy`/`legacy1.5`; skip unknown; decode index from token id
- [x] `ext-floor-price.ts`: `stats()` floor (4th field, e8s) per collection, cached 1 h; failure/0 → none
- [x] Unit tests (`entrepot-source.spec.ts`, `ext-floor-price.spec.ts`, `ext.spec.ts`), fetch and actor mocked
- [x] Phase check: `yarn nx lint nfid-wallet-client`, `npx tsc --noEmit -p apps/nfid-frontend/tsconfig.app.json`,
      `yarn nx test nfid-wallet-client --testPathPatterns="entrepot-source|ext-floor-price|ext.spec"`

### Phase 3 — ICRC-7 source and NFT class

- [x] `icrc7-source.ts`: collections (oracle − Spam/Hidden − user Inactive; Inactive only for the
      signed-in user), paged `getOwnedTokenIds`, `getTokenMetadata`, lowest `Active` listing price
      (`getListings({ collectionId, sort: "PriceAsc" })`) cached 1 h; a failing collection is skipped
- [x] `NftIcrc7`: name `icrc7:name` or `<collection> #<id>`, image `icrc7:image` or collection logo or
      placeholder, about `icrc7:description`, standard `ICRC-7`, empty properties/transactions
- [x] `nft-mapper.ts`: EXT + ICRC7
- [x] Unit tests (`icrc7-source.spec.ts`, `nft-icrc7.spec.ts`), marketplace service mocked
- [x] Phase check: lint, tsc app, `--testPathPatterns="icrc7-source|nft-icrc7"`

### Phase 4 — Wire up, remove NFTGeek and dropped marketplaces

- [x] `nft-service.ts`: `getICPNFTs` = `Promise.allSettled` of both sources, merged; user list cached
      5 min with `revalidate: "always"`; `onRevalidated` → `mutate` keys starting with `nftList` and
      `nftTotalPrice`; `ICP_NFT_CACHE_NAMES` exported; view-only path uses the same pipeline
- [x] Delete geek, yumi, icpswap, memecake files; trim `enums.ts`
- [x] `Template.tsx` refresh invalidates `ICP_NFT_CACHE_NAMES`
- [x] `webpack.config.js`: drop NFTGeek CSP entry and proxy
- [x] Unit tests: `nft.spec.ts`, `ft.spec.ts` (USD balance) with new mocks in `mock.ts`
- [x] Phase check: lint all touched projects, tsc app + spec, `yarn nx test nfid-wallet-client --testPathPatterns="nft.spec|ft.spec"`,
      `grep -rn nftgeek apps packages` empty

### Phase 5 — Revoke in ICRC-7 activity

- [x] `icrc7-history.ts`: `37revoke`, `37revoke_coll` with `from === user` → kind `revoke` (+ spender)
- [x] `IActivityAction.REVOKE`; `icrc7-activity.ts` maps it, `to` = spender
- [x] Activity filter option and row (Approve icon, Approve-style columns)
- [x] Unit tests (`icrc7-history.spec.ts`, `icrc7-activity.spec.ts`)
- [x] Phase check: `yarn nx lint integration ui nfid-wallet-client`, tsc app,
      `--testPathPatterns="icrc7-history|icrc7-activity"`

### Phase 6 — (removed: no new E2E, see E2E scope)

### Phase 7 — Favorite tokens and contacts

- [x] `favorites-idl.ts` + `favorites-service.ts` (actor on `USER_REGISTRY_CANISTER_ID` with the
      delegation identity; get cached 1 h with `revalidate: "always"`; ids `<chainId>:<address>`)
- [x] `use-favorites.ts`: SWR key `favorites`, optimistic toggle, rollback + toast on error
- [x] Token category order per sc-19793 in `ft-service.ts` (`sortTokens`)
- [x] `StarIcon`, `FavoriteButton`; star in token rows and address book rows (not in view-only,
      private account, vault)
- [x] Default sorts: tokens favorites-first; contacts favorites then alphabetical
- [x] Unit tests (`favorites-service.spec.ts`, `sort-tokens.spec.ts`, `sort-addresses.spec.ts`), actor mocked
- [x] Phase check: lint `nfid-wallet-client` + `ui`, tsc app + spec, tests by pattern

## Decisions

| Question                                     | Decision                                                                         | Why                                                                                                                               |
| -------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Where does background refresh notify the UI? | `onRevalidated` in `ttlCacheService` → `mutate` from `@nfid/swr` in `NftService` | Integration code already imports `@nfid/swr` (`integration/identity-manager/queries.ts`); no new state                            |
| NFT token id for EXT                         | Use Entrepot `id` (already the EXT token identifier); index decoded from it      | Avoid re-encoding legacy ids                                                                                                      |
| ICRC-7 token id string                       | `<canisterId>:<tokenId>` internally; displayed number = token id                 | ICRC-7 ids are nats, not EXT identifiers                                                                                          |
| Favorites frontend                           | In this PR (engineer)                                                            | Own IDL file outside `_ic_api/` because generated bindings are guard-blocked; engineer regenerates `user_registry` bindings later |
| Favorites UI without Figma access            | Star button left of the token/contact name; filled = favorite                    | Figma requires login; adjust after design review                                                                                  |

## Risks

| Risk                                                   | Mitigation                                                                                   |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Entrepot API is undocumented, no SLA                   | Cache + partial-failure handling; follow-up to ask Toniq Labs                                |
| `/collections` is 1.2 MB                               | 24 h cache in IndexedDB                                                                      |
| Many oracle collections → many `icrc7_tokens_of` calls | Parallel with a concurrency cap of 8; collections cached 1 h                                 |
| Users lose Yumi/ICPSwap/Memecake NFTs from view        | Accepted in spec (out of scope)                                                              |
| Star UI may differ from Figma                          | Isolated `FavoriteButton`; easy to restyle                                                   |
| Backend not on prod yet                                | Favorites calls fail on prod until `user_registry` is upgraded there; UI rolls back and logs |

## Follow-ups (not in this plan)

- Regenerate `user_registry` bindings in `_ic_api/` and switch `favorites-service.ts` to them.
- Deploy `user_registry` favorites to stage/prod before releasing.
- Contact Toniq Labs about Entrepot API stability.

## Verify findings

None yet.

## Docs sync

Not run yet.

## Deviations

None yet.
