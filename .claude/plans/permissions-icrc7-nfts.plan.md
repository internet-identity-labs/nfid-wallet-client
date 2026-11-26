# Plan: Extend Permissions Screen with ICRC-7 NFT Approvals + Fix icrc37_approve_tokens Routing

> Status: IMPLEMENTED
> Spec: (inline — no separate spec file)
> Created: 2026-11-24
> Branch: `icrc-37-approve`

---

## Context — Existing Fungible Token Logic

The Permissions screen currently shows **ICRC-2 fungible token allowances** only.

### Data flow (FT)

1. **`ftService.getIcrc2Allowances(tokens, owner, offset, pageSize)`** — paginated fetch;
   returns `{ token: FT; allowance: AllowanceDetailDTO }[]`.
2. **`permissionsReducer` / `permissionsInitialState`** in `utils.ts` — manages a paged list
   with actions `RESET`, `LOAD_MORE_START`, `LOAD_MORE_SUCCESS`, `REMOVE_ALLOWANCE`,
   `UPDATE_ALLOWANCE`.
3. **`PermissionsPage`** (`apps/nfid-frontend/src/features/permissions/index.tsx`) —
   - Calls `useSWR(["allowances", 0], …)` for the first page (after tokens are inited).
   - On scroll/button, `loadMore()` advances `state.page * PAGE_SIZE`.
   - Flattens each `{ token, allowance }` into an `Allowance` display object.
   - Renders the `<Permissions>` organism.
   - **Revoke all** button in the header calls `ftService.revokeAllAllowances`.
4. **`<Permissions>`** organism — sortable FT allowance table with revoke/update modals.
5. **`<PermissionsToken>`** row — token logo, symbol, name, approved amount, USD value, spender address.

---

## What We're Adding — ICRC-7 NFT Approvals (Permissions screen)

ICRC-7 uses **ICRC-37** for per-token approvals. Data source:

1. `icrc7Source.getUserTokens(principal, false)` — enumerate all user-owned ICRC-7 NFTs
2. For each token: `marketplaceService.isApproved(collectionId, BigInt(tokenNumber))` — check
   ICRC-37 approval status
3. Keep only approved tokens → display in the **same table** as FT rows

**NFT rows in the table:**

- Name column: NFT image (rounded corners, not circle) + tokenName + collectionName
- Approved amount: **empty**
- USD amount: **empty**
- Address: oracle canister ID (the spender for all ICRC-37 approvals)
- Actions: **Revoke only** (no Update button)

**Revoke flow:**

1. `marketplaceService.getListingsBySeller(seller)` → find matching listing by collectionId+tokenId
2. If found: `cancelListing(identity, listing.id)` (which also calls `revokeNftApproval` internally)
3. If not found: `revokeNftApproval(identity, collectionId, tokenId)` directly

**Revoke modal text:** NFT name + collection only (no listing price).

---

## What We're Fixing — icrc37_approve_tokens Routing (IdentityKit)

When the demo calls `icrc37_approve_tokens`, the signer shows the fallback consent-message
screen because:

1. `icrc49-call-canister.tsx` component map has key `icrc37_approve` (wrong) — should be
   `icrc37_approve_tokens` (the actual wire method name).
2. `icrc49-call-canister-method.service.ts` helpers map has `icrc7_transfer` (old key, now
   gone) — missing `icrc37_approve_tokens` entry entirely.
3. No metadata helper exists that reads `approval_info.spender` (approve args differ from
   transfer args which use `to`).

---

## Modified Files

