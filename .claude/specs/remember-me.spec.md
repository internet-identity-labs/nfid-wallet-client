# Spec: Remember Me (integration layer)

> Status: APPROVED — revision 2, 2026-09-09 · IMPLEMENTED
> Revision 3 — naming / structure only, no behaviour change (see the italic
> notes below and "## Revision 3" in the plan): `rememberMeKeyVal` →
> `rememberMeLocalStorage`; `StoragePersistenceRegistry` → `StorageRegistry`
> (also absorbs the memory-keyval cache — the standalone `MemoryKeyValCache`
> class is deleted); `RememberMeStore` → `IdbStore` and the `MigratableStore`
> interface is dropped; `#memoryBacking` → `#memory`; the storage lib is split
> into `enum/ state/ service/ store/ keyval/` subfolders;
> `auth-state.logout.spec.ts` → `auth-state.spec.ts`;
> `constants/raw-keys.constant.ts` → `constants.ts`; all comments stripped from
> `remember-me.service.ts` (contract now lives only in this spec).
> Revision 4 — structure / naming, plus one deliberate scope cut (see "## Revision
> 4" in the plan): `StoragePersistenceMode` → `StorageMode`
> (`enum/storage-mode.ts`); the per-store in-memory backings move off
> `StorageRegistry` — each `IdbStore` owns its own `#memory` `MemoryKeyVal`;
> `IdbDatabaseCleaner.deleteAll()` drops the `indexedDB.databases()` origin
> sweep (it still deletes the registered databases + the defensive, log-only
> `auth-client-db`); the `store/` folder is flattened
> (`idb-store.ts` / `storage.ts` / `ttl-storage.ts` sit at the storage root next
> to `remember-me-local-storage.ts`); `ttl-cache-service.ts` → `service/`;
> `idb-keyval.test.ts` → `idb-keyval.spec.ts`.
> Revision 5 — structure only, no behaviour change (see "## Revision 5" in the
> plan): (a) `StorageRegistry` and `IdbDatabaseCleaner` merge into a single
> `IdbService` / `idbService` (`service/idb-service.ts`) — the registry methods
> (`register` / `getDbNames` / `migrateAllToMemory` / `rebindAllToDisk` /
> `clear` / `clearMemory`) plus `deleteAll()` on one class; `idbService` takes
> no constructor arguments (`deleteAll()` reads `this.getDbNames()`). (b) The
> `doNotRememberMe()` raw-key relocation loop moves onto the facade as
> `rememberMeLocalStorage.moveToMemory(keys)` (writes straight to `#memory`,
> then a raw `window.localStorage.removeItem` — mode-independent), called
> **before** `storageModeState.set(StorageMode.MEMORY)`, which is now the final
> line of the commit.
> Revision 6 — behaviour delta, null-case only (see "# Revision 6" in the plan):
> `IdbService.deleteAll()` drops the defensive `deleteDB("auth-client-db")`.
> `auth-client-db` is the `IdbKeyVal` default DB name (DFINITY `@dfinity/auth-client`
> convention) and is never created on the NFID path — every store passes an
> explicit `dbName`, the auth session lives in `authstate` — so the call was a
> permanent no-op. The registered set (`getDbNames()`) is the sole wipe list; a
> store that must be cleared on logout has to be a registered `Storage` /
> `TtlStorage`.
> Revision 7 — behaviour delta, `wallets` db exempted + 3 external dbs added to
> the hard-logout wipe (see "## Revision 7" in the plan): every `IdbStore` gains
> `persistenceType: StorageMode[]` — **no new enum**, it reuses the existing
> `StorageMode` (`DISK` / `MEMORY`). It's a private field (`#persistenceType`)
> set once in the `IdbStore` constructor from an optional `persistenceType?:
StorageMode[]` on `IdbStoreOptions`, defaulting to
> `[StorageMode.DISK, StorageMode.MEMORY]` when omitted, and exposed read-only
> via a public `get persistenceType()` — external code can read it but not
> reassign it. `walletStorage`
> (`packages/integration/src/lib/authentication/storage.ts`, `dbName: "wallets"`)
> is constructed with `persistenceType: [StorageMode.DISK]`.
> `IdbService.deleteAll()` and `migrateAllToMemory()` both filter the registry to
> entries whose `persistenceType` includes `StorageMode.MEMORY`; a store
> that returns `[DISK]` only is never wiped (hard logout **or**
> `doNotRememberMe()`) and never migrated to memory (stays disk-backed even in a
> `MEMORY`-mode session). `rebindAllToDisk()` is unaffected (such a store was
> never rebound off disk).
> Separately, `IdbService` gains `deleteExternalDbs(): Promise<void>` — deletes 3
> hardcoded **unregistered** third-party db names —
> `WALLET_CONNECT_V2_INDEXED_DB`, `icp-sdk-ic0.app`, `icp-sdk-icp-api.io`
> (WalletConnect SDK + `@icp-sdk` agent caches; never go through
> `Storage`/`TtlStorage`, so they never register and can't carry a
> `persistenceType`), reusing the same `#deleteSingleDb` timeout-raced
> delete as `deleteAll()`. **The external list is not merged into `deleteAll()`**
> — `deleteAll()` still only ever touches registry entries (now filtered by
> persistence type, see above); the 3 external names live solely in
> `deleteExternalDbs()`. `_clearAuthSessionFromCache(hard)` is the sole caller of
> `deleteExternalDbs()`, called alongside its existing `idbService.deleteAll()`,
> inside the same `if (hard)` block — so the 3 external dbs are wiped on hard
> logout only; `doNotRememberMe()` (`remember-me.service.ts`) calls `deleteAll()`
> only, unchanged, and never touches them. This reintroduces a narrow, explicit
> exception to the Revision 4/6 "no origin sweep, no unregistered db" rule —
> scoped to these 3 named databases only, not a general `indexedDB.databases()`
> sweep.
> **No new guard on the logout path itself** — `_clearAuthSessionFromCache(hard)`
> (`packages/integration/src/lib/authentication/auth-state.ts:193-205`) already
> only touches `localStorage` / calls `idbService.deleteAll()` inside `if (hard)`;
> a soft logout (`hard === false` — idle timeout, account switch, 3rd-party
> disconnect, `identitykit` coordinator) was already a no-op for every IndexedDB
> database, wallets and the 3 external dbs included. Confirmed by reading the
> current implementation; this revision documents the invariant, it does not
> change it.
> Created: 2026-09-08

## Overview

At sign-in the user chooses whether this device is **remembered** (session
persists across tab close / restart — today's behaviour) or **not remembered**
(closing or reloading the tab logs them out and leaves nothing behind: no
IndexedDB, no identifying `localStorage`).

Two storage modes:

- **`DISK`** — IndexedDB (`IdbKeyVal`) + `localStorage` for raw keys. The default;
  survives tab close / restart.
- **`MEMORY`** — `MemoryKeyVal`; nothing survives reload / tab close.

No flag key — the presence of `anchor` in raw `localStorage` is the single
"this device is remembered" signal. The only state change is a one-way
`DISK → MEMORY` when the user opts out. There is **no `MEMORY → DISK` path**: to
be remembered again the user signs out (a hard logout reloads the page, resetting
the mode to `DISK`) and signs in again. No `sessionStorage` tier.

This spec covers **only the integration layer** — `@nfid/client-db` (the storage
proxy + primitives) and a `@nfid/integration` `remember-me` module exposing
`rememberMeService`. The modal UI, server-side session validation, and the embed
surface are out of scope.

## Scope

- **`packages/client-db/src/lib/storage/`** — SRP-split modules (one class per
  file, each with a matching `*.spec.ts`), grouped into subfolders:
  - `enum/storage-mode.ts` — the enum (no spec); Revision 7 reuses it as the
    return type of `persistenceType` — no new enum file
  - `state/storage-mode-state.ts` — `StorageModeState` / `storageModeState`
  - `service/idb-service.ts` — `IdbService` / `idbService` (store registry +
    two-phase migration + `deleteAll()` on-disk wipe; no constructor args; holds
    **no** in-memory backings; `deleteAll()` covers the registered databases only
    — no `auth-client-db`, no origin sweep — and, as of Revision 7, excludes any
    store whose `persistenceType` does not include `StorageMode.MEMORY`;
    `migrateAllToMemory()` excludes the same set. Also gains `deleteExternalDbs()`
    — Revision 7, deletes the 3 hardcoded external db names, called only from
    `_clearAuthSessionFromCache(hard)`)
  - `service/ttl-cache-service.ts` — `TtlCacheService` / `ttlCacheService`
  - `keyval/idb-keyval.ts` (+`close()`, +`.spec.ts`), `keyval/memory-keyval.ts`
  - root: `idb-store.ts` — `IdbStore` abstract base (no `MigratableStore`
    interface), owns its own `#memory` `MemoryKeyVal`; declares
    a private `#persistenceType` field with public read-only
    `get persistenceType(): StorageMode[]`, set once in the constructor from
    the optional `persistenceType?: StorageMode[]` on `IdbStoreOptions`,
    defaulting to `[StorageMode.DISK, StorageMode.MEMORY]`; `storage.ts`,
    `ttl-storage.ts` extend it; `remember-me-local-storage.ts` —
    `RememberMeLocalStorage` / `rememberMeLocalStorage`; `types.ts`, `index.ts`

  `MEMORY` reuses `MemoryKeyVal` (no `SessionStorageKeyVal`).

- **`packages/integration/src/lib/remember-me/`** — sibling to
  `recovery-provisioning/`: `remember-me.service.ts` (+`.spec.ts`),
  `error/remember-me.error.ts`, `constants.ts`. Barrel export in
  `packages/integration/src/index.ts`. `auth-state.ts`
  `_clearAuthSessionFromCache(hard)` calls `idbService.deleteAll()`;
  its spec is `auth-state.spec.ts`.
- **`apps/nfid-frontend`** — 4 raw `localStorage` call sites moved onto the
  `rememberMeLocalStorage` facade (`anchor`, BTC address, ETH address,
  `emailIntervalId`).
- **`packages/integration/src/lib/authentication/storage.ts`** — `walletStorage`
  (`dbName: "wallets"`) constructed with `persistenceType: [StorageMode.DISK]`.
  This is the only store pinned as of Revision 7;
  every other registered `Storage` / `TtlStorage` (`authstate`, `profile-db`,
  `domainkey-db`, `ic-explorer-db`, `ttl-db`, `notes-db`) keeps the default
  `[StorageMode.DISK, StorageMode.MEMORY]` and is unaffected.
- **`auth-state.ts`** `_clearAuthSessionFromCache(hard)` — Revision 7 adds one
  call, `await idbService.deleteExternalDbs()`, alongside the existing
  `await idbService.deleteAll()`, both inside `if (hard)`.
- **Bootstrap** — storage always boots `DISK`. No startup resolver, no hook in
  `makeAuthState()`. Mode becomes `MEMORY` only via `doNotRememberMe()`; a hard
  logout reload re-creates the `storageModeState` singleton at its `DISK` default.
- **Embed** — no handling; embeds never call `doNotRememberMe`, so they stay
  `DISK`. No `apps/nfid-wallet` in this repo.
- **Browser-only** — nfid-frontend is a Vite SPA (`BrowserRouter`, no SSR). No
  `typeof window` / `hasWindow` guards in the new files.

## Naming

| Concept                       | Name                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| module dir                    | `remember-me/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| service singleton / interface | `rememberMeService` / `RememberMeService`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| error class                   | `RememberMeError` (extends `Error`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| mode enum                     | `StorageMode` (`DISK` / `MEMORY`) — `enum/storage-mode.ts`, re-exported from `@nfid/client-db`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| "remembered" signal           | presence of `anchor` in raw `localStorage` (no flag key)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| mode state                    | `StorageModeState` → `storageModeState`: `get()` / `set(mode)` / `reset()`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| idb service                   | `IdbService` → `idbService` (`service/idb-service.ts`, no constructor args): `register(dbName, storeName, store)` / `getDbNames()` / `migrateAllToMemory()` / `rebindAllToDisk()` / `clear()` (registrations; also resets each registered store's memory) / `clearMemory()` (resets each registered store's `MemoryKeyVal` only — for the logout spec) / `deleteAll()` (deletes the registered databases only — no `auth-client-db`, no origin sweep; reads `this.getDbNames()`) / `deleteExternalDbs()` (Revision 7 — deletes the 3 hardcoded unregistered db names; called only from `_clearAuthSessionFromCache(hard)`). Holds no memory map of its own. As of Revision 7, `deleteAll()` and `migrateAllToMemory()` both skip any registered entry whose `store.persistenceType` does not include `StorageMode.MEMORY` before computing their target set. |
| store base                    | `IdbStore` abstract base (`IdbStoreOptions`): `storeKey`, constructor self-register, private `#memory` `MemoryKeyVal` (created on construction), `copyToMemory` / `commitToMemory` / `rebindToDisk`, `protected memoryStore()` (→ its own `#memory`), `clearMemory()` (swap in a fresh `#memory`) — `Storage` / `TtlStorage` extend it. **No `MigratableStore` interface** — the registry types its entries as `IdbStore` (imported type-only). private `#persistenceType` with public read-only `get persistenceType(): StorageMode[]` (Revision 7 — default `[StorageMode.DISK, StorageMode.MEMORY]`, set from optional `persistenceType?: StorageMode[]` on `IdbStoreOptions`; reuses the existing `StorageMode` enum, no new enum type).                                                                                                                 |
| raw-key facade                | `RememberMeLocalStorage` → `rememberMeLocalStorage` (`remember-me-local-storage.ts`, storage root): `getItem` / `setItem` / `removeItem` / `clear()` / `moveToMemory(keys: string[])` (pull each key from `window.localStorage` into `#memory`, then raw `window.localStorage.removeItem` — mode-independent); private `#memory`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ttl cache                     | `TtlCacheService` → `ttlCacheService` — `service/ttl-cache-service.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

## Contract

```ts
// packages/client-db — StorageMode (single source of truth)
export enum StorageMode {
  DISK = "DISK", // IndexedDB (+ localStorage for raw keys) — survives restart (DEFAULT)
  MEMORY = "MEMORY", // MemoryKeyVal — nothing survives reload / tab close
}

// packages/integration/src/lib/remember-me/error/remember-me.error.ts
export class RememberMeError extends Error {
  constructor(message?: string) {
    super(message ?? "Remember-me operation failed")
  }
}

// packages/integration/src/lib/remember-me/remember-me.service.ts
export type RememberMeService = {
  // true  -> `anchor` present in raw localStorage -> modal NOT shown.
  // false -> no `anchor` -> modal IS shown. Any internal read error -> false.
  isRemembered(): boolean

  // Opt this device OUT. One-way DISK -> MEMORY. STRICTLY BINARY: the session
  // ends fully DISK (any failure — device still remembered, nothing lost) or
  // fully MEMORY (success). No tolerated mixed state. No in-session retry —
  // recovery is sign-out + sign-in.
  //   - mode already MEMORY -> resolve (no-op).
  //   - mode DISK ->
  //       1. idbService.migrateAllToMemory() — COPY phase: every
  //          registered store copies its IndexedDB rows into its cached
  //          MemoryKeyVal, touching nothing else. Only when EVERY copy succeeds:
  //          COMMIT phase — close each IndexedDB connection, rebind each instance
  //          to MEMORY. Copy-phase failure rebinds nothing -> reject
  //          RememberMeError("Unable to switch to in-memory storage"); mode still
  //          DISK, no key removed, no db deleted.
  //       2. idbService.deleteAll(). Fails -> idbService.rebindAllToDisk() (drop
  //          every initializedStore so the next access re-opens IdbKeyVal;
  //          on-disk data was never deleted), then reject
  //          RememberMeError("Unable to clear on-disk storage"). Net: fully DISK.
  //       3. FINAL COMMIT (only when 1-2 both succeeded, non-failable):
  //          rememberMeLocalStorage.moveToMemory(RAW_KEYS_TO_MOVE) — pull anchor /
  //          eth-address / bitcoin-address / emailIntervalId out of localStorage
  //          into #memory (raw removeItem each) — THEN storageModeState.set(MEMORY)
  //          as the last line. moveToMemory writes #memory directly so it is
  //          order-independent of the mode flip.
  doNotRememberMe(): Promise<void>
}
```

There is **no method for the "remember me" choice** — being remembered is the
default; the auth flow writes `anchor` to `localStorage` on every successful
sign-in. Keep the two `RememberMeError` messages stable — the modal may match on
them.

## `@nfid/client-db` primitives

Focused singleton classes (not module-level `let` + free functions). Each is
exported as the class (typing / test construction) and as a lazily-shared
singleton, and carries a `reset()` / `clear()` so specs get fresh state without
`jest.resetModules()` + `await import()`.

```ts
// state/storage-mode-state.ts
class StorageModeState {
  get(): StorageMode /*default DISK*/
  set(mode): void
  reset(): void
}

// service/idb-service.ts — store registry + two-phase migration + on-disk wipe. No constructor args.
class IdbService {
  register(dbName: string, storeName: string, store: IdbStore): void // deduped by `${dbName}:${storeName}`
  getDbNames(): string[] // distinct, ALL registered stores (persistence-agnostic — unfiltered)
  migrateAllToMemory(): Promise<void> // atomic: COPY phase (read every store's IDB rows into its
  // own #memory, nothing closed/rebound) then COMMIT phase
  // (close + rebind) only when EVERY copy succeeded.
  // Copy-phase failure REJECTS having rebound nothing.
  // Revision 7: only touches entries whose persistenceType
  // includes StorageMode.MEMORY — a [DISK]-only store is skipped
  // entirely (never copied, never closed/rebound).
  rebindAllToDisk(): void // undo COMMIT: drop every store's bound instance; sync, never throws
  clear(): void // registrations; also resets each registered store's #memory
  clearMemory(): void // resets each registered store's #memory only —
  // auth-state.spec.ts keeps its registrations
  deleteAll(): Promise<void> // delete the distinct dbNames of registered stores whose
  // persistenceType includes StorageMode.MEMORY (Revision 7 —
  // was unconditionally this.getDbNames(), 7 dbs; now excludes any
  // [DISK]-only store, e.g. "wallets") via deleteDB raced against a
  // ~3s timeout. REJECTS if any targeted db fails. No "auth-client-db"
  // defensive delete, no indexedDB.databases() sweep.
  // Per-db delete + timeout are PRIVATE methods.
  deleteExternalDbs(): Promise<void> // Revision 7 — delete a hardcoded list of 3
  // unregistered third-party db names (WALLET_CONNECT_V2_INDEXED_DB,
  // icp-sdk-ic0.app, icp-sdk-icp-api.io) via the same #deleteSingleDb
  // timeout-raced delete. Independent of the registry. Called only
  // from auth-state.ts _clearAuthSessionFromCache(hard), inside
  // if (hard) — never from doNotRememberMe(). NEVER REJECTS: unlike
  // deleteAll(), each of the 3 deletes is individually caught and
  // console.error-logged — these are best-effort cache sweeps, not
  // part of the atomic wipe, so a failure never blocks the rest of
  // hard logout (deleteDB is a no-op/resolves if the db doesn't
  // exist, so a db never created by this browser/session is not an
  // error either).
}

// remember-me-local-storage.ts (storage root) — string facade for the raw identifying-key call sites; owns #memory
class RememberMeLocalStorage {
  getItem(key: string): string | null // MEMORY -> #memory; DISK -> window.localStorage
  setItem(key: string, value: string): void
  removeItem(key: string): void // clears BOTH backings
  clear(): void
  moveToMemory(keys: string[]): void // for each key: window.localStorage.getItem -> #memory.set,
  // then RAW window.localStorage.removeItem (NOT this.removeItem,
  // which would wipe #memory too). Writes #memory directly, so it
  // is independent of the current mode — the DISK->MEMORY commit
  // calls it BEFORE storageModeState.set(MEMORY).
}
```

- `Storage` / `TtlStorage` extend `IdbStore`, whose constructor calls
  `idbService.register(dbName, storeName, this)`. Several `Storage`
  instances may share a `dbName`; `deleteAll()` collapses to the distinct set.
- **No `MigratableStore` interface** — `IdbService` types its entries as
  `IdbStore`, imported **type-only** from `../idb-store` (erased at compile, so
  no runtime cycle). `IdbStore` imports the `idbService` value.
- The subclass `_db` getters read the memory backing via the inherited
  `protected memoryStore()` (→ the store's own `#memory`), so `storage.ts` /
  `ttl-storage.ts` import neither the registry nor `MemoryKeyVal` — only the
  base class.
- **No cross-phase `migrationIdbHandle` field.** `copyToMemory()` opens a local
  `IdbKeyVal`, reads every row into the store's own `#memory`, and closes that
  handle in a `finally`. `commitToMemory()` closes only `this.initializedStore`
  and swaps in `#memory`. A copy-phase throw leaves the store fully on `DISK`.
- `isRemembered()` reads **raw `localStorage.getItem("anchor")`** (not the
  facade) — it needs the durable signal, which is deliberately absent in
  `MEMORY`. It keeps its own `try/catch` ("on any read failure, show the modal").
- **No `purgeAllClientStorage()` composite.** Logout needs
  `idbService.deleteAll()` + the three `localStorage.removeItem` calls it
  already makes; the hard reload handles memory and mode.
- **Circular-import guard:** `service/idb-service.ts` imports `IdbStore`
  **type-only** from `../idb-store` (erased at compile); `idb-store.ts` imports
  the `idbService` value; `storage.ts` / `ttl-storage.ts` import the base
  class, not the service.

### Storage backing selection (`Storage._db` / `TtlStorage._db`)

Lazy on first access, cached in the instance (`initializedStore`):

| Mode     | Backing                                                                     |
| -------- | --------------------------------------------------------------------------- |
| `DISK`   | `IdbKeyVal` (as today)                                                      |
| `MEMORY` | the store's own `#memory` `MemoryKeyVal`                                    |
| fallback | the **same** `#memory` `MemoryKeyVal` when `IdbKeyVal` throws (IDB blocked) |

`MEMORY` and the IDB-failure fallback resolve to the same instance, so
there is one code path. The commit phase swaps each instance's backing and closes
its IndexedDB connection so the subsequent `deleteAll()` is not `blocked`;
`rebindAllToDisk()` reverses the swap.

## Conventions for the implementation

Applies to every new / changed file.

- **Comments.** Strip narrative / explanatory block comments from new files.
  Keep: (a) contract / `@throws`-style doc comments on **exported** members,
  (b) `Given` / `When` / `Then` BDD comments in specs, (c) **every** pre-existing
  comment in a changed file. No "step 1 / step 2" running commentary beyond a
  single line where a non-obvious ordering needs it.
- **Log messages carry no module-name prefix** — `"idb wipe on logout failed"`,
  not `"remember-me: …"`. Pass `error` as the second arg.
- **No homeless functions.** Every value this feature adds in the client-db
  storage folder is a `class` or a singleton instance of one — no module-level
  free functions, no bare mutable `let` / `const`. `StorageMode` is
  the only non-class export. In `@nfid/integration`, `RAW_KEYS_TO_MOVE` lives in
  `remember-me/constants.ts`; `rememberMeService` stays an object literal
  (matching the sibling services).
- **Spec files match production files 1:1** — `<name>.ts` ↔ `<name>.spec.ts`. No
  `.flow.spec.ts`. The two-phase migration and `deleteAll()` are covered in
  `service/idb-service.spec.ts`; the raw-key relocation in
  `remember-me-local-storage.spec.ts` (`moveToMemory`); the end-to-end
  orchestration + rollback in `remember-me.service.spec.ts`.
- **`remember-me.service.ts` carries no comments** — not even the interface
  contract JSDoc. The `doNotRememberMe()` DISK→MEMORY contract lives only in
  this spec (the `RememberMeService` block above). This is the one file exempt
  from "keep contract doc comments on exported members".
- **Spec file structure order:** `1.` mocks / `jest.mock` / fixtures, `2.`
  `describe` + tests, `3.` supporting helpers. DOM-touching client-db /
  integration specs keep `/** @jest-environment jsdom */` as the first line.
- **Test isolation** via each class's `reset()` / `clear()` in `beforeEach` — not
  `jest.resetModules()` + `await import()`.
- **No behaviour change** in the refactor: `doNotRememberMe()` atomicity,
  rollback, error messages and the `isRemembered()` contract are exactly as
  approved on 2026-09-08. Revision 5 relocates the raw-key loop into
  `rememberMeLocalStorage.moveToMemory()` and runs it before
  `storageModeState.set(MEMORY)` (previously after) — the observable result
  (keys in `#memory`, gone from `localStorage`, mode `MEMORY`) is unchanged;
  `moveToMemory` writes `#memory` directly so it no longer depends on the mode.

## Edge Cases

- **Existing signed-in user on deploy** — mode defaults `DISK`, `anchor` already
  in `localStorage`, `isRemembered()` is `true`, modal never shows. No forced
  logout.
- **Pick "remember me"** — no service call; the auth flow's own `anchor` write
  makes the next reload skip the modal.
- **Pick "don't remember me"** — `doNotRememberMe()` copies IndexedDB into memory,
  rebinds, deletes the dbs, then moves `anchor` into memory. Session works until
  reload / tab close, then logged out and re-prompted. A `MEMORY`-session reload
  _is_ a logout — no "already answered" marker needed.
- **Copy phase fails** — every store still bound `DISK`, IndexedDB intact, no key
  removed, mode `DISK`. Rejects `RememberMeError("Unable to switch to in-memory
storage")`. The populated `MemoryKeyVal`s are inert while `DISK` and discarded
  on the next hard reload.
- **Migration succeeds, `deleteAll()` fails** — mode not flipped, raw keys not
  removed; `rebindAllToDisk()` runs. Net: fully `DISK`. Rejects
  `RememberMeError("Unable to clear on-disk storage")`. Recovery is sign-out +
  sign-in (the hard logout re-runs the delete best-effort).
- **Two tabs, one opts out** — the other tab's open connections can keep
  `deleteAll()` `blocked` past its timeout → `doNotRememberMe()` rejects, mode
  stays `DISK`. Close the other tabs, sign out + in. Cross-tab sync is out of
  scope.
- **`doNotRememberMe()` while already `MEMORY`** — idempotent no-op.
- **`localStorage` throws entirely** — `isRemembered()` returns `false` → modal
  shown every load; the auth flow's own `anchor` write is what fails on a
  locked-down browser. Known limitation.
- **IndexedDB blocked (private mode)** — proxy falls back to the cached
  `MemoryKeyVal`; data won't survive reload. Documented, not fixed.
- **`ttlCacheService`** wraps `storageWithTtl` (a registered `TtlStorage`) —
  covered transitively.
- **`MemoryKeyVal` fallback bug (pre-existing)** — `Storage._db`'s catch path
  built a fresh empty map each call. Fixed by routing every backing through the
  store's own cached `#memory`.
- **Non-registered IndexedDB databases** — `deleteAll()` only touches the
  registered `Storage` / `TtlStorage` databases whose `persistenceType`
  includes `StorageMode.MEMORY` (`getDbNames()` remains unfiltered — it's
  `deleteAll()` and `migrateAllToMemory()` that filter). Anything else on the
  origin — including a stray `auth-client-db` from `@dfinity/auth-client` default
  storage, which the NFID path never creates — is left alone; there is no general
  `indexedDB.databases()` origin sweep. Any store that must be wiped on logout has
  to be a registered `Storage` / `TtlStorage` with the default persistence type.
  **Revision 7 exception:** 3 specific unregistered db names
  (`WALLET_CONNECT_V2_INDEXED_DB`, `icp-sdk-ic0.app`, `icp-sdk-icp-api.io`) are
  wiped anyway, but only via the separate `deleteExternalDbs()` call from hard
  logout — this is a hardcoded, named exception, not a reversal of "no origin
  sweep."
- **`wallets` db never deleted** — `walletStorage`'s `persistenceType`
  returns `[StorageMode.DISK]` only, so `deleteAll()` skips it on both hard
  logout and `doNotRememberMe()`, and `migrateAllToMemory()` never copies/rebinds
  it — it stays on disk, readable, even during a `MEMORY`-mode session. Signing
  out (any `hard` value) and back in with a different anchor/account therefore
  does **not** clear stale wallet rows for the previous account from this db;
  whatever currently reads `walletStorage` must already key its rows so a
  different anchor/account doesn't collide with or leak another's data (this spec
  does not audit that — flag it in the plan if it needs checking).
- **Soft logout (`hard === false`) touches no IndexedDB at all** — confirmed,
  unchanged by this revision: idle timeout, account switching, 3rd-party
  disconnect, and the `identitykit` coordinator all call `logout(false)` /
  `reset(false)`, none of which reach `idbService.deleteAll()` or
  `deleteExternalDbs()` (`_clearAuthSessionFromCache` gates both behind
  `if (hard)`). `wallets` and the 3 external dbs were already untouched here
  before this revision, same as every other registered db.
- **`deleteExternalDbs()` failure** — unlike `deleteAll()`, never rejects: each
  of the 3 deletes is individually caught and `console.error`-logged inside
  `deleteExternalDbs()` itself, so a single external-db failure never affects
  the other two and never propagates to `_clearAuthSessionFromCache`'s
  try/catch (that catch still exists for `deleteAll()`, unchanged).
- **`anchor` write path** — `KEY_ANCHOR` is written in exactly one place
  (`authState.set(...)`, unconditional), which every sign-in funnels through, so
  `isRemembered()` is reliable. No auth-machine changes.

## Out of Scope

- The modal UI (copy, layout, toggle, error banner) — built separately.
- Any server-side session validation / refresh / revocation; "sign out
  everywhere".
- The embed / iframe / 3rd-party surface.
- A `MEMORY → DISK` in-session migration; a "remember me" service method.
- Cross-tab synchronisation of the mode.
- A `sessionStorage` tier (IndexedDB payloads can exceed its ~5 MB quota).
- A dedicated flag key (`anchor` presence is the signal).
- A `purgeAllClientStorage()` composite.
- Migrating / clearing `walletTheme` and banner-carousel preference keys.
- Telemetry, i18n, `nfid-wallet` app wiring.

## Open Questions — all resolved

Default mode `DISK` (no bootstrap resolver); no embed code needed; raw-key list =
`anchor` + BTC + ETH + `emailIntervalId` through `rememberMeLocalStorage`
(`walletTheme` / banner-\* left as preferences); no re-prompt marker;
`doNotRememberMe()` is genuinely atomic (two-phase copy→commit, `rebindAllToDisk`
rollback, raw keys in the final commit); two methods
(`isRemembered()` / `doNotRememberMe()`); `deleteAll()` deletes the 7 registered
databases only — no defensive `auth-client-db`, no `indexedDB.databases()`
sweep; no `apps/nfid-wallet` in this repo.
