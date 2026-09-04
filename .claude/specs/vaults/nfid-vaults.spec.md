# NFID Vaults — Integration Service

## 1. Overview

A **vault** is a multi-signature smart contract on the Internet Computer. A user pays
for one in ICP, the protocol creates a dedicated canister for it, and from then on the
vault holds assets that its members move by proposing and approving transactions.

This document covers the frontend side: creating a vault, listing the ones a user owns,
and driving a vault once it exists.

The integration lives in `packages/integration/src/lib/nfid-vaults/`.

```
packages/integration/src/lib/nfid-vaults/
├── nfid-vaults.service.ts   # NfidVaultsService — the entry point
├── vault-manager.idl.ts     # IDL for the vault manager canister
├── types.ts                 # TypeScript interfaces
└── index.ts                 # Public exports
```

---

## 2. Canisters Involved

| Canister      | Role                                       | dev                           | ic                            |
| ------------- | ------------------------------------------ | ----------------------------- | ----------------------------- |
| Vault manager | Sells and creates vaults                   | `sgk26-7yaaa-aaaan-qaovq-cai` | `4bgdx-hqaaa-aaaar-qaeqq-cai` |
| Vault         | One per user vault, created by the manager | —                             | —                             |
| User registry | Records which vaults a user owns           | `zsjjs-7aaaa-aaaak-apgyq-cai` | `2sdah-saaaa-aaaal-adqna-cai` |
| ICP ledger    | Payment, via an ICRC-2 allowance           | `ryjl3-tyaaa-aaaaa-aaaba-cai` | same                          |

The manager id comes from `NFID_VAULT_MANAGER_CANISTER_ID`, declared per environment
in `.env.*`.

---

## 3. Identities — read this first

**Two identities are in play and they are not interchangeable.** Passing the wrong one
does not fail loudly: it creates a vault the user cannot operate, or records it under
the wrong owner.

| Used for                                            | Identity | How it reaches the call                    |
| --------------------------------------------------- | -------- | ------------------------------------------ |
| Reading the price                                   | Global   | `getPrice(identity)` parameter             |
| Approving ICP and creating the vault                | Global   | `createVault(name, identity)` parameter    |
| Naming the vault, and every later vault transaction | Global   | `getManager(id, identity)` parameter       |
| Recording and listing vaults in the user registry   | Device   | Implicit — the shared `userRegistry` actor |

**Global identity** is the principal that pays for the vault, becomes its controller and
its first admin, and signs its transactions. It is the same principal across the user's
devices, which is what makes a vault reachable after switching device. Obtain it with
`getGlobalDelegation(...)` and pass it in explicitly.

**Device identity** is the shared authenticated actor the package already carries. The
user registry does not take a principal: it resolves the user _root_ from the caller
through the identity manager, and both identities resolve to the same root. That is why
the registry needs no parameter and still returns the same list on every device.

> A vault only accepts transactions from a principal registered as its member. The
> member registered at creation is the **global** principal. Sign a vault transaction
> with a device identity and the vault rejects it as `Not registered`.

---

## 4. Pricing

The price is **not configured** — it is derived, and it moves with the ICP rate:

```
cost    = (vault funding + canister creation fee) converted at the ICP/XDR rate
price   = cost + 10% protocol margin + 2 ledger fees
approve = price + 10% head room + 1 ledger fee
```

Both cycle figures come from the replica and the CMC at call time, so the price follows
the subnet the manager runs on and the current rate. At an ICP/XDR rate of ~1.88 a vault
costs roughly **0.44 ICP**.

```typescript
const price = await nfidVaultsService.getPrice(globalIdentity)

price.priceE8s // charged from the user
price.approveE8s // what to approve — always use this, never priceE8s
price.costE8s // the part that buys cycles
price.protocolE8s // the protocol margin
price.xdrPermyriadPerIcp
```

`getPrice` is an **update call**, not a query: the manager asks the cycles minting
canister for the rate.

**Approve `approveE8s`, not `priceE8s`.** It covers the ledger fee, which
`icrc2_transfer_from` charges on top of the amount, plus head room for the rate moving
between quoting and charging. An ICRC-2 allowance is an upper bound and the manager
pulls only what the vault actually costs, so the head room costs the user nothing.

---

## 5. Creating a Vault

```typescript
import {
  nfidVaultsService,
  VaultCreationIncompleteError,
} from "@nfid/integration"

try {
  const canisterId = await nfidVaultsService.createVault(
    "My vault",
    globalIdentity,
  )
} catch (e) {
  if (e instanceof VaultCreationIncompleteError) {
    // The vault EXISTS and is paid for. Do not treat this as a failed creation.
    e.canisterId // keep it
    e.named // false when the name did not stick
    e.recorded // false when it is missing from the registry
  }
}
```

What happens inside, in order:

1. `getPrice` — the price at the current rate.
2. `icrc2_approve` on the ICP ledger for `approveE8s`, spender = the manager.
3. `create_canister_icrc2` — the manager pulls the payment, creates the canister,
   installs the vault wasm, and hands control of the canister to the vault itself.
4. In parallel, retried three times each: a naming transaction on the vault, and
   `add_vault_canister` on the user registry.

Steps 1–3 either fully succeed or leave the user's ICP untouched — the manager refunds
the payment if the canister cannot be created. Step 4 happens **after** the vault is
paid for, which is why it retries and why its failure is reported without ever throwing
away the canister id.

