# Plan: Remember Me (integration layer)

> Status: COMPLETE — 2026-09-09 (revisions 1–5 all done; manual dev-server smoke
> deferred to the engineer). **The `# Revision 5` section at the end is the
> current layout and naming.**
> Spec: .claude/specs/remember-me.spec.md

Built in passes: **revision 1** — the feature (module-level `let` + free
functions). **revision 2** — refactor to focused singleton classes.
**revision 3** — naming / `enum·state·service·store·keyval` subfolders, cache
folded into `StorageRegistry`, `RememberMeStore`→`IdbStore`,
`rememberMeKeyVal`→`rememberMeLocalStorage`. **revision 4** — `StorageMode`
rename, per-store `#memory` (off the registry), `deleteAll()` drops the
`indexedDB.databases()` origin sweep (registered set + defensive `auth-client-db`
stay), `store/` folder flattened, `ttl-cache-service.ts` → `service/`.
Revisions 2–3 were pure refactor; revision 4 is structure/naming plus one
deliberate scope cut (the origin sweep). **The "## Revision 4" section at
the end is the current target layout and naming**; the "## Revision 3" section
and the tables in this upper half are kept for history.

## Codebase analysis

- **7 `Storage` / `TtlStorage` instances = 7 registered IndexedDB databases.**
  Each is a module-level singleton built with `{ dbName, storeName }`.
  Self-registration in the `RememberMeStore` constructor covers every store with
  zero per-site changes.

  | instance               | dbName           | storeName                 | file                                                                       |
  | ---------------------- | ---------------- | ------------------------- | -------------------------------------------------------------------------- |
  | `authStorage`          | `authstate`      | `ic-keyval`               | `packages/integration/src/lib/authentication/storage.ts`                   |
  | `walletStorage`        | `wallets`        | `wallets-store`           | `packages/integration/src/lib/authentication/storage.ts`                   |
  | `profileStorage`       | `profile-db`     | `profile-store`           | `packages/integration/src/lib/identity-manager/profile/storage.ts`         |
  | `icExplorerTtlStorage` | `ic-explorer-db` | `ic-explorer-ttl-storage` | `packages/integration/src/lib/cache/ic-explorer-address-item-cache-idb.ts` |
  | `domainKeyStorage`     | `domainkey-db`   | `domainkey-store`         | `packages/integration/src/lib/lambda/domain-key-storage.ts`                |
  | `storageWithTtl`       | `ttl-db`         | `ttl-store`               | `packages/client-db/src/lib/storage/ttl-storage.ts`                        |
  | `notesStorage`         | `notes-db`       | `notes-store`             | `apps/nfid-frontend/src/integration/note/note-service.ts`                  |

- **7 registered (atomic set) + 1 defensive (`auth-client-db`) = 8 attempted.**
  `auth-client-db` is never written on the normal NFID path — deleted log-only,
  never a rejection cause. Plus an `indexedDB.databases()` sweep where supported.
- `KEY_ANCHOR` is written in exactly one place — `authState.set(...)`,
  unconditional — which every sign-in funnels through. `isRemembered()` is
  reliable; no auth-machine changes. (OQ10.)
- No `apps/nfid-wallet` in this repo. (OQ6.)
- `_clearAuthSessionFromCache(hard)` previously cleared only `storageWithTtl` /
  `domainKeyStorage` / `authStorage`; swapping in `idbDatabaseCleaner.deleteAll()`
  also wipes `wallets` / `profile-db` / `notes-db` / `ic-explorer-db` — an
  intended security improvement, call out at review.
- `IdbKeyVal` gained `close()` (revision 1) so migration can drop the connection
  before `deleteDB` (avoids `blocked`).
- `MemoryKeyVal.create()` builds a fresh `Map` each call; the `_db` catch paths
  called it without caching — the `MemoryKeyValCache` fix.
- nx projects: `client-db`, `integration`, `nfid-wallet-client` (frontend app).
  Single-file test: `yarn nx test <project> <file.spec.ts>`.

## Final file layout

### `packages/client-db/src/lib/storage/` — new (each with a matching `*.spec.ts` unless noted)

| File                              | Purpose                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `storage-persistence-mode.ts`     | `enum StoragePersistenceMode { DISK, MEMORY }` + doc comment. Only non-class export. No spec.                                                                                                                                                                                                                                                                                                                    |
| `storage-mode-state.ts`           | `class StorageModeState` (private `#mode = DISK`) — `get()` / `set(mode)` / `reset()`; `storageModeState` singleton                                                                                                                                                                                                                                                                                              |
| `memory-keyval-cache.ts`          | `class MemoryKeyValCache` (private `#cache: Map<string, MemoryKeyVal>`) — `get(cacheKey)` create-and-cache / `clear()`; `memoryKeyValCache` singleton                                                                                                                                                                                                                                                            |
| `storage-persistence-registry.ts` | `class StoragePersistenceRegistry` — `register` / `getDbNames` / `migrateAllToMemory` (two-phase) / `rebindAllToDisk` / `clear`; `import type { MigratableStore }` from `./remember-me-store`; `storagePersistenceRegistry` singleton                                                                                                                                                                            |
| `idb-database-cleaner.ts`         | `class IdbDatabaseCleaner(registry)` — `deleteAll()`; `#deleteSingleDb` + 3000 ms timeout private; `idbDatabaseCleaner = new IdbDatabaseCleaner(storagePersistenceRegistry)`                                                                                                                                                                                                                                     |
| `remember-me-store.ts`            | `MigratableStore` interface + `abstract class RememberMeStore implements MigratableStore` — `protected options` / `initializedStore` / `get storeKey()`, constructor self-register, shared `copyToMemory` (local `IdbKeyVal` + `finally` close, **no `migrationIdbHandle`**) / `commitToMemory` (close `initializedStore` only, swap in cached `MemoryKeyVal`) / `rebindToDisk` (`initializedStore = undefined`) |
| `remember-me-keyval.ts`           | `class RememberMeKeyVal` (private `#memoryBacking: Map<string, string>`) — `getItem` / `setItem` / `removeItem` (both backings) / `clear()`; routes on `storageModeState.get()`; **no `window` guard**; `rememberMeKeyVal` singleton. Spec has the jsdom docblock.                                                                                                                                               |

### `packages/client-db/src/lib/storage/` — modified

