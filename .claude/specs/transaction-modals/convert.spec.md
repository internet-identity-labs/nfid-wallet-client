# Convert Action — Feature Spec

**Status:** Reference — documents existing behaviour
**Related:** `overview.spec.md`

---

## 1. Summary

Wraps or unwraps a native asset into its ICP chain-key twin token equivalent (BTC ↔ ckBTC, ETH ↔ ckETH).

---

## 2. Scope

### In scope

- BTC → ckBTC
- ckBTC → BTC
- ETH → ckETH
- ckETH → ETH
- Sepolia testnet pairs (ETH Sepolia ↔ ckSepolia ETH)
- Fee estimation (debounced 1 s)

### Out of scope

- SNS or ICRC1 tokens (conversion is only for chain-key pairs)
- Partial unwrapping across multiple UTXOs (BTC side handled by minter)

---

## 3. User Flow

```
Token page  ──[Convert]──▶  Convert modal opens
                              │
                    Direction determined by trigger handler
                    (onConvertToCkBtc / onConvertToEth / etc.)
                    Source token pre-selected
                    User enters amount
                              │
                    Fee fetched (debounced 1 s)
                    Fee breakdown displayed
                              │
                    [Confirm]
                              │
                    Chain-key conversion via minter canister
                              │
                    ┌─── Error? ──▶ toast, modal stays open
                    │
                    TransferSuccess screen
                    [Close] → balance refresh
```

---

## 4. MAX Button Behaviour

| Direction   | Amount set in input         | How                                                                                                            |
| ----------- | --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| BTC → ckBTC | `MAX_AMOUNT` (full balance) | Fee is 0 for this direction (no BTC network fee deducted from input)                                           |
| ckBTC → BTC | `MAX_AMOUNT − Fee`          | BTC withdrawal fee (bitcoin network fee + ICP network fee) subtracted; fee = fixed BigInt(10) in the component |
| ETH → ckETH | `MAX_AMOUNT − Fee`          | `CKETH_NETWORK_FEE` subtracted; fee known as fixed constant                                                    |
| ckETH → ETH | `MAX_AMOUNT` (full balance) | Gas fee paid separately in ETH; ckETH input is not reduced                                                     |

**Implementation note:** `feeFormatted` in `choose-from-token.tsx` is set to `BigInt(0)` for `CONVERT_TO_CKBTC` and uses the fixed constants `CKETH_NETWORK_FEE` / `CKSEPOLIA_NETWORK_FEE` for ETH directions. The `maxHandler` then computes `balance − feeFormatted`.

---

## 5. UI Components

### Convert Form

| Element         | Behaviour                                                                 |
| --------------- | ------------------------------------------------------------------------- |
| Direction label | "BTC → ckBTC", "ckETH → ETH", etc. — not user-selectable within the modal |
| Amount input    | Numeric; fee re-estimated on change (1 s debounce)                        |
| Max button      | See section 4                                                             |
| Fee breakdown   | Shows network fee, ICP fee (for BTC), widget fee where applicable         |
| Confirm button  | Disabled while fee is loading or amount invalid                           |

---

## 6. State Machine Integration

**`ModalType`:** `CONVERT`
**Machine state:** `ConvertMachine`

Conversion direction is encoded as `IModalType` (not `ModalType`):

| `IModalType`               | Direction        |
| -------------------------- | ---------------- |
| `CONVERT_TO_CKBTC`         | BTC → ckBTC      |
| `CONVERT_TO_BTC`           | ckBTC → BTC      |
| `CONVERT_TO_CKETH`         | ETH → ckETH      |
| `CONVERT_TO_ETH`           | ckETH → ETH      |
| `CONVERT_TO_SEPOLIA_CKETH` | Sepolia ETH → ck |
| `CONVERT_TO_SEPOLIA_ETH`   | ckSepolia → ETH  |

### Context fields

| Field            | Purpose                     |
| ---------------- | --------------------------- |
| `selectedFT`     | Source token                |
| `amount`         | Amount to convert           |
| `transferObject` | Passed to `TransferSuccess` |
| `error`          | Populated on failure        |

---

## 7. Service Layer

| Direction   | Service           |
| ----------- | ----------------- |
| BTC ↔ ckBTC | `bitcoinService`  |
| ETH ↔ ckETH | `ethereumService` |

Minter canister handles the actual wrapping/unwrapping.

---

## 8. Key Files

| File                                                                      | Role                        |
| ------------------------------------------------------------------------- | --------------------------- |
| `features/transfer-modal/components/convert.tsx`                          | Convert feature component   |
| `packages/ui/src/organisms/send-receive/utils/index.ts`                   | `IModalType`, fee constants |
| `packages/ui/src/organisms/send-receive/components/choose-from-token.tsx` | Max button + fee logic      |
| `integration/bitcoin/`                                                    | BTC ↔ ckBTC minter calls    |
| `integration/ethereum/`                                                   | ETH ↔ ckETH minter calls    |
