# Discovery Monetization — Integration Design

## 1. Goal

Allow a user to pay $NFIDW to feature a dApp on the Discovery page.
A single Featured slot is auctioned. A short locked window protects the
current winner; after it, anyone can outbid them until the slot
expires. There is no refund — each bid is a non-recoverable payment for
that bidding round.

The integration layer owns:

- new methods on the `icrc1_oracle` canister (data model, bid
  execution, history, veto)
- a TypeScript service that the UI calls (`promotionService`)
- the on-chain token transfer (NFIDW, ICRC2 approve + pull)
- new CLI commands in `admin_oracle` (one-time bootstrap, emergency
  veto, status & history inspection)

UI work (modal, banner, portfolio screen) is **out of scope** for this
doc — the surface below is what the UI consumes.

---

## 2. Constants

| Setting          | Production (`ic`) | Development (`dev`) |
| ---------------- | ----------------- | ------------------- |
| Min Bid (Floor)  | 100 000 $NFIDW    | 5 $NFIDW            |
| Bid Increment    | 100 $NFIDW        | 1 $NFIDW            |
| Locked Period    | 7 days            | 1 hour              |
| Feature Duration | 30 days max       | 1 day max           |

Hard-coded references:

- **$NFIDW ledger:** `mih44-vaaaa-aaaaq-aaekq-cai` (ICRC1, **8 decimals**,
  ledger fee `10_000 e8s` — confirmed from
  `apps/nfid-frontend/src/integration/staking/test/mock.ts`)
- **Treasury (recipient of NFIDW):** `mpg2i-yyaaa-aaaaq-aaeka-cai`
- **Promotion logic lives inside `icrc1_oracle`** (test id
  `ys266-uyaaa-aaaal-ajs4q-cai`) — same canister that owns
  `DISCOVERY_REGISTRY`, so `app_id` validation is a synchronous local
  lookup, not an inter-canister call.

The four tunables above live in `icrc1_oracle`'s config and are
returned by `get_promotion_status()`. The canister id chosen at deploy
selects the environment; the canister returns the right values for
that env.

---

## 3. Canister Data Model

Added to `identity-manager/src/icrc1_oracle/src/lib.rs`:

```rust
#[derive(CandidType, Deserialize, Clone, Serialize, Debug)]
pub struct PromotionConfig {
    pub min_bid_e8s: u128,            // e.g. 100_000 * 10^8 in prod
    pub bid_increment_e8s: u128,      // e.g. 100 * 10^8 in prod
    pub locked_period_ns: u64,        // e.g. 7 * 86_400 * 1_000_000_000
    pub feature_duration_ns: u64,     // e.g. 30 * 86_400 * 1_000_000_000
    pub ledger_canister: Principal,   // NFIDW ICRC1 ledger
    pub treasury: Principal,          // mpg2i-yyaaa-aaaaq-aaeka-cai
}

#[derive(CandidType, Deserialize, Clone, Serialize, Debug)]
pub struct FeaturedSlot {
    pub app_id: u32,                  // references DISCOVERY_REGISTRY (same canister)
    pub bidder: Principal,
    pub bid_amount_e8s: u128,
    pub bid_time_ns: u64,             // ic_cdk::api::time()
    pub locked_until_ns: u64,         // bid_time + locked_period_ns
    pub expires_at_ns: u64,           // bid_time + feature_duration_ns
}

#[derive(CandidType, Deserialize, Clone, Serialize, Debug)]
pub struct HistoricalBid {
    pub app_id: u32,
    pub bidder: Principal,
    pub bid_amount_e8s: u128,
    pub bid_time_ns: u64,
}

thread_local! {
    // ... existing thread_locals (ICRC_REGISTRY, DISCOVERY_REGISTRY, ...) ...
    pub static PROMOTION_CONFIG: RefCell<Option<PromotionConfig>> = RefCell::new(None);
    pub static FEATURED_SLOT: RefCell<Option<FeaturedSlot>> = RefCell::new(None);
    pub static BID_HISTORY: RefCell<Vec<HistoricalBid>> = RefCell::new(Vec::new());
}
```

### 3.1 Why `Vec` for history is fine

Under the prod parameters (Locked Period 7 days) the maximum number of
new entries per year is bounded by Feature Duration mechanics, but
realistically caps at the low tens to low hundreds per year. Stable
memory and storage cost are negligible. We keep **all** entries — no
trimming.

