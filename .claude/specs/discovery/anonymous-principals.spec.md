# Discovery: per-user anonymous principals

## 1. Overview

Each NFID user logs into third-party dApps either with their **global**
principal (the same across every dApp) or with an **anonymous**
principal that the wallet derives per `(user, derivation_origin)`. The
existing Discovery feature (`DISCOVERY_REGISTRY` + `DISCOVERY_VISITORS`
in the `icrc1_oracle` canister) only tracks **whether** a user has
visited each dApp; it does not record the anonymous principal the user
uses on that dApp.

This feature extends the discovery flow so that, on every anonymous
login, the wallet sends the freshly derived anonymous principal to the
canister together with the existing visit metadata. The canister
persists it in a new map keyed by the user's root id, and exposes a new
API that returns the calling user's `(app_id, anonymous_principal)`
pairs.

Backward compatibility is preserved on three axes:

- **IDL:** the new `anonymous_principal` field is `opt principal`, so
  old clients keep working unchanged.
- **State:** stable memory adds a new `Option<HashMap<...>>` field; old
  upgrades restore cleanly with `unwrap_or_default()`.
- **Existing users:** the data is backfilled organically — the next
  time an existing user signs into a dApp anonymously, the wallet sends
  the principal and the canister stores it. No migration job needed.

---

## 2. Repositories and Branches

| Repo                                                   | Branch                                   |
| ------------------------------------------------------ | ---------------------------------------- |
| `InternetIdentityLabs/identity-manager` (canister)     | `feature/discovery-anonymous-principals` |
| `internet-identity-labs/nfid-wallet-client` (frontend) | `feature/discovery-anonymous-principals` |

---

## 3. Data Model

### 3.1 Canister storage

`identity-manager/src/icrc1_oracle/src/lib.rs`

```rust
// Existing:
pub static DISCOVERY_REGISTRY:
    RefCell<HashSet<DiscoveryApp>> = ...;
pub static DISCOVERY_VISITORS:
    RefCell<HashMap<u32, HashSet<String>>> = ...;
//  app_id  -> set of root_ids that have visited

// New:
pub static DISCOVERY_USER_PRINCIPALS:
    RefCell<HashMap<String, HashMap<u32, String>>> = ...;
//  root_id -> { app_id : anonymous_principal_text }
```

Keyed by `root_id` (the user's identity-manager root identifier
resolved via inter-canister call), not by the caller's session
principal. This means each user has exactly one entry per dApp they
have ever logged into anonymously.

### 3.2 Stable memory

`Memory` struct gets one new optional field. Old state restores cleanly
because every previously-added field is also optional.

```rust
struct Memory {
    // ...existing fields...
    discovery_user_principals: Option<HashMap<String, HashMap<u32, String>>>,
}
```

---

## 4. Canister API

`identity-manager/src/icrc1_oracle/icrc1_oracle.did`

### 4.1 Extended types

```candid
type DiscoveryVisitRequest = record {
    derivation_origin : opt text;
    hostname : text;
    login : LoginType;
    anonymous_principal : opt principal;   // NEW (opt for back-compat)
};

type UserDiscoveryApp = record {            // NEW
    app_id : nat32;
    anonymous_principal : text;
};
```

### 4.2 Endpoints

| Endpoint                                           | Mode     | Behaviour                                                                                                                                                                                        |
| -------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `is_unique(DiscoveryVisitRequest)`                 | `query`  | Existing checks **plus**: returns `true` when `anonymous_principal` is set but not yet stored for the caller+app.                                                                                |
| `store_discovery_app(DiscoveryVisitRequest)`       | `update` | Existing behaviour **plus**: if `anonymous_principal.is_some()`, upserts it into `DISCOVERY_USER_PRINCIPALS[root_id][app.id]`.                                                                   |
| `get_my_discovery_apps()` → `vec UserDiscoveryApp` | `update` | **NEW.** Resolves caller's `root_id` via IM canister and returns the user's recorded `(app_id, anonymous_principal)` pairs. Must be `update` because IDs are resolved by an inter-canister call. |

### 4.3 `is_unique` decision tree

```
fn is_unique(req) -> bool {
    if app for req.hostname doesn't exist            -> true
    if caller is a new visitor on that app           -> true
    if req.login flips is_global / is_anonymous      -> true
    if req.anonymous_principal is provided AND
       not equal to the stored one for caller+app    -> true   // ← NEW (backfill trigger)
    else                                             -> false
}
```