| File               | Change                                                                                                                                                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `idb-keyval.ts`    | `close(): void` → `this._db.close()`                                                                                                                                                                                                                  |
| `types.ts`         | `close?(): void` added to `KeyValueStore` (optional)                                                                                                                                                                                                  |
| `storage.ts`       | `class Storage<T> extends RememberMeStore`; `super(options)`. Keeps only its own `_db` probe (using `storageModeState.get()` + `memoryKeyValCache.get(this.storeKey)` in the MEMORY branch and the `IdbKeyVal.create` catch) and its value accessors. |
| `ttl-storage.ts`   | `class TtlStorage<T> extends RememberMeStore`; same treatment, preserving its own no-`await` `_db` warm-up quirk and `get` / `getEvenExpired` / `set(key, value, ttlMillis)` / `remove` / `clear` + the `storageWithTtl` export                       |
| `index.ts`         | export the seven new modules                                                                                                                                                                                                                          |
| `memory-keyval.ts` | no change (verified: no `window` guard, no self-caching)                                                                                                                                                                                              |

### `packages/integration/src/lib/`

| File                                               | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `remember-me/remember-me.service.ts` (new)         | `rememberMeService` object literal + `RememberMeService` interface + `export * from "./error/remember-me.error"`. Imports `StoragePersistenceMode` / `storageModeState` / `storagePersistenceRegistry` / `idbDatabaseCleaner` / `rememberMeKeyVal` from `@nfid/client-db`, `RAW_KEYS_TO_MOVE` from `./constants/raw-keys.constant`. Ordering & error messages per the spec Contract.                                                                             |
| `remember-me/remember-me.service.spec.ts` (new)    | jsdom docblock. Drives the real service + real `@nfid/client-db` + `fake-indexeddb`; mocks only `idb`'s `deleteDB`. `isRemembered` (3) + `doNotRememberMe` full flow (5: happy, idempotent no-op, copy-fail stays DISK, delete-fail rolls back, no in-session retry). `beforeEach` = `IDBFactory` reset + `localStorage.clear()` + `storageModeState.reset()` + `storagePersistenceRegistry.clear()` + `memoryKeyValCache.clear()` + `rememberMeKeyVal.clear()`. |
| `remember-me/error/remember-me.error.ts` (new)     | `RememberMeError extends Error` (default `"Remember-me operation failed"`)                                                                                                                                                                                                                                                                                                                                                                                       |
| `remember-me/constants/raw-keys.constant.ts` (new) | `export const RAW_KEYS_TO_MOVE = [KEY_ANCHOR, KEY_ETH_ADDRESS, KEY_BTC_ADDRESS]`                                                                                                                                                                                                                                                                                                                                                                                 |
| `authentication/auth-state.ts` (modified)          | `import { idbDatabaseCleaner, rememberMeKeyVal } from "@nfid/client-db"`. In `_clearAuthSessionFromCache(hard)`: the three `.clear()` calls → `try { await idbDatabaseCleaner.deleteAll() } catch (error) { console.error("idb wipe on logout failed", error) }`; keep the `hard` gate + three `removeItem` calls. `set(...)`: `localStorage.setItem(KEY_ANCHOR, …)` → `rememberMeKeyVal.setItem(...)`.                                                          |
| `authentication/auth-state.logout.spec.ts` (new)   | jsdom docblock. Hard clear wipes all 7 registered dbs + raw keys; logout still completes when the wipe throws. Resets `storageModeState` / `memoryKeyValCache` / `rememberMeKeyVal` but **not** the registry (relies on the stores `auth-state` registered at module load).                                                                                                                                                                                      |
| `../index.ts` (modified)                           | `export * from "./lib/remember-me/remember-me.service"`                                                                                                                                                                                                                                                                                                                                                                                                          |

### `apps/nfid-frontend/src/` — `persistenceAwareKeyVal` → `rememberMeKeyVal`

| File                                                            | Sites                                                                                                                                                                       |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `integration/identity-manager/index.ts`                         | `anchor` read                                                                                                                                                               |
| `integration/bitcoin/bitcoin.service.ts`                        | BTC address write + read                                                                                                                                                    |
| `integration/ethereum/evm.service.ts`                           | ETH address write + read                                                                                                                                                    |
| `features/authentication/auth-selection/email-flow/services.ts` | `emailIntervalId` write + read                                                                                                                                              |
| `features/security/index.tsx`                                   | throwaway `RememberMeDevPanel` **kept**, repointed to `storageModeState.get()` + `StoragePersistenceMode` from `@nfid/client-db`; header still flags "remove before commit" |

### Deleted / renamed

- Deleted: `persistence-mode.ts`, `persistence-aware-key-val.ts`,
  `storage-persistence-mode.flow.spec.ts`,
  `persistence-aware-key-val.flow.spec.ts`,
  `packages/integration/src/lib/remember-me/enum/` (folder — pointless
  `@nfid/client-db` pass-through).
- `git mv` then rewrite: `remember-me.flow.spec.ts` →
  `remember-me.service.spec.ts`; `auth-state.logout.flow.spec.ts` →
  `auth-state.logout.spec.ts`.

## Types / XState / Atoms

- `StoragePersistenceMode` enum + `MigratableStore` interface (in
  `remember-me-store.ts`, imported type-only by the registry). `RememberMeService`
  / `RememberMeError`.
- No machine, no guard, no service, no Jotai atom, no context. Global state =
  four `@nfid/client-db` singleton class instances (`storageModeState`,
  `memoryKeyValCache`, `storagePersistenceRegistry`, `idbDatabaseCleaner`) + the
  `rememberMeKeyVal` facade — each a module-level `new X()`.

## Implementation Checklist — DONE

<!-- Executed via /execute-ui-plan. All boxes done except the manual smoke. -->

- [x] `IdbKeyVal.close()` + optional `KeyValueStore.close?()`
- [x] `storage-persistence-mode.ts` (enum) + `storage-mode-state.ts` (+spec)
- [x] `memory-keyval-cache.ts` (+spec)
- [x] `remember-me-store.ts` — `MigratableStore` + `RememberMeStore` base, verbatim
      two-phase copy→commit, local `IdbKeyVal` + `finally` close (no
      `migrationIdbHandle`) (+spec with a `Fake` subclass)
- [x] `storage-persistence-registry.ts` — `register` / `getDbNames` /
      `migrateAllToMemory` / `rebindAllToDisk` / `clear` (+spec covering two-phase
      atomicity + rebind)
- [x] `idb-database-cleaner.ts` — `deleteAll()`, private `#deleteSingleDb` +
      timeout, reject on a registered db, tolerate defensive failures (+spec)
- [x] `remember-me-keyval.ts` — `RememberMeKeyVal` class, `#memoryBacking`, no
      `window` guard (+jsdom spec: DISK/MEMORY routing, `removeItem`, `clear()`)