### 3.2 Stable memory

`Memory` struct in `pre_upgrade` / `post_upgrade` gains three optional
fields so old upgrades restore cleanly (`unwrap_or_default()`):

```rust
struct Memory {
    // ... existing fields ...
    promotion_config: Option<PromotionConfig>,
    featured_slot: Option<FeaturedSlot>,
    bid_history: Option<Vec<HistoricalBid>>,
}
```

---

## 4. Canister API (additions to `icrc1_oracle.did`)

```candid
type PromotionConfig = record {
    min_bid_e8s : nat;
    bid_increment_e8s : nat;
    locked_period_ns : nat64;
    feature_duration_ns : nat64;
    ledger_canister : principal;
    treasury : principal;
};

type FeaturedSlot = record {
    app_id : nat32;
    bidder : principal;
    bid_amount_e8s : nat;
    bid_time_ns : nat64;
    locked_until_ns : nat64;
    expires_at_ns : nat64;
};

type HistoricalBid = record {
    app_id : nat32;
    bidder : principal;
    bid_amount_e8s : nat;
    bid_time_ns : nat64;
};

type PromotionStatus = record {
    config : PromotionConfig;
    featured : opt FeaturedSlot;       // None when EMPTY / expired / vetoed
    min_next_bid_e8s : nat;            // Floor when empty, current+inc otherwise
    locked : bool;                     // shortcut: locked_until_ns > now
    now_ns : nat64;                    // server clock, for client countdown
};

type PlaceBidArg = record {
    app_id : nat32;
    amount_e8s : nat;
};

type PlaceBidError = variant {
    Locked : record { until_ns : nat64 };
    BelowFloor : record { floor_e8s : nat };
    BelowIncrement : record { required_e8s : nat };
    UnknownApp;
    TransferFailed : text;             // ICRC2 transfer_from error
    NotConfigured;                     // PROMOTION_CONFIG is None
};

type PlaceBidResult = variant { Ok : FeaturedSlot; Err : PlaceBidError };

service : (opt Conf) -> {
    // ... existing methods ...

    // promotion: public
    get_promotion_status : () -> (PromotionStatus) query;
    place_bid : (PlaceBidArg) -> (PlaceBidResult);
    get_bid_history_paginated : (nat64, nat64) -> (vec HistoricalBid) query;
    count_bid_history : () -> (nat64) query;

    // promotion: admin
    set_promotion_config : (PromotionConfig) -> ();
    veto_current_featured : () -> ();   // clears FEATURED_SLOT unconditionally
}
```

Admin endpoints reuse the existing `trap_if_not_authenticated_admin`
pattern from `icrc1_oracle`.

### 4.1 `place_bid` flow (canister pseudocode)

```rust
#[update]
pub async fn place_bid(arg: PlaceBidArg) -> PlaceBidResult {
    let cfg = match PROMOTION_CONFIG.with(|c| c.borrow().clone()) {
        Some(c) => c,
        None => return PlaceBidResult::Err(PlaceBidError::NotConfigured),
    };
    let now = ic_cdk::api::time();
    let caller = ic_cdk::caller();

    // 1. Synchronous app validation against DISCOVERY_REGISTRY (same canister)
    let app_exists = DISCOVERY_REGISTRY.with(|r| {
        r.borrow().iter().any(|a| a.id == arg.app_id)
    });
    if !app_exists { return PlaceBidResult::Err(PlaceBidError::UnknownApp); }

    // 2. Resolve the effective current slot (None if expired)
    let current = FEATURED_SLOT.with(|s| s.borrow().clone())
        .filter(|s| s.expires_at_ns > now);

    // 3. Compute min required and validate amount
    let min_required = match &current {
        Some(s) if s.locked_until_ns > now =>
            return PlaceBidResult::Err(PlaceBidError::Locked {
                until_ns: s.locked_until_ns,
            }),
        Some(s) => s.bid_amount_e8s + cfg.bid_increment_e8s,
        None    => cfg.min_bid_e8s,
    };
    if arg.amount_e8s < min_required {
        return PlaceBidResult::Err(if current.is_some() {
            PlaceBidError::BelowIncrement { required_e8s: min_required }
        } else {
            PlaceBidError::BelowFloor { floor_e8s: min_required }
        });
    }

    // 4. Pull tokens from caller into the treasury (sunk fee, no refund)
    let pulled = icrc2_transfer_from(
        cfg.ledger_canister,
        Account { owner: caller, subaccount: None },
        Account { owner: cfg.treasury, subaccount: None },
        arg.amount_e8s,
    ).await;
    if let Err(e) = pulled {
        return PlaceBidResult::Err(PlaceBidError::TransferFailed(format!("{e:?}")));
    }

    // 5. Replace the slot (clock fully resets)
    let slot = FeaturedSlot {
        app_id: arg.app_id,
        bidder: caller,
        bid_amount_e8s: arg.amount_e8s,
        bid_time_ns: now,
        locked_until_ns: now + cfg.locked_period_ns,
        expires_at_ns: now + cfg.feature_duration_ns,
    };
    FEATURED_SLOT.with(|s| *s.borrow_mut() = Some(slot.clone()));

    // 6. Append to history (kept forever)
    BID_HISTORY.with(|h| h.borrow_mut().push(HistoricalBid {
        app_id: slot.app_id,
        bidder: slot.bidder,
        bid_amount_e8s: slot.bid_amount_e8s,
        bid_time_ns: slot.bid_time_ns,
    }));

    PlaceBidResult::Ok(slot)
}
```