The fourth clause is what gives us backfill: existing users (already
known visitors on apps they used before the feature) will be reported
as `is_unique = true` on their next anonymous login, the frontend will
fire the follow-up `store_discovery_app`, and the principal lands in
storage.

### 4.4 Caller-vs-root-id consistency note

`is_unique` is a `query`, so it cannot do the inter-canister call that
would resolve the caller's `root_id`. It uses `caller().to_text()`
directly — the same pattern the existing `is_unique` already uses
against `DISCOVERY_VISITORS`. `store_discovery_app` is an `update` and
resolves `root_id` properly via the IM canister.

This means `is_unique` typically returns `true` for the backfill check
even when a principal is already stored (caller principal and root_id
rarely coincide), which causes the frontend to fire `store_discovery_app`
on every anonymous login. The follow-up call is idempotent — it just
upserts the same key/value — so the only cost is one update call per
login. Acceptable.

---

## 5. Frontend Integration

### 5.1 IDL bindings

`packages/integration/src/lib/_ic_api/icrc1_oracle.ts` and `.d.ts` are
extended to mirror the canister:

```ts
const DiscoveryVisitRequest = IDL.Record({
  derivation_origin: IDL.Opt(IDL.Text),
  hostname: IDL.Text,
  login: LoginType,
  anonymous_principal: IDL.Opt(IDL.Principal), // NEW
})

const UserDiscoveryApp = IDL.Record({
  // NEW
  app_id: IDL.Nat32,
  anonymous_principal: IDL.Text,
})

// service:
get_my_discovery_apps: IDL.Func([], [IDL.Vec(UserDiscoveryApp)], [])
```

### 5.2 Service types

`packages/integration/src/lib/token/icrc1/types.ts`

```ts
export interface DiscoveryVisitData {
  derivationOrigin?: string
  hostname: string
  login: DiscoveryLoginType // "Global" | "Anonymous"
  anonymousPrincipal?: string // NEW — text form of a Principal
}

export interface UserDiscoveryAppData {
  // NEW
  appId: number
  anonymousPrincipal: string
}
```

### 5.3 Service methods

`packages/integration/src/lib/token/icrc1/service/icrc1-oracle-service.ts`

```ts
class ICRC1OracleService {
  // Existing — internally now forwards anonymousPrincipal when set.
  async storeDiscoveryApp(data: DiscoveryVisitData): Promise<void>
  async isUnique(data: DiscoveryVisitData): Promise<boolean>

  // NEW
  async getMyDiscoveryApps(): Promise<UserDiscoveryAppData[]>

  // Centralised request builder used by store and isUnique.
  private buildDiscoveryVisitRequest(
    data: DiscoveryVisitData,
  ): DiscoveryVisitRequest
}
```

`storeDiscoveryApp` is unchanged in shape — callers that pass
`anonymousPrincipal` get it persisted, callers that don't (e.g. Global
flow) continue to work as before.

### 5.4 Computing the anonymous principal at the call site

The anonymous principal a dApp will see equals
`Principal.selfAuthenticating(chain.publicKey)`, where `chain` is the
delegation chain returned to the dApp.

#### 5.4.1 ICRC-34 delegation method

`apps/nfid-frontend/src/features/identitykit/service/method/interactive/icrc34-delegation-method.service.ts`

The three anonymous branches (`SESSION`, `SESSION_WITHOUT_DERIVATION`,
`ANONYMOUS_LEGACY`) now compute the chain **first**, then record the
visit:

```ts
const chain = await getAnonymousDelegation(/* … */)
this.recordAnonymousVisit(chain, derivationOrigin, hostname)
return chain
```

with the helper:

```ts
private recordAnonymousVisit(
  chain: DelegationChain,
  derivationOrigin: string,
  hostname: string,
): void {
  const anonymousPrincipal = Principal.selfAuthenticating(
    new Uint8Array(chain.publicKey),
  ).toText()
  void icrc1OracleService.storeDiscoveryApp({
    derivationOrigin,
    hostname,
    login: "Anonymous",
    anonymousPrincipal,
  })
}
```

The `void` keeps the call fire-and-forget — the dApp's response is not
delayed by the canister write.

#### 5.4.2 Legacy choose-account flow