- [x] Delete the 4 old files; `index.ts` exports the 7 new modules
- [x] `storage.ts` / `ttl-storage.ts` `extend RememberMeStore` — `super(options)`,
      delete the moved members, `_db` uses `storageModeState.get()` +
      `memoryKeyValCache.get(this.storeKey)`, keep every accessor + probe quirk
- [x] `constants/raw-keys.constant.ts`; `git rm -r` the `enum/` folder
- [x] `remember-me.service.ts` — singletons in, `RAW_KEYS_TO_MOVE` imported, `enum/`
      re-export dropped, log prefixes stripped; ordering / messages unchanged
- [x] `git mv` + rewrite both spec files with `reset()`/`clear()` isolation; every
      revision-1 assertion kept
- [x] `auth-state.ts` — `idbDatabaseCleaner.deleteAll()` + `rememberMeKeyVal`, log
      `"idb wipe on logout failed"`
- [x] 4 frontend call sites → `rememberMeKeyVal`
- [x] `security/index.tsx` dev panel repointed to the new API
- [ ] **Manual smoke (dev server)** — for the engineer. `yarn nx serve
    nfid-frontend`, sign in → `anchor` + IDBs present; call
      `rememberMeService.doNotRememberMe()` via the dev panel → IDBs gone, `anchor`
      gone, app still works; reload → logged out, `isRemembered() === false`.

## Verification results

- `yarn nx lint client-db` — 0 errors, 17 warnings (= baseline; none in the new
  class files). `yarn nx lint integration` / `nfid-wallet-client` — 0 errors.
- `yarn nx test client-db` — 7 suites / 25 tests green.
- `yarn nx test integration remember-me.service.spec.ts` (8/8),
  `auth-state.logout.spec.ts` (2/2). Full `integration` — 25 passed; only the 2
  documented pre-existing unrelated suite failures
  (`verification-email/verification.service` ordering flake; `lambda/passkey`
  `@icp-sdk/core` actor network).
- `yarn nx test nfid-wallet-client` (bitcoin / identity-manager / ethereum /
  email-flow / identity) — green; only the pre-existing
  `wallet/hooks/use-transfer.spec.tsx` (`@noble/curves` fixture) fails.
- `tsc --noEmit -p apps/nfid-frontend/tsconfig.json` — only the pre-existing
  `TS2688 uuid` stub error.
- Repo-wide grep for every old symbol (`persistenceAwareKeyVal`,
  `getStoragePersistenceMode`, `migrateAllStoresToMemory`,
  `deleteAllIdbDatabases`, `.flow.spec`, `remember-me/enum`, …) → zero hits.

## Risks & Notes

- **`walletStorage` / `profileStorage` / `notesStorage` / `icExplorerTtlStorage`
  are now wiped on hard logout** (they were not) — deliberate improvement beyond
  strict "remember me"; call out at review.
- **`indexedDB.databases()` sweep on logout deletes any IDB db on the origin** —
  accepted (nfid-frontend owns its origin); kept best-effort so a stray locked db
  cannot break logout.
- **Migration is genuinely all-or-nothing** — copy phase (touches only cached
  `MemoryKeyVal`s) then commit phase (close + rebind) only when every copy
  succeeded; a later `deleteAll()` failure triggers `rebindAllToDisk()`; raw keys
  moved + mode flipped only in the non-failable final commit. Any failure → fully
  `DISK`; success → fully `MEMORY`. No in-session retry.
- **`deleteDatabase` blocked** — mitigated by the commit phase `close()`ing each
  handle; a second tab can still block → reject → rollback.
- **Circular import** — registry's `MigratableStore` import stays `type`-only; the
  base class imports the registry value; `storage.ts` / `ttl-storage.ts` import
  the base class.
- **`rememberMeKeyVal` is synchronous** (`getItem` returns `string | null`) —
  call sites are sync. Its `#memoryBacking` is a plain `Map<string, string>`,
  separate from the `Storage` memory cache (only 4 raw string keys).
- **Reset all four singletons together** in a shared `beforeEach` for cross-file
  specs, or a stale cached `MemoryKeyVal` leaks between tests
  (`auth-state.logout.spec.ts` is the exception — see its table row).
- **Dev panel (`features/security/index.tsx`)** is throwaway scaffolding — flag at
  review whether it ships.
- **Keep `RememberMeError` messages stable** (`"Unable to switch to in-memory
storage"`, `"Unable to clear on-disk storage"`) — the modal may match on them.
- `console.*` log-string changes are intentional and asserted nowhere.

---

# Revision 3

> Status: COMPLETE — 2026-09-09 (manual dev-server smoke deferred to the engineer, as in revisions 1–2)
> Scope: **naming / file-structure only — zero behaviour change.** No test
> assertion changes value; specs move and swap symbol names, nothing more. If a
> test needs a _logic_ change to pass, stop — the refactor altered behaviour.

## Renames

| From                                                        | To                                                                  |
| ----------------------------------------------------------- | ------------------------------------------------------------------- |
| `RememberMeKeyVal` / `rememberMeKeyVal`                     | `RememberMeLocalStorage` / `rememberMeLocalStorage`                 |
| `#memoryBacking` (in that class)                            | `#memory`                                                           |
| `StoragePersistenceRegistry` / `storagePersistenceRegistry` | `StorageRegistry` / `storageRegistry`                               |
| `RememberMeStore` / `RememberMeStoreOptions`                | `IdbStore` / `IdbStoreOptions`                                      |
| `MemoryKeyValCache` / `memoryKeyValCache`                   | _deleted_ — folded into `StorageRegistry`                           |
| `MigratableStore` interface                                 | _deleted_ — registry types entries as `IdbStore` (type-only import) |

## Moves (`git mv`, then fix relative imports inside each file)

`packages/client-db/src/lib/storage/`:

| From                                            | To                                                  |
| ----------------------------------------------- | --------------------------------------------------- |
| `storage-persistence-mode.ts`                   | `enum/storage-persistence-mode.ts`                  |
| `storage-mode-state.ts` (+`.spec.ts`)           | `state/storage-mode-state.ts` (+`.spec.ts`)         |
| `storage-persistence-registry.ts` (+`.spec.ts`) | `service/storage-registry.ts` (+`.spec.ts`)         |
| `idb-database-cleaner.ts` (+`.spec.ts`)         | `service/idb-database-cleaner.ts` (+`.spec.ts`)     |
| `remember-me-store.ts` (+`.spec.ts`)            | `store/idb-store.ts` (+`.spec.ts`)                  |
| `storage.ts`                                    | `store/storage.ts`                                  |
| `ttl-storage.ts`                                | `store/ttl-storage.ts`                              |
| `idb-keyval.ts` (+`idb-keyval.test.ts`)         | `keyval/idb-keyval.ts` (+`.test.ts`)                |
| `memory-keyval.ts`                              | `keyval/memory-keyval.ts`                           |
| `remember-me-keyval.ts` (+`.spec.ts`)           | `keyval/remember-me-local-storage.ts` (+`.spec.ts`) |