### The vault right after creation

- The global principal is the only member, with the **Admin** role.
- The quorum is **1**, so that admin alone can approve anything.
- The vault has no wallets and no policies yet.
- The vault's only controller is the vault canister itself — it upgrades through its own
  upgrade transaction, not through the manager.

---

## 6. Listing a User's Vaults

```typescript
const vaults = await nfidVaultsService.getVaults()
// [{ canisterId, name, createdAt }]
```

No parameter: the registry resolves the user root from the caller and returns only that
user's vaults. This is the only place the association between a user and their vaults
is stored — neither the vault nor the manager knows who owns a vault.

A vault missing from this list is not lost; it just was never recorded. Its id can be
re-added with `userRegistry.add_vault_canister(canisterId, name)`.

---

## 7. Working With a Vault

`getManager` returns the `VaultManager` from the `@nfid/vaults` SDK, bound to one vault.

```typescript
const manager = nfidVaultsService.getManager(canisterId, globalIdentity)

const state = await manager.getState() // members, wallets, policies, quorum
const transactions = await manager.getTransactions()
```

### The transaction model

A vault is **event-sourced**: the list of transactions is the source of truth and the
vault state is a projection of it. Nothing is written directly — everything is a
transaction that goes through the same lifecycle:

```
Pending ──(approvals reach the quorum)──> Approved ──> Executed
   │
   └──(too many rejections to ever reach it)──> Rejected
```

- `requestTransaction` creates one and **executes it immediately** if the quorum is
  already met. With a fresh vault (quorum 1, one admin) that means a single call does
  the whole job.
- `approveTransaction` adds an approval and executes when the quorum is reached.
- Vault-state transactions (members, policies, quorum, naming) accept **Admin** votes
  only. Transfers accept Admin and Member.

```typescript
import {
  MemberCreateTransactionRequestV2,
  QuorumTransactionRequest,
  VaultRole,
  TransactionState,
} from "@nfid/vaults"

await manager.requestTransaction([
  new MemberCreateTransactionRequestV2(
    { owner: memberPrincipal, subaccount: undefined },
    "Second admin",
    VaultRole.ADMIN,
  ),
])

await manager.approveTransaction([
  { trId: 1n, state: TransactionState.Approved },
])
```

### Batches

Pass several requests in one `requestTransaction` call to apply them atomically. They
must **all share the same `batch_uid`, or none may have one** — a mixed array is
rejected outright. If any transaction in a batch fails, the whole batch is rejected and
the vault state rolls back to before it.

```typescript
import { generateRandomString } from "@nfid/vaults"

const batch = generateRandomString()
await manager.requestTransaction([
  new WalletCreateTransactionRequest(uid, "Main wallet", Network.IC, batch),
  new PolicyCreateTransactionRequest(policyUid, 2, 100_000_000n, [uid], batch),
])
```

### Blocking

A transaction is **Blocked** while an earlier unfinished transaction changes the vault
state or moves funds. This is ordering, not an error: it clears by itself once the
earlier transaction finishes. Treat `Blocked` as "wait", never as "retry".

### Available transaction requests

| Area          | Requests                                                                                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vault         | `VaultNamingTransactionRequest`, `QuorumTransactionRequest`, `ControllersUpdateTransactionRequest`, `VersionUpgradeTransactionRequest`, `PurgeTransactionRequest`                   |
| Members       | `MemberCreateTransactionRequestV2`, `MemberUpdateNameTransactionRequest`, `MemberUpdateRoleTransactionRequest`, `MemberRemoveTransactionRequest`, `MemberExtendICRC1AccountRequest` |
| Wallets       | `WalletCreateTransactionRequest`, `WalletUpdateNameTransactionRequest`                                                                                                              |
| Policies      | `PolicyCreateTransactionRequest`, `PolicyUpdateTransactionRequest`, `PolicyRemoveTransactionRequest`                                                                                |
| Transfers     | `TransferTransactionRequest`, `TransferQuorumTransactionRequest`, `TransferICRC1QuorumTransactionRequest`, `TopUpTransactionRequest`, `TopUpQuorumTransactionRequest`               |
| ICRC-1 tokens | `ICRC1CanistersAddTransactionRequest`, `ICRC1CanistersRemoveTransactionRequest`                                                                                                     |

`MemberCreateTransactionRequest` (without `V2`) is the legacy address-based variant.
Use `V2`, which takes an ICRC-1 account.

---

## 8. Gotchas

- **Never approve `priceE8s`.** It does not cover the ledger fee, and
  `create_canister_icrc2` fails with an insufficient-allowance error.
- **`VaultCreationIncompleteError` is not a failed creation.** The user has paid and the
  vault exists. Surface its `canisterId`; do not offer to "try again", which would
  create and charge for a second vault.
- **The SDK ships against `@dfinity/agent`,** while this package uses `@icp-sdk/core`.
  The identity types are structurally the same and `getManager` casts across; the older
  `@dfinity/*` packages are installed at the root purely as peer dependencies.
- **Quorum 1 is the default,** so a single-admin vault executes everything immediately.
  Anything written against a multi-admin vault must handle a `Pending` result instead of
  assuming `Executed`.
- **`getVaults` is device-independent, `createVault` is not.** A vault created with the
  wrong identity still lands in the list, but the user will not be able to sign its
  transactions.