| File                                                                                                            | Change                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/nfid-frontend/src/features/permissions/utils.ts`                                                          | Add `NftApproval` type; add `nftApprovalsList` to state; add `RESET_NFT_APPROVALS` and `REMOVE_NFT_APPROVAL` actions + reducer cases; fix `RESET`/`LOAD_MORE_SUCCESS` to preserve `nftApprovalsList`  |
| `apps/nfid-frontend/src/features/permissions/index.tsx`                                                         | Fetch approved NFTs via `icrc7Source.getUserTokens()` + `marketplaceService.isApproved()`; dispatch NFT approvals; wire NFT revoke via `cancelListing` / `revokeNftApproval`; pass props to organism  |
| `packages/ui/src/organisms/permissions/index.tsx`                                                               | Add `nftApprovals` + `onRevokeNftApproval` props; render NFT rows in the **same table** after FT rows; add NFT revoke modal showing NFT name + collection; fix empty-state check to include NFT count |
| `packages/ui/src/organisms/permissions/PermissionsRow.tsx`                                                      | Add `NftApprovalRow` component matching the FT table row structure: NFT image (rounded-[8px]), tokenName, collectionName, empty amount/USD cells, desktop address, Revoke-only actions cell           |
| `packages/ui/src/organisms/send-receive/components/list-nft.tsx`                                                | **Deviation — pre-existing change on this branch before this plan**                                                                                                                                   |
| `apps/nfid-frontend/src/features/identitykit/components/call-canisters/icrc7-transfer.tsx`                      | **Deviation — renamed to `icrc37-spending-cap.tsx` in the previous PR on this branch**                                                                                                                |
| `apps/nfid-frontend/src/features/identitykit/components/call-canisters/icrc37-spending-cap.tsx`                 | **Deviation — new file from previous PR on this branch (renamed from `icrc7-transfer.tsx`)**                                                                                                          |
| `apps/nfid-frontend/src/features/identitykit/components/methods/icrc49-call-canister.tsx`                       | **Deviation (pre-existing) + Fix: change key `icrc37_approve` → `icrc37_approve_tokens`**                                                                                                             |
| `apps/nfid-frontend/src/features/identitykit/service/method/interactive/icrc49-call-canister-method.service.ts` | Add `icrc37_approve_tokens` → `getIcrc37ApproveMetadata` to helpers map                                                                                                                               |
| `apps/nfid-frontend/src/features/identitykit/service/canister-calls-helpers/icrc7-transfer.ts`                  | **Deviation** — fix wrong metadata image keys (`icrc7:metadata:uri:image` → `icrc7:image`/`image`/`icrc7:thumbnail`/`thumbnail`) to match what ICRC-7 canisters actually emit                         |
| `apps/nfid-frontend/src/features/identitykit/constants.ts`                                                      | **Deviation** — add `icrc37_approve_tokens: "Approve spending cap"`; remove unused `icrc7_transfer` entry                                                                                             |
| `apps/nfid-frontend/src/features/identitykit/components/call-canisters/details.tsx`                             | **Deviation** — user's pre-existing UI fixes (do not overwrite)                                                                                                                                       |

## New Files

| File                                                                                           | Type           | Purpose                                                                                                            |
| ---------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------ |
| `apps/nfid-frontend/src/features/identitykit/service/canister-calls-helpers/icrc37-approve.ts` | Service helper | Reads `approval_info.spender.owner` from approve args; returns `ICRC7TransferMetadata` with spender as `toAddress` |

---

## Implementation Checklist

### Permissions screen — NFT approvals

- [x] `utils.ts` — `NftApproval` type, `nftApprovalsList`, `RESET_NFT_APPROVALS`, `REMOVE_NFT_APPROVAL`, fixed `RESET`/`LOAD_MORE_SUCCESS`
- [x] `permissions/index.tsx` — `icrc7Source.getUserTokens()` + `isApproved()` SWR, dispatch, revoke handler, props
- [x] `organisms/permissions/index.tsx` — same-table NFT rows, NFT revoke modal, corrected empty state
- [x] `organisms/permissions/PermissionsRow.tsx` — `NftApprovalRow`

### IdentityKit routing fix

- [x] `icrc49-call-canister.tsx` — change map key `icrc37_approve` → `icrc37_approve_tokens`
- [x] New `icrc37-approve.ts` helper — read `approval_info.spender.owner`; reuse `ICRC7TransferMetadata` with spender as `toAddress`
- [x] `icrc49-call-canister-method.service.ts` — add `icrc37_approve_tokens` → `getIcrc37ApproveMetadata`
- [x] `icrc7-transfer.ts` + `icrc37-approve.ts` — fix metadata image keys to `icrc7:image`/`image`/`icrc7:thumbnail`/`thumbnail`
- [x] `constants.ts` — add `icrc37_approve_tokens: "Approve spending cap"`; remove unused `icrc7_transfer`
- [x] `icrc37-spending-cap.tsx` — unwrap `vec` args before passing to `CallCanisterDetails` so field-level rows show instead of raw index

---

## Verification

- [x] `yarn nx lint nfid-wallet-client` — zero new errors
- [x] `npx tsc --noEmit -p apps/nfid-frontend/tsconfig.app.json` — zero errors
- [x] Manual smoke: calling `icrc37_approve_tokens` from the demo shows the dedicated NFT
      approve UI with correct token image and "Approve spending cap" title

---

## Risks & Notes

- `icrc7Source.getUserTokens()` makes N `isApproved` calls (one per owned token). For users
  with many NFTs this can be slow; each failing token is silently skipped.
- `cancelListing` also calls `revokeNftApproval` internally — no double-revoke risk.
- NFT rows always go below sorted FT rows; they are not mixed into the USD/address sort.