Stay at root: `types.ts`, `ttl-cache-service.ts`, `index.ts`.
Deleted: `memory-keyval-cache.ts` (+`.spec.ts`).

`packages/integration/src/lib/`:

| From                                         | To                                                       |
| -------------------------------------------- | -------------------------------------------------------- |
| `remember-me/constants/raw-keys.constant.ts` | `remember-me/constants.ts` (remove the `constants/` dir) |
| `authentication/auth-state.logout.spec.ts`   | `authentication/auth-state.spec.ts`                      |

## Implementation Checklist (revision 3)

<!-- Execute EXACTLY ONE checkbox at a time using /execute-ui-plan -->

### client-db — subfolders + renames

- [x] `git mv storage-persistence-mode.ts enum/`. Fix its `index.ts` export path.
- [x] `git mv` the state / service / store / keyval files into their subfolders
      (list above), one `git mv` per pair. Do **not** edit contents yet.
- [x] Delete `memory-keyval-cache.ts` + `.spec.ts`.
- [x] `service/storage-registry.ts` — rename `StoragePersistenceRegistry` →
      `StorageRegistry`, singleton → `storageRegistry`. Absorb the cache: add
      `#memory = new Map<string, MemoryKeyVal>()`, `memoryFor(storeKey): MemoryKeyVal`
      (create-and-cache, `MemoryKeyVal.create()` on miss), `clearMemory()`; make
      `clear()` also `this.#memory.clear()`. Type entries as `IdbStore` via
      `import type { IdbStore } from "../store/idb-store"`; drop `MigratableStore`.
      Import `MemoryKeyVal` from `../keyval/memory-keyval`.
- [x] `store/idb-store.ts` — rename `RememberMeStore` → `IdbStore`,
      `RememberMeStoreOptions` → `IdbStoreOptions`; drop `implements MigratableStore`
      and the `MigratableStore` interface (moved to nowhere — deleted). Replace
      `memoryKeyValCache.get(this.storeKey)` (3 sites) with
      `storageRegistry.memoryFor(this.storeKey)`. Add
      `protected memoryStore(): MemoryKeyVal { return storageRegistry.memoryFor(this.storeKey) }`.
      Fix imports (`../keyval/idb-keyval`, `../service/storage-registry`, `../types`).
- [x] `store/storage.ts` + `store/ttl-storage.ts` — `extends IdbStore`; in `_db`
      replace `memoryKeyValCache.get(this.storeKey)` with `this.memoryStore()`;
      drop the `memory-keyval-cache` import; fix the remaining relative imports
      for the new depth. No logic change.
- [x] `keyval/remember-me-local-storage.ts` — rename class →
      `RememberMeLocalStorage`, singleton → `rememberMeLocalStorage`, `#memoryBacking`
      → `#memory`; fix imports (`../state/...`, `../enum/...`). Update the class
      doc comment's `#memoryBacking` mention.
- [x] `ttl-cache-service.ts` — fix `./ttl-storage` → `./store/ttl-storage`.
- [x] `index.ts` — rewrite every export line to the new subfolder paths (registry
      before cleaner; enum + state + keyval before store).
- [x] Rename the moved spec files' symbols to match; each spec's `beforeEach`
      swaps `memoryKeyValCache.clear()` → `storageRegistry.clearMemory()` (or
      `.clear()` where it also cleared the registry). Fold the 3
      `memory-keyval-cache.spec.ts` cases into `service/storage-registry.spec.ts`.

### integration — renames

- [x] `git mv remember-me/constants/raw-keys.constant.ts remember-me/constants.ts`;
      `rmdir remember-me/constants`. Update the import in `remember-me.service.ts`
      (`./constants/raw-keys.constant` → `./constants`).
- [x] `git mv authentication/auth-state.logout.spec.ts authentication/auth-state.spec.ts`.
- [x] `remember-me.service.ts` — `storagePersistenceRegistry` → `storageRegistry`,
      `rememberMeKeyVal` → `rememberMeLocalStorage`. **Strip every comment**,
      including the `RememberMeService` interface JSDoc and the `// Flip the mode`
      line. No behaviour change.
- [x] `remember-me.service.spec.ts` + `auth-state.spec.ts` — swap symbol names
      (`storagePersistenceRegistry` → `storageRegistry`, `rememberMeKeyVal` →
      `rememberMeLocalStorage`, `memoryKeyValCache.clear()` →
      `storageRegistry.clearMemory()`). `auth-state.spec.ts` still does **not**
      `clear()` the registry (keeps the module-load registrations).

### frontend — `rememberMeKeyVal` → `rememberMeLocalStorage`

- [x] `apps/nfid-frontend/src/integration/identity-manager/index.ts`
- [x] `apps/nfid-frontend/src/integration/bitcoin/bitcoin.service.ts`
- [x] `apps/nfid-frontend/src/integration/ethereum/evm.service.ts`
- [x] `apps/nfid-frontend/src/features/authentication/auth-selection/email-flow/services.ts`
- [x] `apps/nfid-frontend/src/lib/authentication/auth-state.ts` (`packages/integration`) —
      `idbDatabaseCleaner` import unchanged; `rememberMeKeyVal` → `rememberMeLocalStorage`
- [x] `apps/nfid-frontend/src/features/security/index.tsx` — dev panel: swap any
      `storagePersistenceRegistry` / `rememberMeKeyVal` symbols if present; it
      already reads `storageModeState` (unchanged)

### Verification (revision 3) — results

- [x] `yarn nx lint client-db` — 0 errors, 17 warnings (= revision-2 baseline;
      all pre-existing `_db`-probe `no-floating-promises`). `yarn nx lint
    integration` — passed, 0 errors. `yarn nx lint nfid-wallet-client` —
      "Successfully ran target lint", 0 errors.
- [x] `yarn nx test client-db` — 6 suites / 25 tests green (revision 2 was 7
      suites / 25; `memory-keyval-cache.spec.ts` deleted, its 3 cases re-homed
      into `service/storage-registry.spec.ts`).
- [x] `yarn nx test integration remember-me.service.spec.ts` — 8/8;
      `auth-state.spec.ts` — 2/2. Full `integration` — 25 passed; the 2 failing
      suites (`verification-email/verification.service`, `lambda/passkey`) both
      pass in isolation — the documented pre-existing parallel-run flakes, not
      touched by this refactor.