Notes:

- **No refunds.** Previous winner's tokens stay in treasury. This is
  the chosen revenue model (each bid is a sunk fee).
- **Both timers reset on every successful bid.** The new winner gets a
  fresh 7-day Locked Period followed by Open Bidding up to 30 days
  from their own bid time. There is no global "30 days from first
  promoter" clock.
- **`app_id` validated against `DISCOVERY_REGISTRY` synchronously** —
  no inter-canister calls, no extra latency.
- **No concurrent-bid retry.** If two clients race and one loses the
  IC's update serialisation, the loser gets `BelowIncrement` with the
  fresh `required_e8s`. The client is expected to surface this as an
  error and let the user explicitly decide to re-bid. The frontend
  service does **not** auto-retry.

### 4.2 `veto_current_featured` (admin, one-shot)

```rust
#[update]
pub fn veto_current_featured() {
    trap_if_not_authenticated_admin();
    FEATURED_SLOT.with(|s| *s.borrow_mut() = None);
    // Note: history is not modified — the vetoed bid stays in BID_HISTORY
    //       so reporting/audit remains accurate.
}
```

There is **no sticky deny-list.** If the same `app_id` places a new
qualifying bid the moment after veto, it can become featured again.
This is intentional per the chosen design — veto is an emergency stop
for _the current incident_, not policy enforcement.

### 4.3 `get_promotion_status`

```rust
#[query]
pub fn get_promotion_status() -> PromotionStatus {
    let cfg = PROMOTION_CONFIG.with(|c| c.borrow().clone())
        .expect("promotion not configured");
    let now = ic_cdk::api::time();
    let raw = FEATURED_SLOT.with(|s| s.borrow().clone());
    let effective = raw.filter(|s| s.expires_at_ns > now);
    let locked = effective.as_ref()
        .map(|s| s.locked_until_ns > now)
        .unwrap_or(false);
    let min_next_bid_e8s = match &effective {
        Some(s) => s.bid_amount_e8s + cfg.bid_increment_e8s,
        None    => cfg.min_bid_e8s,
    };
    PromotionStatus {
        config: cfg,
        featured: effective,
        min_next_bid_e8s,
        locked,
        now_ns: now,
    }
}
```

The query is cheap and cacheable.

---

## 5. Frontend Service Surface

New file: `packages/integration/src/lib/promotion/promotion-service.ts`.

It uses the existing `iCRC1OracleActor` (since the canister is the same),
just calls the new methods.