`apps/nfid-frontend/src/features/authentication/3rd-party/choose-account/index.tsx`

```ts
const anonymousDelegation = await getAnonymousDelegate(/* … */)
const anonymousPrincipal = Principal.selfAuthenticating(
  new Uint8Array(anonymousDelegation.publicKey),
).toText()
void icrc1OracleService.storeDiscoveryApp({
  derivationOrigin: authRequest.derivationOrigin,
  hostname: authRequest.hostname,
  login: "Anonymous",
  anonymousPrincipal,
})
```

#### 5.4.3 Global flow

`handleSelectPublic` in the same file, and the `AccountType.GLOBAL`
branch of `icrc34-delegation-method.service.ts`, are intentionally left
unchanged. The global principal is the same for the user across every
dApp and the wallet already knows it, so storing it per-app would be
noise.

---

## 6. End-to-End Flow

### 6.1 Anonymous login (new or backfilled)

```
dApp ──icrc34_delegation──▶ NFID
                              │
                              ├─ derive anonymous delegation chain
                              │
                              ├─ Principal.selfAuthenticating(chain.publicKey)
                              │
                              ├─ icrc1OracleService.storeDiscoveryApp({
                              │     login: "Anonymous",
                              │     anonymousPrincipal,
                              │     derivationOrigin, hostname,
                              │   })
                              │     │
                              │     ├─▶ icrc1_oracle.is_unique(req) ─── query
                              │     │     returns true (new visitor OR
                              │     │     principal not yet stored)
                              │     │
                              │     └─▶ icrc1_oracle.store_discovery_app(req)
                              │           - upsert DISCOVERY_REGISTRY
                              │           - insert into DISCOVERY_VISITORS
                              │           - insert anonymous_principal
                              │             into DISCOVERY_USER_PRINCIPALS
                              │             keyed by root_id
                              │
                              └─ return delegation chain to dApp
```

### 6.2 Querying back

```
NFID UI / service ──▶ icrc1OracleService.getMyDiscoveryApps()
                        │
                        └─▶ icrc1_oracle.get_my_discovery_apps()  -- update
                              - resolve caller's root_id
                              - return DISCOVERY_USER_PRINCIPALS[root_id]
                                as Vec<UserDiscoveryApp>
```

---

## 7. Backward Compatibility Summary

| Concern                             | Behaviour                                                                                                                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Old frontend → new canister         | `anonymous_principal: None`, treated like a Global visit (no principal storage). Existing logic unaffected.                                                                          |
| New frontend → old canister         | Will fail because the IDL adds a required record field — deploy the canister first.                                                                                                  |
| Stable memory upgrade               | New `Option<HashMap>` field deserialises as `None`, `unwrap_or_default()` yields an empty map.                                                                                       |
| Existing users (joined pre-feature) | First anonymous login after the upgrade → frontend sends principal → canister stores it. No data loss for existing visit records (those are kept untouched in `DISCOVERY_VISITORS`). |
| Global-only users                   | Never recorded in `DISCOVERY_USER_PRINCIPALS`; `get_my_discovery_apps()` returns `[]` for them.                                                                                      |

---

## 8. Files Changed

**Canister** (`identity-manager`):

- `src/icrc1_oracle/src/lib.rs` — types, storage, `is_unique`, `store_discovery_app`, new `get_my_discovery_apps`, stable save/restore.
- `src/icrc1_oracle/icrc1_oracle.did` — `DiscoveryVisitRequest`, `UserDiscoveryApp`, new endpoint.

**Frontend** (`nfid-frontend`):

- `packages/integration/src/lib/_ic_api/icrc1_oracle.ts` — IDL factory.
- `packages/integration/src/lib/_ic_api/icrc1_oracle.d.ts` — TypeScript types.
- `packages/integration/src/lib/token/icrc1/types.ts` — `DiscoveryVisitData`, `UserDiscoveryAppData`.
- `packages/integration/src/lib/token/icrc1/service/icrc1-oracle-service.ts` — request builder, `getMyDiscoveryApps`.
- `apps/nfid-frontend/src/features/authentication/3rd-party/choose-account/index.tsx` — anonymous flow records principal.
- `apps/nfid-frontend/src/features/identitykit/service/method/interactive/icrc34-delegation-method.service.ts` — `recordAnonymousVisit` helper applied to the three anonymous branches.