- [x] `yarn nx test nfid-wallet-client` (touched areas) — `bitcoin.service.spec`,
      `identity-manager/index.spec`, `ethereum/bridge.service.spec`,
      `email-flow/machine.spec` all green. Only `wallet/hooks/use-transfer.spec.tsx`
      fails — the pre-existing `@noble/curves` fixture failure at
      `use-transfer.ts:147`, unrelated.
- [x] `tsc --noEmit -p apps/nfid-frontend/tsconfig.json` — only the pre-existing
      `TS2688 uuid`. `tsc -p packages/client-db/tsconfig.lib.json` — clean.
- [x] `grep` repo-wide (`packages/` + `apps/`, excl. node_modules) for every old
      symbol / path (`rememberMeKeyVal`, `storagePersistenceRegistry`,
      `memoryKeyValCache`, `MemoryKeyValCache`, `RememberMeStore`,
      `MigratableStore`, `remember-me-store`, `remember-me-keyval`,
      `storage-persistence-registry`, `memory-keyval-cache`, `raw-keys.constant`,
      `auth-state.logout`) → **0 hits**.
- [ ] Manual smoke (dev server) — unchanged from revisions 1–2; **for the
      engineer** via the Remember Me dev panel on the Security page.

## Risks & Notes (revision 3)

- **Pure rename/move.** The circular-import guard holds under the new names:
  `service/storage-registry.ts` imports `IdbStore` **type-only**; `idb-store.ts`
  imports the `storageRegistry` value; `store/storage.ts` / `store/ttl-storage.ts`
  reach memory only through the inherited `protected memoryStore()`.
- **`clear()` vs `clearMemory()`** — folding the cache into the registry means a
  plain `clear()` now also drops the memory map. Specs that need the module-load
  registrations kept (`auth-state.spec.ts`) call `clearMemory()`.
- **`git mv` before any content edit** so history follows each file.
- Every `@nfid/*` consumer imports from the package barrel, so only symbol names
  change outside `packages/client-db/src/lib/storage/` — no import-path edits in
  `apps/` or the rest of `packages/integration`.
- The `remember-me.service.ts` comment strip is a spec-convention exception,
  recorded in the spec's "Conventions" section.
- **During execution an on-disk formatter/editor reordered
  `remember-me.service.ts`** so the raw-key loop ran before
  `storageModeState.set(MEMORY)`. That reverses the revision-1 ordering fix (the
  `setItem` would land in `localStorage` and the following `removeItem` would
  wipe it). Caught and restored to `set(MEMORY)` → loop before the specs ran;
  `remember-me.service.spec.ts` 8/8 confirms the order.

---

# Revision 4

> Status: COMPLETE — 2026-09-09 (manual dev-server smoke deferred to the engineer,
> as in revisions 1–3)
> Scope: **structure / naming + one deliberate behaviour cut.** Items 1–3, 5–7
> are pure rename / move (no assertion changes value). Item 4 (`deleteAll()`
> drops the origin sweep) is an intentional scope reduction — its spec Contract,
> Edge Cases and Open-Questions lines are updated to match.

## Behaviour change (item 4 only)

`IdbDatabaseCleaner.deleteAll()` drops the `indexedDB.databases()` origin sweep.
It still deletes the distinct registered `dbName`s (7), each raced against the
3000 ms timeout, rejecting if any registered db fails, **and** still attempts the
defensive `auth-client-db` delete (log-only, never a rejection cause). The only
loss is the belt-and-braces sweep of stray/legacy dbs on the origin; a future
store that must be wiped on logout has to be a registered `Storage` / `TtlStorage`.

## Renames

| From                                             | To                                                                                                                                           |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `StoragePersistenceMode` (enum + all refs)       | `StorageMode`                                                                                                                                |
| `enum/storage-persistence-mode.ts`               | `enum/storage-mode.ts`                                                                                                                       |
| `StorageRegistry#memory` + `memoryFor(storeKey)` | _removed_ — each `IdbStore` owns a private `#memory` `MemoryKeyVal` (`memoryStore()` → `this.#memory`; `clearMemory()` swaps in a fresh one) |
| `StorageRegistry.clear()` / `clearMemory()`      | kept — now loop the registered stores calling `store.clearMemory()` (no memory map of their own)                                             |

## Moves (`git mv`, then fix relative imports inside each file)

`packages/client-db/src/lib/storage/`:

| From                                                | To                                                                                |
| --------------------------------------------------- | --------------------------------------------------------------------------------- |
| `store/idb-store.ts` (+`.spec.ts`)                  | `idb-store.ts` (+`.spec.ts`)                                                      |
| `store/storage.ts`                                  | `storage.ts`                                                                      |
| `store/ttl-storage.ts`                              | `ttl-storage.ts`                                                                  |
| `keyval/remember-me-local-storage.ts` (+`.spec.ts`) | `remember-me-local-storage.ts` (+`.spec.ts`) — storage root, next to `storage.ts` |
| `keyval/idb-keyval.test.ts`                         | `keyval/idb-keyval.spec.ts`                                                       |
| `ttl-cache-service.ts`                              | `service/ttl-cache-service.ts`                                                    |
| `enum/storage-persistence-mode.ts`                  | `enum/storage-mode.ts`                                                            |

Remove the now-empty `store/` folder. `keyval/` keeps only `idb-keyval.ts`
(+`.spec.ts`) and `memory-keyval.ts`. Stay at root: `types.ts`, `index.ts`.

### Target layout

```
storage/
  enum/storage-mode.ts
  state/storage-mode-state.ts        (+spec)
  service/storage-registry.ts        (+spec)
  service/idb-database-cleaner.ts    (+spec)
  service/ttl-cache-service.ts
  keyval/idb-keyval.ts               (+spec)   ← was idb-keyval.test.ts
  keyval/memory-keyval.ts
  idb-store.ts                       (+spec)
  storage.ts
  ttl-storage.ts
  remember-me-local-storage.ts       (+spec)
  types.ts
  index.ts
```

## Implementation Checklist (revision 4)

<!-- Execute EXACTLY ONE checkbox at a time using /execute-ui-plan -->

### client-db — item 7 (StorageMode rename)

- [x] `git mv enum/storage-persistence-mode.ts enum/storage-mode.ts`; rename
      `enum StoragePersistenceMode` → `enum StorageMode` inside it.
- [x] Update every `StoragePersistenceMode` importer to `StorageMode` + the new
      path: `state/storage-mode-state.ts` (+spec), `service/storage-registry.spec.ts`,
      `keyval/remember-me-local-storage.ts` (+spec), `store/storage.ts`,
      `store/ttl-storage.ts`, `index.ts` export line.
- [x] `packages/integration` — `remember-me.service.ts` + `.spec.ts`:
      `StoragePersistenceMode` → `StorageMode` (barrel import, no path change).
