# Discovery Monetization — Integration Design

> **Status:** design only. No code yet. This document is the working
> contract between integration layer, canister, and UI. Items flagged
> **(open)** need a product/engineering decision before implementation.

## 1. Goal

Allow a user to pay $NFIDW to feature a dApp on the Discovery page.
A single Featured slot is auctioned. A short locked window protects the
current winner, after which anyone can outbid them until the slot
expires.

The integration layer owns:

- the canister contract (data model + bid execution + state machine)
- the TypeScript service that the UI calls (`promotionService`)
- the on-chain token transfer (NFIDW, ICRC2 approve + pull)

UI work (modal, banner, portfolio screen) is **out of scope** for this
doc — the surface below is what the UI consumes.

---

## 2. Constants and Variables

| Setting          | Production (`ic`) | Development (`dev`) |
| ---------------- | ----------------- | ------------------- |
| Min Bid (Floor)  | 100 000 $NFIDW    | 5 $NFIDW            |
| Bid Increment    | 100 $NFIDW        | 1 $NFIDW            |
| Locked Period    | 7 days            | 1 hour              |
| Feature Duration | 30 days max       | 1 day max           |

Hard-coded references:

- **$NFIDW ledger:** `mih44-vaaaa-aaaaq-aaekq-cai` (ICRC1, 8 decimals — to confirm)
- **Promotion / treasury canister (recipient):** `mpg2i-yyaaa-aaaaq-aaeka-cai`

The four tunables above live **inside the promotion canister**, not on
the frontend. The frontend reads them via `get_promotion_config()`. This
keeps prod/dev behaviour identical from the client's point of view —
the canister id selects the environment, and the canister returns the
right values for that env.

---

## 3. State Machine

```
             ┌─────────────┐
             │   EMPTY     │  no featured slot, next bid >= Floor
             └─────┬───────┘
                   │  place_bid(app_id, >= Floor)
                   ▼
             ┌─────────────┐
             │   LOCKED    │  app featured, outbid disabled
             │ (≤ now+Lock)│  locked_until = bid_time + Locked Period
             └─────┬───────┘
                   │  block.timestamp > locked_until
                   ▼
             ┌─────────────┐
             │ OPEN BIDDING│  next bid = current_bid + Increment
             │ (≤ end_time)│  end_time = bid_time + Feature Duration
             └─────┬─┬─────┘
   place_bid (≥cur+inc) │ │ block.timestamp > end_time
                   ▼ │   │
             back to LOCKED with new winner
                     │
                     ▼
                  EMPTY
```

Veto is an out-of-band edge that transitions any state → `EMPTY`
immediately (see §7).

### 3.1 Reading the state

`get_featured()` returns the **effective** state at the moment of
query — it accounts for time-based expiry on read, so the canister
does not need a heartbeat. The actual cleanup of stale state is lazy:
either the next bid overwrites it, or the next read sees `expires_at <
now` and returns `EMPTY`.

---

## 4. Canister Data Model

Single canister, single slot. Storage is small enough for a `RefCell`
with stable save/restore.

```rust
#[derive(CandidType, Deserialize, Clone, Serialize, Debug)]
pub struct FeaturedSlot {
    pub app_id: u32,                    // DiscoveryApp.id from icrc1_oracle
    pub bidder: Principal,              // who placed the winning bid
    pub bid_amount: u128,               // in NFIDW e8s (smallest unit)
    pub bid_time_ns: u64,               // ic_cdk::api::time()
    pub locked_until_ns: u64,           // bid_time + Locked Period
    pub expires_at_ns: u64,             // bid_time + Feature Duration
}

#[derive(CandidType, Deserialize, Clone, Serialize, Debug)]
pub struct PromotionConfig {
    pub min_bid_e8s: u128,              // 100_000 * 10^8 (prod) / 5 * 10^8 (dev)
    pub bid_increment_e8s: u128,        // 100 * 10^8 (prod) / 1 * 10^8 (dev)
    pub locked_period_ns: u64,          // 7 * 24h * 3600 * 1e9 (prod) / 1h (dev)
    pub feature_duration_ns: u64,       // 30 * 24h * 3600 * 1e9 (prod) / 1d (dev)
    pub ledger_canister: Principal,     // NFIDW ICRC1 ledger
    pub treasury_account: Account,      // where the tokens land after a winning bid
}

thread_local! {
    static CONFIG: RefCell<PromotionConfig> = ...;
    static FEATURED: RefCell<Option<FeaturedSlot>> = RefCell::new(None);
    static VETO_APP_ID: RefCell<Option<u32>> = RefCell::new(None);
    static BID_HISTORY: RefCell<Vec<HistoricalBid>> = RefCell::new(vec![]); // (open)
    static ADMINS: RefCell<HashSet<Principal>> = ...;
}
```