```ts
export interface PromotionConfig {
  minBidE8s: bigint
  bidIncrementE8s: bigint
  lockedPeriodMs: number
  featureDurationMs: number
  ledgerCanisterId: string
  treasuryPrincipal: string
}

export interface FeaturedSlot {
  appId: number
  bidder: string // principal text
  bidAmountE8s: bigint
  bidTime: Date
  lockedUntil: Date
  expiresAt: Date
}

export interface PromotionStatus {
  config: PromotionConfig
  featured?: FeaturedSlot // undefined when slot is EMPTY / expired / vetoed
  minNextBidE8s: bigint // ready to pre-fill the bid input
  locked: boolean
  now: Date // server clock — use this for countdowns
}

export type PlaceBidError =
  | { kind: "locked"; until: Date }
  | { kind: "belowFloor"; floorE8s: bigint }
  | { kind: "belowIncrement"; requiredE8s: bigint }
  | { kind: "unknownApp" }
  | { kind: "transferFailed"; message: string }
  | { kind: "notConfigured" }

export interface HistoricalBid {
  appId: number
  bidder: string
  bidAmountE8s: bigint
  bidTime: Date
}

export class PromotionService {
  async getStatus(): Promise<PromotionStatus>

  /**
   * Pre-conditions: caller has sufficient NFIDW balance + ledger fee.
   * Side-effects: issues an ICRC2 approve on the NFIDW ledger granting
   * `amountE8s` to the treasury, then calls place_bid on icrc1_oracle.
   * On any Err variant returned by the canister, throws a PromotionError.
   */
  async placeBid(
    identity: SignIdentity,
    appId: number,
    amountE8s: bigint,
  ): Promise<FeaturedSlot>

  async getBidHistory(pageSize?: number): Promise<HistoricalBid[]>
}

// thrown by placeBid; contains the typed error
export class PromotionError extends Error {
  constructor(public readonly cause: PlaceBidError) {
    super(cause.kind)
  }
}
```

### 5.1 `placeBid` internals

```
1. status = await getStatus()
2. Client-side guard (mirrors the canister; never trust the UI alone):
     if amountE8s < status.minNextBidE8s
     OR (status.locked === true)
     → throw PromotionError({ kind: "locked" | "belowFloor" | "belowIncrement" })
3. ICRC2 approve(NFIDW ledger, treasury principal, amountE8s)
   using identity → see EVMService.approveTransfer in
   apps/nfid-frontend/src/integration/ethereum/evm.service.ts
4. await icrc1OracleActor.place_bid({ app_id, amount_e8s })
5. on `{ Err: variant }` → throw PromotionError(mapped)
6. on `{ Ok: slot }` → map to FeaturedSlot, return
```

### 5.2 UI helpers (still belong to the service)

```ts
// trivial — the canister already computed it
export function computePreFill(status: PromotionStatus): bigint {
  return status.minNextBidE8s
}

export function validate(
  amountE8s: bigint,
  status: PromotionStatus,
): PlaceBidError | undefined {
  if (status.locked && status.featured)
    return { kind: "locked", until: status.featured.lockedUntil }
  if (!status.featured && amountE8s < status.config.minBidE8s)
    return { kind: "belowFloor", floorE8s: status.config.minBidE8s }
  if (amountE8s < status.minNextBidE8s)
    return { kind: "belowIncrement", requiredE8s: status.minNextBidE8s }
  return undefined
}
```

UI calls `validate` on every keystroke and disables the Promote button
while it returns an error.

### 5.3 Caching

`getStatus()` should be SWR-cached with a short TTL (~30 s) and
invalidated immediately after a successful `placeBid`. Countdowns shown
to the user are computed against `status.now` (canister clock) plus
local elapsed time since `getStatus`, so the timer doesn't drift even
if the user leaves the modal open.

---

## 6. Admin CLI (`admin_oracle`)

Promotion needs operator-side tooling for three things: a one-time
config push at deploy, an emergency veto button, and read-only
inspection (current slot + history) for audit. We extend the existing
`admin_oracle` package — same `argv[2]`-dispatched CLI, same
`AdminManager` actor wrapper.

### 6.1 AdminManager methods

Added to `admin_oracle/admin_manager.ts`:

```ts
class AdminManager {
  // ── promotion: write ──
  async setPromotionConfig(env: "prod" | "dev"): Promise<void>
  async vetoFeatured(): Promise<void>

  // ── promotion: read ──
  async getPromotionStatus(): Promise<PromotionStatus>
  async getBidHistory(pageSize?: number): Promise<HistoricalBid[]>
}
```

`setPromotionConfig` reads its values from a small lookup in
`admin_oracle/constants.ts`:

```ts
export const PROMOTION_CONFIG: Record<"prod" | "dev", PromotionConfig> = {
  prod: {
    min_bid_e8s: 100_000n * 10n ** 8n,
    bid_increment_e8s: 100n * 10n ** 8n,
    locked_period_ns: 7n * 86_400n * 1_000_000_000n,
    feature_duration_ns: 30n * 86_400n * 1_000_000_000n,
    ledger_canister: Principal.fromText("mih44-vaaaa-aaaaq-aaekq-cai"),
    treasury: Principal.fromText("mpg2i-yyaaa-aaaaq-aaeka-cai"),
  },
  dev: {
    /* 5 / 1 / 1h / 1d */
  },
}
```