- [x] `apps/nfid-frontend/src/features/security/index.tsx` — import + the two
      `StoragePersistenceMode.MEMORY` refs + the comment mention → `StorageMode`.

### client-db — item 1 (per-store `#memory`)

- [x] `store/idb-store.ts` — add `#memory: MemoryKeyVal = MemoryKeyVal.create()`
      (value import of `MemoryKeyVal`), `memoryStore()` returns `this.#memory`,
      add `clearMemory()` — swaps in a fresh `#memory` **and** unbinds
      `initializedStore` when it currently points at the old backing (so the next
      access re-resolves; needed for cross-file test isolation). Drop the
      `storageRegistry.memoryFor` call.
- [x] `service/storage-registry.ts` — delete `#memory` and `memoryFor()`; keep
      `clearMemory()` as `for (const entry of this.#registry.values()) entry.store.clearMemory()`;
      `clear()` = `this.clearMemory(); this.#registry.clear()`. Drop the
      `MemoryKeyVal` import (keep `import type { IdbStore }`).
- [x] `service/storage-registry.spec.ts` — replaced the 3 `memoryFor` cases with
      one `clearMemory()` case driven through two registered `Storage` instances
      in MEMORY mode; registry keeps its registry/migration cases.
- [x] `store/idb-store.spec.ts` — swapped `storageRegistry.memoryFor(store.key)`
      (3 sites) for a `FakeStore.memory` accessor over `memoryStore()`; added the
      3 ported memory cases (stable `memoryStore()`, distinct per store, fresh
      instance after `clearMemory()`).

### client-db — items 2, 3, 5, 6 (moves)

- [x] `git mv keyval/idb-keyval.test.ts keyval/idb-keyval.spec.ts` (no content change).
- [x] `git mv store/idb-store.ts idb-store.ts` (+`.spec.ts`), `store/storage.ts`
      `storage.ts`, `store/ttl-storage.ts` `ttl-storage.ts`,
      `keyval/remember-me-local-storage.ts` `remember-me-local-storage.ts` (+`.spec.ts`).
      `rmdir store/`.
- [x] `git mv ttl-cache-service.ts service/ttl-cache-service.ts`.
- [x] Fix relative imports for the new depths: root files `../` → `./`
      (`idb-store(.spec).ts`, `storage.ts`, `ttl-storage.ts`,
      `remember-me-local-storage(.spec).ts`); `service/storage-registry.ts`
      `../store/idb-store` → `../idb-store`; `service/storage-registry.spec.ts` + `service/idb-database-cleaner.spec.ts` `../store/storage` → `../storage`;
      `service/ttl-cache-service.ts` `./store/ttl-storage` → `../ttl-storage`.
- [x] `index.ts` — repointed every moved export: `./enum/storage-mode`,
      `./remember-me-local-storage`, `./service/ttl-cache-service`, `./idb-store`,
      `./storage`, `./ttl-storage`.

### client-db — item 4 (drop the origin sweep)

- [x] `service/idb-database-cleaner.ts` — `deleteAll()` keeps the registered-name
      `Promise.all` and the defensive `auth-client-db` `.catch`-logged delete;
      deleted the `typeof indexedDB.databases === "function"` sweep block.
      Class doc comment updated (sweep sentence dropped).
- [x] `service/idb-database-cleaner.spec.ts` — both existing cases kept; added
      "should leave an unregistered on-disk database untouched" (seeds a stray
      `openDB` and asserts it survives `deleteAll()` while the registered one goes).

### integration / frontend

- [x] `remember-me.service.spec.ts`, `auth-state.spec.ts` — `StorageMode` rename
      only; `storageRegistry.clear()` / `.clearMemory()` calls unchanged (same
      names, now delegating to the stores). `remember-me.service.spec.ts` 8/8,
      `auth-state.spec.ts` 2/2.

### Verification (revision 4) — results

- [x] `yarn nx lint` client-db / integration / nfid-wallet-client — all
      "Successfully ran target lint", 0 errors.