`BID_HISTORY` (open): keep last N winners for transparency? See §10.

---

## 5. Canister API

```candid
type PromotionConfig = record {
    min_bid_e8s : nat;
    bid_increment_e8s : nat;
    locked_period_ns : nat64;
    feature_duration_ns : nat64;
    ledger_canister : principal;
    treasury_account : Account;
};

type FeaturedSlot = record {
    app_id : nat32;
    bidder : principal;
    bid_amount : nat;
    bid_time_ns : nat64;
    locked_until_ns : nat64;
    expires_at_ns : nat64;
};

type PromotionStatus = record {
    config : PromotionConfig;
    featured : opt FeaturedSlot;       // None when EMPTY / vetoed / expired
    min_next_bid : nat;                // Floor when empty, current+inc otherwise
    locked : bool;                     // shortcut: locked_until_ns > now
    now_ns : nat64;                    // canister's clock, for client display
};

type PlaceBidArg = record {
    app_id : nat32;
    amount : nat;                      // must equal min_next_bid (off-chain client decides exact)
};

type PlaceBidError = variant {
    Vetoed;
    Locked : record { until_ns : nat64 };
    BelowFloor : record { floor : nat };
    BelowIncrement : record { required : nat };
    UnknownApp;
    TransferFailed : text;             // ICRC2 transfer_from error
};

service : (PromotionConfig) -> {
    // public
    get_status : () -> (PromotionStatus) query;
    place_bid : (PlaceBidArg) -> (variant { Ok : FeaturedSlot; Err : PlaceBidError });

    // admin
    veto : (nat32) -> ();              // mark this app_id as vetoed and clear FEATURED if it matches
    clear_veto : () -> ();
    set_config : (PromotionConfig) -> ();
    set_admin : (principal, bool) -> ();
}
```

### 5.1 `place_bid` flow (canister-side pseudocode)

```rust
async fn place_bid(arg: PlaceBidArg) -> Result<FeaturedSlot, PlaceBidError> {
    let now = ic_cdk::api::time();
    let caller = ic_cdk::caller();
    let cfg = CONFIG.with(|c| c.borrow().clone());

    // 1. Veto check
    if let Some(vetoed) = VETO_APP_ID.with(|v| *v.borrow()) {
        if vetoed == arg.app_id { return Err(PlaceBidError::Vetoed); }
    }

    // 2. Validate app exists (inter-canister call to icrc1_oracle (open))
    //    Or: trust the client and skip — the bid is paid for either way.

    // 3. Compute min required
    let current = FEATURED.with(|f| f.borrow().clone())
        .filter(|s| s.expires_at_ns > now);  // expired = empty
    let min_required = match &current {
        Some(s) if s.locked_until_ns > now =>
            return Err(PlaceBidError::Locked { until_ns: s.locked_until_ns }),
        Some(s) => s.bid_amount + cfg.bid_increment_e8s,
        None    => cfg.min_bid_e8s,
    };
    if arg.amount < min_required {
        return Err(if current.is_some()
            { PlaceBidError::BelowIncrement { required: min_required } }
            else { PlaceBidError::BelowFloor { floor: min_required } });
    }

    // 4. Pull tokens via ICRC2 transfer_from (caller must have approved)
    let ledger = IcrcLedgerCanister::create(cfg.ledger_canister);
    ledger.transfer_from(TransferFromArgs {
        from: Account { owner: caller, subaccount: None },
        to:   cfg.treasury_account,
        amount: arg.amount.into(),
        fee: None, memo: None, created_at_time: None,
        spender_subaccount: None,
    }).await
      .map_err(|e| PlaceBidError::TransferFailed(format!("{e:?}")))?;

    // 5. Refund the previous bidder? (open — see §6)
    // if let Some(prev) = current { refund(prev.bidder, prev.bid_amount).await; }

    // 6. Update slot
    let slot = FeaturedSlot {
        app_id: arg.app_id,
        bidder: caller,
        bid_amount: arg.amount,
        bid_time_ns: now,
        locked_until_ns: now + cfg.locked_period_ns,
        expires_at_ns: now + cfg.feature_duration_ns,
    };
    FEATURED.with(|f| *f.borrow_mut() = Some(slot.clone()));
    Ok(slot)
}
```

