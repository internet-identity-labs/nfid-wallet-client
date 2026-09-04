# Spec: Promote Your dApp [sc-19619]

## Overview

Allows users to pay NFIDW tokens to promote a dApp to the featured slot on the Discovery page. Only one dApp can be featured at a time. The featured slot has a lock period during which no one can outbid.

---

## Data layer

**`promotionService.getStatus(): Promise<PromotionStatus>`**

- `featured?: FeaturedSlot` — currently promoted app (`appId`, `bidder`, `bidAmountE8s`, `bidTime`, `lockedUntil`, `expiresAt`)
- `minNextBidE8s: bigint` — minimum required bid (pre-filled in promote form)
- `locked: boolean` — whether the slot is in the lock period (hides Promote button)
- `config` — `minBidE8s`, `bidIncrementE8s`, `lockedPeriodMs` (1h), `featureDurationMs` (24h), `ledgerCanisterId`, `treasuryPrincipal`

**`promotionService.placeBid(identity, appId, amountE8s): Promise<FeaturedSlot>`**

- Validates amount client-side via `validate()` before submitting
- Calls `ledger.approve()` then `place_bid` on the oracle canister
- After success: call `mutate("promotionStatus")` to refresh Discovery page state

**`promotionService.getBidHistory(): Promise<HistoricalBid[]>`**

- Not used in the current Discovery/Promote UI (reserved for future use)

---

## Discovery page (`DiscoveryPage` + `Discovery`)

**Data fetched in `DiscoveryPage`:**

- `discoveryApps` via `icrc1OracleService.getDiscoveryApps()`
- `promotionStatus` via `promotionService.getStatus()`
- Both passed to `<Discovery>` as `discoveryApps` and `promotionStatus`

**`Discovery` component behaviour:**

- `filteredApps` memo: filters Spam/New, applies NAME/USERS sort, then always pins the featured app (`promotionStatus.featured.appId`) to position 0 regardless of sort
- `promotionStatus` is in the `filteredApps` dependency array so sort updates reactively after a successful bid
- Featured app card: shows `<PromotedIcon>` + "Promoted" label (always visible, not only on hover)
- Non-featured cards: no Promoted badge
- When `promotionStatus.locked === true`: Promote button is hidden on **all** cards
- When `promotionStatus.locked === false`: Promote button visible on hover overlay of each card

**Banner (`dappSlide` in `ProfileTemplate`):**

- Shown when `promotionStatus.featured` exists
- `isStoredInLocalStorage: false` → no close button, not persisted to localStorage
- Shows featured dApp name, description, and "Explore" button (opens `dapp.url` in new tab)
- `useMemo` dependency: `[promotionStatus?.featured?.appId, discoveryApps]`

---

## Promote modal (`Promote` + `PromoteUi`)

**Opened via:** `onPromoteClick(dappId)` → XState events `CHANGE_DIRECTION: PROMOTE`, `ASSIGN_SELECTED_DAPP: dappId`, `SHOW`

**Data fetched inside `Promote` container:**

- `discoveryApps` (SWR cache shared with Discovery page)
- `promotionStatus` (SWR cache shared with Discovery page)
- `tokens` → finds NFIDW token by `NFIDW_CANISTER_ID` + `ChainId.ICP`

**`promoteData` computed when all three are ready:**

- `dappName` — from `discoveryApps.find(app => app.id === dappId).name`
- `minAmount` — `promotionStatus.minNextBidE8s / 10^decimals` (number)
- `fee` / `feeFormatted` / `feeUsdFormatted` — from `token.getTokenFee()`
- `targetAddress` — `NFIDW_PROMOTE_CANISTER_ID`

**Amount input (`ChooseFromToken`):**

- Pre-filled via `initialValue={String(promoteData.minAmount)}`
- `initialValue` prop triggers a `useEffect` in `ChooseFromToken` that sets both `inputAmountValue` (local state) and the RHF form value on first load
- User can override; their input is preserved (effect only fires when `initialValue` changes)
- `minAmount` passed as validation floor

**Submission:**

- `promotionService.placeBid(identity, dappId, BigInt(amount * 10^decimals))`
- On success: `mutate("promotionStatus")` refreshes Discovery sort + badge + banner
- On error: shows error state in `PromoteSuccessUi`

---

## `BannerCarousel` — `isStoredInLocalStorage` field

Added to `BannerSlide` interface:

- `true` (existing banners) — visibility controlled by localStorage; shows close button
- `false` (promoted dApp banner) — always visible while `promotionStatus.featured` exists; no close button

---

## Validation (`validate()` in promotion-service)

| Condition                         | Error                                             |
| --------------------------------- | ------------------------------------------------- |
| `locked && featured`              | `{ kind: "locked", until: featured.lockedUntil }` |
| `!featured && amount < minBidE8s` | `{ kind: "belowFloor", floorE8s }`                |
| `amount < minNextBidE8s`          | `{ kind: "belowIncrement", requiredE8s }`         |