Calling `setPromotionConfig` is idempotent — re-running it overwrites
the stored config. Intended once at deploy and again only when product
changes a parameter.

### 6.2 CLI commands

Added to `admin_oracle/admin_CLI.ts` switch:

```ts
case "setPromotionConfig":
    await adminManager.setPromotionConfig(process.argv[3] as "prod" | "dev")
    console.log("Promotion config has been uploaded!!!")
    break

case "vetoFeatured":
    await adminManager.vetoFeatured()
    console.log("Current featured slot has been cleared!!!")
    break

case "getFeatured":
    const status = await adminManager.getPromotionStatus()
    console.log(JSON.stringify(status, replacerForBigints, 2))
    break

case "getBidHistory":
    const history = await adminManager.getBidHistory()
    console.log(JSON.stringify(history, replacerForBigints, 2))
    break
```

Invocation:

```
npx tsx admin_oracle/admin_CLI.ts setPromotionConfig prod
npx tsx admin_oracle/admin_CLI.ts vetoFeatured
npx tsx admin_oracle/admin_CLI.ts getFeatured
npx tsx admin_oracle/admin_CLI.ts getBidHistory
```

### 6.3 Authorisation

The CLI authenticates as the admin identity stored in
`admin_oracle/constants.ts` (`KEY_PAIR`). The canister enforces
admin-only access for `set_promotion_config` and
`veto_current_featured` via `trap_if_not_authenticated_admin`. Reads
(`get_promotion_status`, `get_bid_history_paginated`) are public and
work for any caller — the CLI just uses the same identity for
consistency.

### 6.4 Veto operational notes

`vetoFeatured` calls `veto_current_featured()` which **always** clears
`FEATURED_SLOT` (it does nothing else if the slot was already empty —
no error). `BID_HISTORY` is preserved so the audit trail of the
removed slot remains intact.

Effect is immediate: the very next `get_promotion_status` from any
caller returns `featured: undefined`. Frontend UI hides the banner on
its next SWR poll. No deny-list is created — see §9 decision 4.

---

## 7. End-to-End Sequence

```
User clicks Promote on dApp X
  │
  │  const status = await promotionService.getStatus()
  │  open modal, prefill = status.minNextBidE8s
  │  on every keystroke: validate(amount, status)
  │
User clicks Promote (modal CTA)
  │
  │  await promotionService.placeBid(identity, X.id, amount)
  │    ├─ NFIDW.icrc2_approve(treasury, amount)
  │    └─ icrc1OracleActor.place_bid({ app_id: X.id, amount_e8s: amount })
  │        ├─ canister validates (app exists, not locked, ≥ min)
  │        ├─ icrc2_transfer_from(caller → treasury, amount)
  │        ├─ FEATURED_SLOT = { app_id: X.id, bidder: caller,
  │        │                    bid_time = now,
  │        │                    locked_until = now + 7d,
  │        │                    expires_at  = now + 30d }
  │        └─ BID_HISTORY.push(...)
  │
  │  on Ok: SWR invalidate("promotion-status")
  │
  ▼
Discovery banner re-renders with X (no banner if vetoed/expired).
Portfolio screen subscribes to the same SWR key and re-renders.
```

### 7.1 Veto sequence

```
admin ──icrc1OracleActor.veto_current_featured()──▶ icrc1_oracle
                                                       │
                                                       └─ FEATURED_SLOT = None
                                                          (BID_HISTORY untouched)
Discovery clients see featured: None on next getStatus poll.
The vetoed app can be re-promoted by anyone with a fresh bid (no deny-list).
```

---

## 8. Files to Touch (when implementation starts)

**Canister** (`identity-manager`):

- `src/icrc1_oracle/src/lib.rs` — add types, thread_locals, `place_bid`,
  `get_promotion_status`, `get_bid_history_paginated`,
  `count_bid_history`, `set_promotion_config`,
  `veto_current_featured`, plus stable save/restore for the three new
  `Option<>` Memory fields.
- `src/icrc1_oracle/icrc1_oracle.did` — new types and service entries
  from §4.
