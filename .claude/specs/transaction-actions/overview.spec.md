# Transaction Actions — Overview

> This document is a reference overview of all transaction action types in NFID Wallet.
> It is not an implementation spec — it describes what already exists.
> For implementation specs, see the per-feature files in this directory.

| Action       | Spec file              |
| ------------ | ---------------------- |
| Send         | `send.spec.md`         |
| Receive      | `receive.spec.md`      |
| Swap         | `swap.spec.md`         |
| Convert      | `convert.spec.md`      |
| Stake        | `stake.spec.md`        |
| Redeem Stake | `redeem-stake.spec.md` |
| Bridge       | `bridge.spec.md`       |

---

## Architecture

All actions share a single **TransferMachine** (XState v4) that lives in `ProfileContext`.
The `TransferModalCoordinator` reads machine state and renders the appropriate form.
Actions are triggered by sending events to the machine from the wallet or token detail page.

**Entry point:** `features/transfer-modal/coordinator.tsx`
**Machine:** `features/transfer-modal/machine.ts`
**Types:** `features/transfer-modal/types/index.ts`

---

## Action Summary

| Action  | `ModalType` | Machine state                     | Primary service                      | Chains                   |
| ------- | ----------- | --------------------------------- | ------------------------------------ | ------------------------ |
| Send    | `SEND`      | `SendMachine.SendFT` / `.SendNFT` | ICP / ICRC1 / BTC / EVM services     | All                      |
| Receive | `RECEIVE`   | `ReceiveMachine`                  | Address hooks (display only)         | All                      |
| Swap    | `SWAP`      | `SwapMachine`                     | `swapService` / Shroff DEX           | ICP                      |
| Convert | `CONVERT`   | `ConvertMachine`                  | `bitcoinService` / `ethereumService` | BTC ↔ ckBTC, ETH ↔ ckETH |
| Stake   | `STAKE`     | `StakeMachine`                    | `stakingService`                     | ICP / SNS                |
| Redeem  | `REDEEM`    | `RedeemMachine`                   | `stake.redeem()`                     | ICP / SNS                |
| Bridge  | `BRIDGE`    | `BridgeMachine`                   | `bridgeService` (LiFi)               | EVM mainnet only         |

---

## SEND

Transfers a fungible token or NFT to an external address.

**Trigger:** `CHANGE_DIRECTION: SEND` + `ASSIGN_SELECTED_FT` from token page or vault
**Chains:** ICP, ICRC1, BTC, ETH, ERC20 (Arbitrum, Base, BNB, Polygon)
**Key files:**

- `features/transfer-modal/components/send-ft.tsx`
- `integration/ethereum/*.service.ts`, `integration/bitcoin/`

**Flow:** Enter address → enter amount → validate → fee estimation → confirm → broadcast → `TransferSuccess`

**Notable:** Vault wallet support via `isOpenedFromVaults`; address book autocomplete; memo field for ICP.

---

## RECEIVE

Displays deposit addresses for all supported chains. No transaction is executed.

**Trigger:** `CHANGE_DIRECTION: RECEIVE`
**Key files:** `features/transfer-modal/components/receive.tsx`

**Flow:** Modal opens → shows ICP principal, account ID, BTC address, ETH address.

---

## SWAP

Exchanges one ICP-ecosystem token for another via a DEX (Shroff abstraction).

**Trigger:** `CHANGE_DIRECTION: SWAP` + `ASSIGN_SELECTED_FT`
**Key files:** `features/transfer-modal/components/swap.tsx`, `integration/swap/shroff/`

**Flow:** Select pair → get quote (30 s refresh) → confirm slippage → deposit → swap → withdraw → `SwapSuccess`

**Notable:** Multi-stage (3 on-chain steps); `SwapStage` enum tracks progress; per-provider error types.

---

## CONVERT

Wraps or unwraps a native asset into its ICP twin-token equivalent.

**Trigger:** Dedicated handlers per direction (`onConvertToCkBtc`, `onConvertToEth`, etc.)
**Pairs:** BTC ↔ ckBTC, ETH ↔ ckETH (plus Sepolia testnet pairs)
**Key files:** `features/transfer-modal/components/convert.tsx`

**Flow:** Confirm amount → fetch fee (debounced 1 s) → confirm → convert → success.

---

## STAKE

Locks SNS or ICP tokens in a neuron for a chosen duration.

**Trigger:** `CHANGE_DIRECTION: STAKE` + `ASSIGN_SELECTED_FT`
**Key files:** `features/transfer-modal/components/stake.tsx`, `integration/staking/`

**Flow:** Enter amount + lock-time (months) → `StakeParamsCalculator` converts to seconds → `stakingService.stake()` → cache refresh → `TransferSuccess`.

---

## REDEEM

Dissolves a specific staked neuron and returns funds.

**Trigger:** `CHANGE_DIRECTION: REDEEM` + `ASSIGN_STAKE_ID`
**Key files:** `features/transfer-modal/components/redeem-stake.tsx`

**Flow:** Confirm redemption → `stake.redeem(identity)` → balance refresh → success.

---

## BRIDGE

Cross-chain EVM asset transfer powered by the LiFi protocol.
See **`bridge.spec.md`** for the full feature spec.

**Trigger:** `CHANGE_DIRECTION: BRIDGE` + `ASSIGN_SELECTED_FT`
**Chains:** ETH, Arbitrum, Base, Polygon (mainnet only)
**Key files:** `integration/ethereum/bridge/bridge.service.ts`, `features/transfer-modal/components/bridge.tsx`

---

## MAX Button — Cross-Action Reference

| Action  | Token type           | Amount set in input         |
| ------- | -------------------- | --------------------------- |
| Send    | ICP, ICRC1, BTC, ETH | `MAX_AMOUNT − Fee`          |
| Send    | ERC20                | `MAX_AMOUNT` (full balance) |
| Swap    | All ICP/ICRC1        | `MAX_AMOUNT` (fee included) |
| Stake   | ICP, SNS             | `MAX_AMOUNT − Fee`          |
| Convert | BTC → ckBTC          | `MAX_AMOUNT` (fee = 0)      |
| Convert | ckBTC → BTC          | `MAX_AMOUNT − Fee`          |
| Convert | ETH → ckETH          | `MAX_AMOUNT − Fee`          |
| Convert | ckETH → ETH          | `MAX_AMOUNT` (fee in ETH)   |
| Bridge  | ETH, POL (native)    | `MAX_AMOUNT` (fee included) |
| Bridge  | ERC20                | `MAX_AMOUNT` (full balance) |
| Redeem  | n/a                  | No amount input             |
| Receive | n/a                  | No amount input             |
