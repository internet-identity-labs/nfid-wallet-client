# Add to Address Book After Send — Feature Spec

**Status:** Implemented — documents behaviour added in sc-19692
**Related:** `send.spec.md`, `overview.spec.md`

---

## 1. Summary

After a successful FT or NFT transfer, prompt the user to save the recipient address to their address book. If the address is already saved, skip the prompt and close the modal. The user can create a new contact or add the address to an existing one.

---

## 2. Scope

### In scope

- FT transfers (ICP native, ICRC1, BTC, ETH, ERC20)
- NFT transfers (ICP, EVM)
- Post-send "Add to address book?" interstitial screen
- Creating a new address book contact with the recipient address pre-filled
- Adding the recipient address to an existing contact that is missing that chain's field

### Out of scope

- Editing all fields of an existing contact (only the missing chain field is pre-filled)
- Batch NFT transfers
- Vault-originated sends (no address book integration)

---

## 3. User Flow

```
[Confirm Send] ──▶ Transaction broadcast
                         │
              ┌──────────▼──────────┐
              │   SendSuccessUi     │  (unchanged)
              │   "Done" button     │
              └──────────┬──────────┘
                         │ onDone()
                         ▼
              Is recipient already in address book?
                │                       │
               YES                      NO
                │                       │
           onClose()         ┌──────────▼──────────┐
           (modal closes)    │  SendAddressBook     │
                             │  "Add to address     │
                             │   book?" screen      │
                             └──┬────────────┬──────┘
                                │            │
                   [Add new     │            │  [Add to existing
                    contact]    │            │   contact]
                                ▼            ▼
                    AddressBookModal   ChooseAvailableAddressModal
                    (CREATE mode,      (lists contacts missing
                     pre-filled)        the recipient chain field)
                                              │
                                    User picks a contact
                                              │
                                    AddressBookModal
                                    (EDIT mode, pre-filled)
                                              │
                                    [Save] → mutate("addressBook")
                                           → onClose()
```

---

## 4. Logic Details

### 4.1 Address-already-exists check (`isAddressExists`)

Performed in `TransferFTUi` and `TransferNFTUi` after the send succeeds.

| Chain            | Match condition                                            |
| ---------------- | ---------------------------------------------------------- |
| ICP (principal)  | `contact.icpPrincipal === to`                              |
| ICP (account ID) | `contact.icpAccountId?.toLowerCase() === to.toLowerCase()` |
| BTC              | `contact.btc?.toLowerCase() === to.toLowerCase()`          |
| EVM / ERC20      | `contact.evm?.toLowerCase() === to.toLowerCase()`          |

If any existing `UserAddress` matches, `onDone()` calls `onClose()` directly.

### 4.2 Chain-type detection for `predefinedAddress`

**FT path** (`send-ft.tsx`):

| Condition                                          | `predefinedAddress.type` |
| -------------------------------------------------- | ------------------------ |
| `ChainId.ICP` and `to.length === PRINCIPAL_LENGTH` | `"icpWallet"`            |
| `ChainId.ICP` and shorter                          | `"accountId"`            |
| `ChainId.BTC`                                      | `"btcWallet"`            |
| `isEvmToken(chainId)`                              | `"ethWallet"`            |

**NFT path** (`send-nft.tsx`):

| Condition                   | `predefinedAddress.type` |
| --------------------------- | ------------------------ |
| EVM NFT (`MarketPlace.EVM`) | `"ethWallet"`            |
| ICP NFT                     | `"icpWallet"`            |

### 4.3 Contacts eligible for "Add to existing contact" (`contactOptionsToUpdate`)

Only contacts that **do not already have** the relevant chain field are shown.

| Chain          | Filter: show contact only when |
| -------------- | ------------------------------ |
| ICP principal  | `!contact.icpPrincipal`        |
| ICP account ID | `!contact.icpAccountId`        |
| BTC            | `!contact.btc`                 |
| EVM            | `!contact.evm`                 |

If this list is empty, the "Add to existing contact" button is hidden in `SendAddressBook`.

### 4.4 Address book options for the "Send to" autocomplete (`addressesOptions`)

