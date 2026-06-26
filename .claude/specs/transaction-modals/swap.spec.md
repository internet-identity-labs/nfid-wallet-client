# Swap Action — Feature Spec

**Status:** Reference — documents existing behaviour
**Related:** `overview.spec.md`

---

## 1. Summary

Exchanges one ICP-ecosystem token for another via a DEX aggregator (Shroff abstraction over KongSwap and ICPSwap).

---

## 2. Scope

### In scope

- ICP, ICRC1 tokens on the ICP chain
- Two DEX providers: KongSwap, ICPSwap (Shroff selects best route)
- Real-time quote with 30 s auto-refresh
- Slippage tolerance setting
- Multi-stage progress tracking (`SwapStage` enum)

### Out of scope

- EVM tokens (ETH, ERC20, BTC)
- Cross-chain swaps
- Limit orders

---

## 3. User Flow

```
Token page  ──[Swap]──▶  Swap modal opens
                           │
                 Source token pre-selected
                 User picks target token
                 User enters amount
                           │
                 Quote fetches (30 s refresh)
                 Fee breakdown displayed
                           │
                 [Confirm Swap]
                           │
                 Stage 1: Deposit (transfer to DEX canister)
                 Stage 2: Swap (DEX executes trade)
                 Stage 3: Withdraw (transfer back to wallet)
                           │
                 ┌─── Error? ──▶ error modal with stage-specific message
                 │               (WithdrawError offers "Complete swap" retry)
                 │
                 SwapSuccess screen
                 [Close] → balance refresh
```

---

## 4. MAX Button Behaviour

| Token type    | Amount set in input         | How                                                                                                                                                                                                                           |
| ------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All ICP/ICRC1 | `MAX_AMOUNT` (full balance) | The fee (network fee × 3 + widget fee) is **included** in the amount — it is deducted from what the DEX receives, not subtracted from the input. `getMaxAmountFee()` computes the total cost already embedded in the balance. |

The user's input equals their full balance; the DEX receives `balance − total_fees`. This is distinct from SEND where the input itself is reduced.

---

## 5. UI Components

### Swap Form

| Element             | Behaviour                                                             |
| ------------------- | --------------------------------------------------------------------- |
| Source token        | Pre-filled from `selectedFT`; shows ICP-ecosystem tokens only         |
| Target token        | Dropdown of tokens available to swap via `getTokensAvailableToSwap()` |
| Amount input (from) | Numeric; triggers quote fetch on change                               |
| Max button          | See section 4                                                         |
| Quote display       | Shows estimated output amount, exchange rate, price impact            |
| Slippage control    | Percentage input; defaults to configured tolerance                    |
| Fee breakdown       | Network fee, widget fee                                               |
| Confirm button      | Disabled while quote is loading                                       |
| Stage progress      | Shows current `SwapStage` label during execution                      |

---

## 6. State Machine Integration

**`ModalType`:** `SWAP`
**Machine state:** `SwapMachine`

### Context fields

| Field              | Purpose                 |
| ------------------ | ----------------------- |
| `selectedFT`       | Source token            |
| `selectedTargetFT` | Target token address    |
| `amount`           | Amount to swap          |
| `transferObject`   | Passed to `SwapSuccess` |
| `error`            | Populated on failure    |

### Events

| Event                       | When                      |
| --------------------------- | ------------------------- |
| `ASSIGN_SELECTED_FT`        | User changes source token |
| `ASSIGN_SELECTED_TARGET_FT` | User changes target token |
| `ASSIGN_AMOUNT`             | User types amount         |
| `ON_TRANSFER`               | Swap completed            |
| `ASSIGN_ERROR`              | Swap failed               |

---

## 7. Service Layer

`swapService` delegates to a `Shroff` implementation selected per token pair:

- `ShroffIcpSwapImpl` — ICPSwap DEX
- `KongSwapShroffImpl` — KongSwap DEX

Multi-stage execution: deposit → swap → withdraw. Each stage is tracked by `SwapStage`.

### Error types

| Error class           | Stage    | Button text     |
| --------------------- | -------- | --------------- |
| `DepositError`        | Deposit  | Close           |
| `SwapError`           | Swap     | Close           |
| `SlippageSwapError`   | Swap     | Close           |
| `WithdrawError`       | Withdraw | Complete swap   |
| `ContactSupportError` | Any      | Contact support |

---

## 8. Key Files

| File                                                         | Role                            |
| ------------------------------------------------------------ | ------------------------------- |
| `features/transfer-modal/components/swap.tsx`                | Swap form UI                    |
| `packages/ui/src/organisms/send-receive/components/swap.tsx` | Swap UI organism                |
| `integration/swap/shroff/`                                   | DEX abstraction layer           |
| `packages/ui/src/organisms/send-receive/utils/index.ts`      | `getMaxAmountFee`, `IModalType` |