- `src/icrc1_oracle/Cargo.toml` — likely needs the ICRC ledger
  client crate (e.g. `ic-icrc1-client` / equivalent) for the
  `transfer_from` call; pick whatever the existing services in this
  repo already use (e.g. `bitcoin/signer` style).
- `test/icrc1_oracle.test.ts` + `test/idl/icrc1_oracle*.ts` — IDL update
  and tests:
  - `place_bid` happy path → status reflects new slot, history grows
  - `place_bid` BelowFloor on empty slot
  - `place_bid` BelowIncrement on Open-Bidding slot
  - `place_bid` Locked during the locked period
  - `place_bid` UnknownApp when app_id absent from DISCOVERY_REGISTRY
  - `place_bid` resets timers (verify `bid_time_ns`, `locked_until_ns`,
    `expires_at_ns` are all advanced relative to previous slot)
  - `place_bid` after expiry: slot empty, floor required again
  - `veto_current_featured` clears slot, history preserved
  - veto + immediate re-bid by the same app succeeds (no deny-list)
  - admin-only guards on `set_promotion_config` / `veto_current_featured`

**Admin CLI** (`identity-manager/admin_oracle`):

- `admin_oracle/admin_manager.ts` — add `setPromotionConfig`,
  `vetoFeatured`, `getPromotionStatus`, `getBidHistory` methods
  on `AdminManager`.
- `admin_oracle/admin_CLI.ts` — new `case` entries:
  `setPromotionConfig`, `vetoFeatured`, `getFeatured`,
  `getBidHistory`.
- `admin_oracle/constants.ts` — add the `PROMOTION_CONFIG` lookup
  (prod/dev) used by `setPromotionConfig`.
- `admin_oracle/types.ts` — re-export `PromotionStatus` /
  `HistoricalBid` shapes for the CLI JSON-print path.

**Frontend** (`nfid-wallet-client`):

- `packages/integration/src/lib/_ic_api/icrc1_oracle.ts` and `.d.ts` —
  extend IDL with the new types and methods from §4.
- `packages/integration/src/lib/promotion/types.ts` — TS-shaped types
  from §5.
- `packages/integration/src/lib/promotion/promotion-service.ts` —
  `PromotionService`, `PromotionError`, `computePreFill`, `validate`.
- `packages/integration/src/lib/promotion/index.ts` — barrel.
- `packages/integration/src/lib/token/constants.ts` — add
  `PROMOTION_TREASURY_PRINCIPAL = "mpg2i-yyaaa-aaaaq-aaeka-cai"` for
  the rare case the frontend needs it outside the service (UI should
  rely on `status.config.treasuryPrincipal`).
- `docs/discovery-monetization.md` — implementation note that
  supersedes this design doc.

**Out of scope** (covered separately):

- UI: Promote modal, Featured banner, portfolio screen
- Treasury withdrawal (how NFID moves the accumulated NFIDW out of
  `mpg2i-yyaaa-aaaaq-aaeka-cai`) — this is a separate workflow
- Reporting/analytics dashboards on top of `BID_HISTORY`

---

## 9. Decisions log

This section pins down the choices that close out the original open
questions. They are the contract for implementation; if a decision
needs to change it changes here first.

| #   | Decision                                                                                                                                                               |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **No refunds.** Each bid is a sunk fee paid to the treasury.                                                                                                           |
| 2   | **Clock resets on every successful bid** (both Locked and Feature Duration).                                                                                           |
| 3   | **Full bid history kept** (`BID_HISTORY: Vec<HistoricalBid>`, paginated read).                                                                                         |
| 4   | **Veto is one-shot.** Clears `FEATURED_SLOT`; no sticky deny-list. The same app may be re-promoted immediately.                                                        |
| 5   | **`app_id` validated synchronously** against `DISCOVERY_REGISTRY` in the same canister.                                                                                |
| 6   | **No client-side retry on concurrent bids.** Canister returns `BelowIncrement` with fresh required amount; UI surfaces the error and lets the user decide.             |
| 7   | **Treasury withdrawal is out of scope** of this design. `mpg2i-yyaaa-aaaaq-aaeka-cai` is the configured recipient; how NFID extracts those funds is handled elsewhere. |
| 8   | **NFIDW: 8 decimals, ledger fee 10 000 e8s.** Verified against `apps/nfid-frontend/src/integration/staking/test/mock.ts`.                                              |
| 9   | **Promotion lives inside the existing `icrc1_oracle` canister.** No new canister; admin model and stable-storage pattern are reused.                                   |
