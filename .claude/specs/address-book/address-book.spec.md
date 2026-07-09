# Address Book — Feature Spec

**Status:** Reference — documents existing behaviour
**Related:** `add-to-address-book-post-send.spec.md`, `send.spec.md`

---

## 1. Summary

A per-user contact list that stores named wallet addresses across ICP, BTC, and EVM chains. Used both as a standalone settings page and as an autocomplete source during token/NFT transfers.

---

## 2. Scope

### In scope

- CRUD operations: create, read (list + search + sort), update, delete
- Multi-chain contacts: one contact can hold ICP Account ID, ICP Principal, BTC, and EVM addresses simultaneously
- Inline address-copy in the list view
- Name-based sorting (ascending / descending / default)
- Full-text search across name and all wallet fields
- Duplicate detection per field across the whole address book
- Address format validation per chain
- Empty state with CTA
- Delete confirmation dialog

### Out of scope

- Importing/exporting contacts
- Sharing contacts between users
- Pagination (all contacts loaded at once)

---

## 3. Data Model

### `UserAddress`

| Field          | Type                  | Notes                                                   |
| -------------- | --------------------- | ------------------------------------------------------- |
| `id`           | `string`              | Opaque identifier (canister-assigned)                   |
| `name`         | `string`              | Required, ≥ 2 chars, unique (case-insensitive, trimmed) |
| `icpAccountId` | `string \| undefined` | ICP Account ID (64-char hex)                            |
| `icpPrincipal` | `string \| undefined` | ICP Principal / ICRC-1 address                          |
| `btc`          | `string \| undefined` | Bitcoin address                                         |
| `evm`          | `string \| undefined` | EVM-compatible address (0x…)                            |

All wallet fields are optional; a contact with only a name is technically valid at the type level, though the form requires at least one for practical use (no explicit rule — save is enabled as long as `isValid` is true and name is filled).

### `UserAddressSaveRequest`

Same shape as `UserAddress` minus `id`.

### `UserAddressUpdateRequest`

Same as `UserAddressSaveRequest` plus `id` (required).

---

## 4. Service Layer (`addressBookFacade`)

Backed by `DefaultAddressBookFacade` → `AddressBookRepository` → ICP canister client.

| Method            | Description                               |
| ----------------- | ----------------------------------------- |
| `findAll()`       | Fetches all contacts, sorts by name (A→Z) |
| `save(request)`   | Creates a new contact                     |
| `update(request)` | Updates an existing contact by id         |
| `delete(id)`      | Removes a contact                         |
| `get(id)`         | Fetches a single contact                  |
| `ftSearch(req)`   | Autocomplete for FT send modal            |
| `nftSearch(req)`  | Autocomplete for NFT send modal           |
| `search(req)`     | General address lookup                    |

SWR cache key: `"addressBook"`. Callers must call `mutate("addressBook")` after any write to keep the UI in sync.

---

## 5. UI Components

### `AddressBook` (`packages/ui/src/organisms/address-book/index.tsx`)

Top-level organism; expects all data and callbacks from a container/page.

**Props:**

| Prop        | Type                                               |
| ----------- | -------------------------------------------------- |
| `addresses` | `UserAddress[] \| undefined`                       |
| `isLoading` | `boolean`                                          |
| `onCreate`  | `(req: UserAddressSaveRequest) => Promise<void>`   |
| `onUpdate`  | `(req: UserAddressUpdateRequest) => Promise<void>` |
| `onRemove`  | `(id: string) => Promise<void>`                    |

**States:**

| State             | Description                                                                |
| ----------------- | -------------------------------------------------------------------------- |
| Loading           | Shows `TableTokenSkeleton` (5 rows × 2–5 cells depending on viewport)      |
| Empty             | Illustration + "Your address book is currently empty." + "Add contact" CTA |
| Populated         | Search bar + "Add contact" button + sortable table                         |
| Search no results | "No contacts found." message in table body                                 |

**Sorting (Name column):**

Cycles through DEFAULT → DESCENDING → ASCENDING → DEFAULT on each click. Icon changes per state (default, hover, ascending, descending SVGs). Sort applies before the search filter.

**Search:**

Filters on `name`, `icpAccountId`, `icpPrincipal`, `btc`, `evm` — all case-insensitive. Applied after sorting.