Moved from the app layer to the UI layer. `getAddressBookFtOptions` / `getAddressBookNftOptions` (in `transfer-modal/utils.ts`) convert `UserAddress[]` to `IGroupedSendAddress[]`, filtering to only contacts that already have a value for the active chain.

### 4.5 Contact save / update

Both `createContact` and `updateContact` in `send-ft.tsx` and `send-nft.tsx`:

1. Call the relevant `addressBookFacade` method (`save` / `update`).
2. Revalidate the SWR cache key `"addressBook"` via `mutate("addressBook")`.
3. Call `onClose()` to dismiss the entire transfer modal.

### 4.6 `AddressBookModal` enhancements

- New `predefinedAddress?: PredefinedAddress` prop: when set, pre-populates the corresponding wallet field on mount (overrides any existing field value for CREATE; merges into existing values for EDIT).
- New `showBackButton?: boolean` prop: renders a left-arrow inside the modal title that calls `onClose` (acts as a back-navigation within the overlaid modal stack).
- Modal width narrowed from `md:w-[540px]` → `md:w-[450px]`; input height from `h-[60px]` → `h-[56px]`.

---

## 5. New Components

### `SendAddressBook` (`packages/ui/src/organisms/send-receive/components/send-address-book.tsx`)

Overlay panel that appears after a successful send when the recipient is not in the address book.

| Prop                        | Type                       | Description                                        |
| --------------------------- | -------------------------- | -------------------------------------------------- |
| `isOpen`                    | `boolean`                  | Controls visibility (CSS `hidden`, not unmount)    |
| `onClose`                   | `() => void`               | "Not now" — closes the entire transfer modal       |
| `hasContactsToUpdate`       | `boolean`                  | When false, hides "Add to existing contact" button |
| `setCreateContactModalOpen` | `(value: boolean) => void` | Opens `AddressBookModal` in CREATE mode            |
| `setUpdateContactModalOpen` | `(value: boolean) => void` | Opens `ChooseAvailableAddressModal`                |

Shows a chain-specific illustration (light/dark theme variants).

### `ChooseAvailableAddressModal` (`packages/ui/src/molecules/choose-modal/available-address-modal.tsx`)

Searchable list of existing contacts that are missing the relevant chain field. Selecting one opens `AddressBookModal` in EDIT mode with the recipient address pre-filled.

| Prop                      | Type                                 | Description                                           |
| ------------------------- | ------------------------------------ | ----------------------------------------------------- |
| `addresses`               | `IGroupedSendAddress[] \| undefined` | Pre-filtered contacts (`contactOptionsToUpdate`)      |
| `title`                   | `string`                             | Modal heading                                         |
| `token`                   | `FT \| undefined`                    | Used to render the network icon next to each entry    |
| `isAvailableModalVisible` | `boolean`                            | Controls visibility                                   |
| `onClose`                 | `() => void`                         | Back arrow / dismiss                                  |
| `setSelectedAddress`      | `(id: string) => void`               | Fires when user picks a contact (passes `contact.id`) |

---

## 6. State Changes in `TransferFT` (app layer)

- `addresses` SWR fetch moved earlier in the component (before `submit`) so it is available both for the autocomplete and the post-send flow.
- `setIsSendSuccess` prop added so the coordinator can track send completion independently of the address-book overlay.
- `submit()` now calls `setIsSendSuccess(true)` immediately on entry (before async work) to open the success screen.
- `getAddressBookFtOptions` call removed from app layer; the UI layer calls it internally.

---

## 7. Acceptance Criteria

1. After a successful send, if the recipient address is already in the address book, the modal closes immediately.
2. If the recipient is not in the address book, the "Add to address book?" screen appears.
3. "Add new contact" opens the address book form with the sent-to address pre-filled in the correct field.
4. "Add to existing contact" shows only contacts that are missing the relevant chain field; selecting one opens the edit form with the address pre-filled.
5. After saving (create or update), the SWR cache is revalidated and the modal closes.
6. "Not now" closes the modal without touching the address book.
7. The back arrow in `AddressBookModal` returns the user to the previous overlay without closing the entire modal.
8. The feature works for both FT and NFT send flows.
9. Dark-mode illustrations are shown when the dark theme is active.