Note that `expires_at_ns` is reset on every successful bid (it's
**bid_time + Feature Duration**, not "30 days from the very first
bid"). **(open)** confirm: does outbidding restart the 30-day clock, or
inherit the original end time? The flow text says "until the 30-day
expiry," which I read as inheriting — but most auctions reset. Flagging.

---

## 6. Refund policy — **open**

The flow spec doesn't say what happens to the outbid winner's tokens.
Three options:

| Option | Behaviour                                             | Pros                        | Cons                                                 |
| ------ | ----------------------------------------------------- | --------------------------- | ---------------------------------------------------- |
| A      | Outbid bidder is **refunded** in full (auction-style) | Fair, lowers entry friction | Bot wars cost the treasury nothing, capital sloshes  |
| B      | Outbid bidder **loses** the bid (sunk fee)            | Each bid is real revenue    | Hostile bidders cost the genuine promoter real money |
| C      | Outbid bidder refunded **pro-rata** by remaining time | Compromise                  | Complex; needs unbond/escrow logic                   |

Recommendation: **A** (refund). Matches "Bid" terminology and aligns
with how every other on-chain auction works. The treasury only ever
holds the _current winning_ bid; the rest is in flight back to losers.

Once decided this affects `place_bid` (step 5) and adds a
`refund_failed_for` audit log so a failed refund doesn't roll back the
new winner.

---

## 7. Veto / Governance

```
admin ──veto(app_id)──▶ promotion canister
                          │
                          ├─ VETO_APP_ID = Some(app_id)
                          │
                          └─ if FEATURED.app_id == app_id:
                              clear FEATURED
                              (optionally refund the bidder — see §6)
```

`get_status` checks both the veto map and the FEATURED slot. Any read
when the current featured matches the vetoed id returns `featured =
None`. The veto stays sticky across re-bids on that app — once vetoed,
the app can't be re-promoted until `clear_veto` is called. **(open)**:
do we want one-shot veto (clear after one slot turnover) or sticky?

This is purely a canister-side switch. The frontend does nothing
special — the next `get_status` call returns `featured: None` and the
UI hides the banner.

Authorisation: a fixed `ADMINS: HashSet<Principal>` initialised at deploy
time, mutated via `set_admin(principal, bool)` by an existing admin
(same shape as `trap_if_not_authenticated_admin` in `icrc1_oracle`).

---

## 8. Frontend Service Surface

`packages/integration/src/lib/promotion/promotion-service.ts` (new).

```ts
export interface PromotionConfig {
  minBid: bigint // e8s
  bidIncrement: bigint // e8s
  lockedPeriodMs: number
  featureDurationMs: number
  ledgerCanisterId: string
  treasuryPrincipal: string
}

export interface FeaturedSlot {
  appId: number
  bidder: string // principal text
  bidAmount: bigint // e8s
  bidTime: Date
  lockedUntil: Date
  expiresAt: Date
}

export interface PromotionStatus {
  config: PromotionConfig
  featured?: FeaturedSlot
  minNextBid: bigint // ready to pre-fill the bid input
  locked: boolean
  now: Date // server clock — use this for countdowns
}

export type PlaceBidError =
  | { kind: "vetoed" }
  | { kind: "locked"; until: Date }
  | { kind: "belowFloor"; floor: bigint }
  | { kind: "belowIncrement"; required: bigint }
  | { kind: "unknownApp" }
  | { kind: "transferFailed"; message: string }

export class PromotionService {
  async getStatus(): Promise<PromotionStatus>
  async placeBid(
    identity: SignIdentity,
    appId: number,
    amountE8s: bigint,
  ): Promise<FeaturedSlot> // throws typed PlaceBidError
}
```

`placeBid` internally:

```
1. status = await getStatus()
2. if amountE8s < status.minNextBid → throw BelowFloor/BelowIncrement
   (mirrors canister validation; the UI shouldn't have got this far,
    but defensive)
3. ICRC2 approve(NFIDW ledger, treasury principal, amountE8s) using identity
4. await promotionActor.place_bid({ app_id, amount: amountE8s })
5. on error variant → throw matching PlaceBidError
6. on Ok → map to FeaturedSlot, return
```

Use the same pattern as `EVMService.approveTransfer` for the ICRC2
approve (see `apps/nfid-frontend/src/integration/ethereum/evm.service.ts`).

### 8.1 UI-friendly helpers

```ts
// computed by the UI, but offered as a helper:
function computePreFill(status: PromotionStatus): bigint {
  return status.minNextBid // always the right answer
}

function validate(
  amountE8s: bigint,
  status: PromotionStatus,
): PlaceBidError | undefined {
  if (status.locked)
    return { kind: "locked", until: status.featured!.lockedUntil }
  if (!status.featured && amountE8s < status.config.minBid)
    return { kind: "belowFloor", floor: status.config.minBid }
  if (amountE8s < status.minNextBid)
    return { kind: "belowIncrement", required: status.minNextBid }
  return undefined
}
```

The UI calls `validate` on every keystroke and disables the Promote
button while it returns an error.

### 8.2 Caching

`getStatus()` should be SWR-cached with a short TTL (~30 s) and
invalidated immediately after a successful `placeBid`. The countdown
shown to the user is computed against `status.now` (canister clock) +
local elapsed time since `getStatus`, so the timer doesn't drift even
if the user keeps the modal open.

---

## 9. Sequence — Promote click → Featured banner update

```
User clicks Promote on dApp X
  │
  │ const status = await promotionService.getStatus()
  │ open modal, prefill amount = status.minNextBid
  │ on every keystroke: validate(amount, status)
  │
User clicks Promote (modal CTA)
  │
  │ await promotionService.placeBid(identity, X.id, amount)
  │   ├─ NFIDW.icrc2_approve(treasury, amount)
  │   └─ promotionActor.place_bid({ app_id: X.id, amount })
  │       └─ canister: validate + transfer_from + update FEATURED
  │
  │ on success: SWR invalidate("promotion-status")
  │
  ▼
Discovery banner re-renders with X.
Portfolio screen subscribes to the same SWR key and re-renders.
```

---

## 10. Open Questions

1. **Refund policy** — §6. Recommend (A) full refund.
2. **Outbid resets the clock?** — does outbidding restart the 30-day
   feature duration, or does the new winner inherit the original
   `expires_at`? Spec is ambiguous.
3. **Bid history** — keep a public on-chain log of past winners
   (`BID_HISTORY: Vec<HistoricalBid>`)? Useful for analytics and trust;
   storage growth is bounded (1 bid per Locked Period min).
4. **Veto persistence** — sticky vs one-shot, see §7.
5. **App validation** — should `place_bid` do an inter-canister query
   to `icrc1_oracle.get_discovery_app_paginated` to confirm `app_id`
   exists, or trust the client? Trusting is cheaper; the only downside
   is users wasting NFIDW promoting a nonexistent slot — which is on
   them.
6. **Concurrent bids** — IC serialises updates per canister, so first
   bid wins and the second sees the new state on its `place_bid`. The
   client should refresh `getStatus` and retry with the corrected
   `minNextBid` on `BelowIncrement` error.
7. **Treasury withdrawal** — how does NFID actually collect from the
   treasury account? Admin endpoint `sweep_to(principal, amount)`? Or
   the treasury_account is already an NFID-owned account on the ledger?
   Probably the latter — set `treasury_account.owner = NFID_WALLET_CANISTER`
   on deploy and call ICRC1 transfer separately when needed.
8. **NFIDW decimals confirmation** — assumed 8. Verify against the
   `mih44-vaaaa-aaaaq-aaekq-cai` ledger before hard-coding.
9. **Where does this canister live?** New repo, or new module in
   `identity-manager` alongside `icrc1_oracle`? The latter is faster
   to ship (admin tooling, deploy story already in place); the former
   is cleaner separation. Recommend extending `identity-manager`.

---

## 11. Files to Touch (when implementation starts)

**Canister** (`identity-manager`, new module `promotion` or extend `icrc1_oracle`):

- `src/promotion/src/lib.rs` — types, storage, `place_bid`, `get_status`, `veto`
- `src/promotion/promotion.did`
- `src/promotion/Cargo.toml`
- `dfx.json` — register the new canister
- `test/promotion.test.ts` + IDL — full coverage (place_bid happy/locked/below/vetoed, veto admin, expiry rollover)

**Frontend** (`nfid-wallet-client`):

- `packages/integration/src/lib/_ic_api/promotion.ts` / `.d.ts` — IDL bindings
- `packages/integration/src/lib/promotion/types.ts`
- `packages/integration/src/lib/promotion/promotion-service.ts` — `PromotionService` class
- `packages/integration/src/lib/promotion/index.ts` — barrel
- `packages/integration/src/lib/token/constants.ts` — add `PROMOTION_CANISTER_ID = "mpg2i-yyaaa-aaaaq-aaeka-cai"` and the NFIDW ledger constant alias
- `docs/discovery-monetization.md` — the implementation note that replaces this design doc

**Out of scope** (UI team): modal, banner, portfolio screen, error toasts.