---

### `AddressBookRow` (`packages/ui/src/organisms/address-book/AddressBookRow.tsx`)

Single table row. Renders chain icons + `CopyAddress` (truncated to 6 leading / 4 trailing chars) for whichever fields are populated. Empty fields show nothing.

Columns: Name | ICP Account ID | ICP Wallet | BTC Wallet | EVM Wallet | Actions (⋯)

Dropdown position auto-adjusts: last 3 rows use `"top"` to avoid clipping.

---

### `AddressBookDropdown` (`packages/ui/src/organisms/address-book/AddressBookDropdown.tsx`)

Three-dot menu per row. Options: **Edit** (pencil icon) and **Remove** (trash icon). Icons switch between light/dark variants based on theme.

---

### `AddressBookModal` (`packages/ui/src/organisms/address-book/AddressBookModal.tsx`)

Shared create/edit modal. Width `md:w-[450px]`, max-height 90vh with scrollbar.

**Modes:**

| Mode     | Trigger              | Title             | Submit label  |
| -------- | -------------------- | ----------------- | ------------- |
| `CREATE` | "Add contact" button | "Add new contact" | "Add contact" |
| `EDIT`   | Row dropdown → Edit  | "Edit contact"    | "Save"        |

**Form fields:**

| Field       | Label              | Validation                                                                               |
| ----------- | ------------------ | ---------------------------------------------------------------------------------------- |
| `name`      | Name               | Required; min 2 chars; unique (case-insensitive trim) across all contacts except current |
| `accountId` | ICP Account ID     | Optional; must pass `validateAccountId` if filled; unique (trimmed)                      |
| `icpWallet` | ICP wallet address | Optional; must pass `validateICRC1Address` if filled; unique (trimmed)                   |
| `btcWallet` | BTC wallet address | Optional; must pass `validateBTCAddress` if filled; unique (trimmed)                     |
| `ethWallet` | EVM wallet address | Optional; must pass `validateETHAddress` if filled; unique (lowercased)                  |

Validation mode: `"all"` (validates on change and blur). Submit button disabled while form is invalid or submitting.

**Reset behaviour:**

- On close: all fields reset to empty.
- On open in EDIT mode: fields populated from the `address` prop; if `predefinedAddress` is also set, its field overwrites the corresponding value.
- On open in CREATE mode with `predefinedAddress`: only the matching field is pre-filled.

**Optional props (used in post-send flow):**

| Prop                | Effect                                                                             |
| ------------------- | ---------------------------------------------------------------------------------- |
| `showBackButton`    | Renders a left-arrow before the title; clicking it calls `onClose`                 |
| `predefinedAddress` | Pre-fills one wallet field (`accountId` / `icpWallet` / `btcWallet` / `ethWallet`) |

---

### Delete confirmation modal

Uses generic `ModalComponent`. Shows the contact name and two buttons: **Cancel** and **Remove** (red, with spinner while deleting).

---

## 6. Validation Rules

### `validateAddressBook` (duplicate check)

Compares the entered value (after `normalize`) against all existing contacts, excluding the contact currently being edited (`addressId`). Returns an error string on duplicate, `true` on pass.

### `chainValidate` (field validator chain)

Runs validators in order; first failure wins. Allows short-circuit: if a validator returns `true`, the next runs; if it returns `false`, reports "Invalid value"; if it returns a string, that string is the error.

---

## 7. Acceptance Criteria

1. The address book list is sorted A→Z by default from the API; client-side sort cycles through DEFAULT / DESCENDING / ASCENDING.
2. Search filters across name and all four wallet address fields simultaneously.
3. A contact cannot be saved without a name of at least 2 characters.
4. Each wallet address field is independently optional but must pass chain-specific format validation when filled.
5. No two contacts may share the same name (case-insensitive), account ID, ICP principal, BTC address, or EVM address (case-insensitive for EVM).
6. Editing a contact pre-populates all existing values; the duplicate check excludes the contact being edited.
7. The delete confirmation names the contact and requires explicit confirmation before removal.
8. After any write (create / update / delete), the `"addressBook"` SWR key is revalidated so the list reflects the change.
9. All interactive elements have accessible labels or visible text; chain icons are decorative.
10. Dark-mode variants are applied to icons, inputs, and backgrounds.