- [x] `yarn nx test client-db` — 6 suites green, 27 tests (revision 3 was 26; net
      +1: the 3 `memoryFor` cases became 3 `memoryStore`/`clearMemory` cases in
      `idb-store.spec.ts`, `storage-registry.spec.ts` lost 3 and gained 1
      `clearMemory` case, `idb-database-cleaner.spec.ts` gained the "unregistered
      db untouched" case).
- [x] `yarn nx test integration remember-me.service.spec.ts` — 8/8;
      `auth-state.spec.ts` — 2/2. Full `integration` — 25 suites / 102 tests pass;
      the 2 failing suites (`verification-email/verification.service`,
      `lambda/passkey`) are the documented pre-existing parallel-run flakes —
      both pass in isolation (12/12 and 2/2).
- [x] `tsc --noEmit -p apps/nfid-frontend/tsconfig.json` — only the pre-existing
      `TS2688 uuid`. `tsc -p packages/client-db/tsconfig.lib.json` — clean, EXIT 0.
      (No frontend spec is affected — only `security/index.tsx`, a `StorageMode`
      symbol rename, which the typecheck covers.)
- [x] `grep` repo-wide for `StoragePersistenceMode`, `storage-persistence-mode`,
      `memoryFor`, `store/idb-store`, `store/storage`, `store/ttl-storage`,
      `keyval/remember-me-local-storage`, `idb-keyval.test` → 0 hits.
      `auth-client-db` stays (one defensive delete in `idb-database-cleaner.ts` +
      its spec case); the two `indexedDB.databases()` hits are test assertions,
      not the removed sweep.
- [ ] Manual smoke (dev server) — unchanged from revisions 1–3; for the engineer.

## Risks & Notes (revision 4)

- **Item 4 is the only behaviour change.** The `deleteAll()` set shrinks from
  "registered + `auth-client-db` + every db on the origin" to "registered +
  `auth-client-db`" — the `indexedDB.databases()` sweep is dropped, the
  defensive `auth-client-db` delete stays. On the NFID path the registered 7 are
  the whole surface, so the observable logout / `doNotRememberMe()` result is
  identical; the loss is the belt-and-braces sweep of stray/legacy dbs. Flag at
  review.
- **`clearMemory()` now needs the registrations.** With the memory map gone from
  the registry, `storageRegistry.clearMemory()` iterates the registered stores.
  `remember-me.service.spec.ts` calls `storageRegistry.clear()` in `beforeEach`
  and then builds fresh `Storage` instances per test — each gets a fresh
  `#memory`, so nothing leaks. `auth-state.spec.ts` keeps the module-load
  registrations and calls `clearMemory()` — now a no-op-safe loop over them.
- **Circular-import guard still holds:** `service/storage-registry.ts` imports
  `IdbStore` type-only from `../idb-store`; `idb-store.ts` imports the
  `storageRegistry` value and `MemoryKeyVal`; `storage.ts` / `ttl-storage.ts`
  import only the base class.
- **`git mv` before any content edit** so history follows each file.
- Every `@nfid/*` consumer imports from the package barrel — outside
  `packages/client-db/src/lib/storage/` only the `StorageMode` symbol changes,
  no import-path edits.
- Guard against a formatter reordering `remember-me.service.ts` again (the
  revision-3 incident): re-check `storageModeState.set(StorageMode.MEMORY)` sits
  **before** the raw-key loop after every save.

---

# Revision 5

> Status: COMPLETE — 2026-09-09 (manual dev-server smoke deferred to the
> engineer, as in revisions 1–4)
> Scope: **structure only — zero observable behaviour change.** Two items:
> (1) `StorageRegistry` + `IdbDatabaseCleaner` → one `IdbService`; (2) the
> `doNotRememberMe()` raw-key loop moves onto `rememberMeLocalStorage` as
> `moveToMemory(keys)` and runs before the mode flip. No test assertion changes
> value; specs merge / gain the `moveToMemory` case.

## Rationale

- **Merge.** `IdbDatabaseCleaner` held a `StorageRegistry` reference only to read
  `getDbNames()`, and the two are always driven back-to-back — `doNotRememberMe()`
  (`migrateAllToMemory()` then `deleteAll()`) and `auth-state.ts` logout. One
  class removes the constructor wiring and the cross-file `import { StorageRegistry }`.
- **`moveToMemory`.** The current loop calls `rememberMeLocalStorage.setItem`,
  which routes on `storageModeState.get()`, so it only works after
  `set(MEMORY)` — an ordering a formatter already reversed once (revision-3
  incident). A method on the facade writes `#memory` directly (mode-independent),
  so `set(MEMORY)` becomes the genuine last line of the commit and the loop is no
  longer homeless in the service.

## Renames / merge (`git mv`, then edit contents)

| From                                                                                                          | To                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `service/storage-registry.ts` (+`.spec.ts`) — `class StorageRegistry` / `storageRegistry`                     | `service/idb-service.ts` (+`.spec.ts`) — `class IdbService` / `idbService`                                                                                            |
| `service/idb-database-cleaner.ts` (+`.spec.ts`) — `class IdbDatabaseCleaner(registry)` / `idbDatabaseCleaner` | _merged into `IdbService`_ — `deleteAll()` + private `#deleteSingleDb` + `#deleteTimeoutMs`; no constructor arg (`this.#registry.getDbNames()` → `this.getDbNames()`) |

`IdbService` public surface: `register` / `getDbNames` / `migrateAllToMemory` /
`rebindAllToDisk` / `clear` / `clearMemory` / `deleteAll`. Method bodies copied
verbatim; the only edit inside a body is `this.#registry.getDbNames()` →
`this.getDbNames()` in `deleteAll()`.

### Target layout (`service/` only — rest unchanged from revision 4)

```
storage/
  service/idb-service.ts             (+spec)   ← storage-registry.ts + idb-database-cleaner.ts
  service/ttl-cache-service.ts
  ... (enum/ state/ keyval/ + root files unchanged)
```

## New

| File                          | Origin                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `service/idb-service.ts`      | `git mv service/storage-registry.ts` (the larger body), then paste in the cleaner's `deleteAll()` / `#deleteSingleDb` / `#deleteTimeoutMs` + `import { deleteDB } from "idb"`; rename `StorageRegistry` → `IdbService`, `storageRegistry` → `idbService`; drop the cleaner's constructor; keep `import type { IdbStore } from "../idb-store"`; merge both class doc comments                                                                                      |
| `service/idb-service.spec.ts` | `git mv service/storage-registry.spec.ts`, then merge the `idb` `jest.mock` block + `realDeleteDb` helper + the 3 cases from `idb-database-cleaner.spec.ts`. Spec structure order: mocks → `describe("idbService")` (registry/migration cases) → `describe("idbService.deleteAll")` (cleaner cases) → helpers. One shared `beforeEach` (`new IDBFactory()` + `storageModeState.reset()` + `idbService.clear()` + `deleteDbMock.mockImplementation(realDeleteDb)`) |

## Deleted

- `service/storage-registry.ts` + `.spec.ts` (`git mv`-renamed, above)
- `service/idb-database-cleaner.ts` + `.spec.ts` (`git rm` — contents merged, not lost)

## Modified files

| File                                                                   | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/client-db/src/lib/storage/idb-store.ts`                      | `import { idbService } from "./service/idb-service"` (was `storageRegistry` from `./service/storage-registry`); `idbService.register(...)` in the constructor; doc-comment `storageRegistry` → `idbService`                                                                                                                                                                                                                                                                                                                    |
| `packages/client-db/src/lib/storage/idb-store.spec.ts`                 | import path + `storageRegistry` → `idbService` (3 refs: line 3 import, `beforeEach` `.clear()`, `getDbNames()` assertion)                                                                                                                                                                                                                                                                                                                                                                                                      |
| `packages/client-db/src/lib/storage/remember-me-local-storage.ts`      | add `moveToMemory(keys: string[]): void` — `for (const key of keys) { const value = window.localStorage.getItem(key); if (value != null) this.#memory.set(key, value); window.localStorage.removeItem(key) }`. Raw `window.localStorage.removeItem`, **not** `this.removeItem` (which clears `#memory` too). Contract doc comment on the method (exported member).                                                                                                                                                             |
| `packages/client-db/src/lib/storage/remember-me-local-storage.spec.ts` | add BDD cases for `moveToMemory`: (a) DISK mode — key present in `localStorage` → after call it is in `#memory` (read back via `getItem` after `storageModeState.set(MEMORY)`) and gone from `window.localStorage`; (b) missing key → no throw, still `removeItem`'d; (c) does not wipe a `#memory` value written just before for the same key path (uses raw remove).                                                                                                                                                         |
| `packages/client-db/src/lib/storage/index.ts`                          | replace the `./service/storage-registry` + `./service/idb-database-cleaner` export lines with one `export * from "./service/idb-service"` (after `./remember-me-local-storage`, before `./service/ttl-cache-service`)                                                                                                                                                                                                                                                                                                          |
| `packages/integration/src/lib/remember-me/remember-me.service.ts`      | barrel import: `storageRegistry` + `idbDatabaseCleaner` → `idbService`. `storageRegistry.migrateAllToMemory()` → `idbService.migrateAllToMemory()`; `idbDatabaseCleaner.deleteAll()` → `idbService.deleteAll()`; `storageRegistry.rebindAllToDisk()` → `idbService.rebindAllToDisk()`. Replace the raw-key `for` loop with `rememberMeLocalStorage.moveToMemory(RAW_KEYS_TO_MOVE)` placed **before** `storageModeState.set(StorageMode.MEMORY)` (now the final line). No comment added — the file's "no comments" rule stands. |
| `packages/integration/src/lib/remember-me/remember-me.service.spec.ts` | barrel import + `storageRegistry.clear()` → `idbService.clear()`. Existing `doNotRememberMe` assertions unchanged (they check outcomes).                                                                                                                                                                                                                                                                                                                                                                                       |
| `packages/integration/src/lib/authentication/auth-state.ts`            | barrel import `idbDatabaseCleaner` → `idbService`; `idbDatabaseCleaner.deleteAll()` → `idbService.deleteAll()`                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `packages/integration/src/lib/authentication/auth-state.spec.ts`       | barrel import + `storageRegistry.getDbNames()` / `storageRegistry.clearMemory()` → `idbService.*`                                                                                                                                                                                                                                                                                                                                                                                                                              |

No `apps/` file changes — `security/index.tsx` touches neither symbol.

## Implementation Checklist (revision 5)

<!-- Execute EXACTLY ONE checkbox at a time using /execute-ui-plan -->

### client-db — merge into IdbService

- [x] `git mv service/storage-registry.ts service/idb-service.ts` and
      `git mv service/storage-registry.spec.ts service/idb-service.spec.ts`
      (no content edits yet).
- [x] `service/idb-service.ts` — rename `StorageRegistry` → `IdbService`,
      `storageRegistry` → `idbService`. Paste `deleteAll()`, `#deleteSingleDb`,
      `#deleteTimeoutMs` from `idb-database-cleaner.ts`; drop that class's
      constructor; `this.#registry.getDbNames()` → `this.getDbNames()`. Add
      `import { deleteDB } from "idb"`. Keep `import type { IdbStore } from "../idb-store"`.
      Merge the two class doc comments into one.
- [x] `service/idb-service.spec.ts` — rename symbols; merge in the `idb`
      `jest.mock` + `realDeleteDb` helper + 3 cleaner cases from
      `idb-database-cleaner.spec.ts`, spec-structure order (mocks → two `describe`
      blocks → helpers); one shared `beforeEach`.
- [x] `git rm service/idb-database-cleaner.ts service/idb-database-cleaner.spec.ts`.
- [x] `idb-store.ts` — import + `idbService.register(...)` + doc comment.
- [x] `idb-store.spec.ts` — import path + `storageRegistry` → `idbService` (3 refs).
- [x] `index.ts` — collapse the two `./service/*` lines into
      `export * from "./service/idb-service"`.

### client-db — moveToMemory

- [x] `remember-me-local-storage.ts` — add `moveToMemory(keys: string[]): void`
      (direct `#memory.set` + raw `window.localStorage.removeItem`) with a
      contract doc comment.
- [x] `remember-me-local-storage.spec.ts` — add the 3 BDD `moveToMemory` cases.

### integration

- [x] `remember-me.service.ts` — barrel import to `idbService`; 3 call-site
      renames; replace the raw-key `for` loop with
      `rememberMeLocalStorage.moveToMemory(RAW_KEYS_TO_MOVE)` **before**
      `storageModeState.set(StorageMode.MEMORY)` (now last).
- [x] `remember-me.service.spec.ts` — barrel import + `idbService.clear()`.
- [x] `auth-state.ts` — barrel import + `idbService.deleteAll()`.
- [x] `auth-state.spec.ts` — barrel import + `idbService.getDbNames()` /
      `idbService.clearMemory()`.

- [x] **Manual smoke (dev server)** — unchanged from revisions 1–4; for the engineer.

### Verification (revision 5) — results

- [x] `yarn nx lint` client-db / integration / nfid-wallet-client — all
      "Successfully ran target lint", **0 errors** (17 / 169 / pre-existing
      warnings = baseline).
- [x] `yarn nx test client-db` — **5 suites / 30 tests** green (was 6 / 27:
      `storage-registry.spec` + `idb-database-cleaner.spec` merged into
      `idb-service.spec`; +3 `moveToMemory` cases in
      `remember-me-local-storage.spec`).
- [x] `yarn nx test integration remember-me.service.spec.ts` — **8/8**;
      `yarn nx test integration auth-state.spec.ts` — **2/2**. Full integration
      suite not re-run (text-filter guard) — the 2 documented parallel-run flakes
      (`verification.service`, `passkey`) are unrelated to this change.
- [x] `tsc -p packages/client-db/tsconfig.lib.json` — clean, EXIT 0.
      `tsc --noEmit -p apps/nfid-frontend/tsconfig.json` — only the pre-existing
      `TS2688 uuid`, EXIT 0.
- [x] `grep` repo-wide (`packages/` + `apps/`, excl. node_modules) for
      `storageRegistry` / `StorageRegistry` / `idbDatabaseCleaner` /
      `IdbDatabaseCleaner` / `storage-registry` / `idb-database-cleaner` →
      **0 hits**.

## Risks & Notes (revision 5)

- **Zero observable behaviour change.** Every merged method body is verbatim
  except `this.#registry.getDbNames()` → `this.getDbNames()`. `moveToMemory`
  performs the exact same reads/writes the inline loop did (direct `#memory` write
  == the `setItem` MEMORY branch; raw `removeItem` == the loop's raw call), so the
  end state — keys in `#memory`, absent from `localStorage`, mode `MEMORY` — is
  identical. Ordering of the two final lines flips but they are now independent.
- **Circular-import guard holds:** `service/idb-service.ts` imports `IdbStore`
  **type-only** from `../idb-store`; `idb-store.ts` imports the `idbService`
  value; `storage.ts` / `ttl-storage.ts` import only the base class.
- **`git mv` the registry file** (larger body) → `idb-service.ts` so history
  follows the bigger body; the cleaner's ~35 lines are pasted in and its file
  `git rm`'d.
- **Suite count drops by one** (two spec files → one). No test case removed.
- **`moveToMemory` must use raw `window.localStorage.removeItem`** — calling
  `this.removeItem(key)` would clear `#memory` too and lose the value just
  stored. Covered by BDD case (c).
- **Formatter-reorder risk retired** for this spot: `moveToMemory` writing
  `#memory` directly means `storageModeState.set(MEMORY)` no longer has to precede
  it — a reorder is now harmless.
- Every `@nfid/*` consumer imports from the package barrel, so only the singleton
  name changes outside `packages/client-db/src/lib/storage/`.
