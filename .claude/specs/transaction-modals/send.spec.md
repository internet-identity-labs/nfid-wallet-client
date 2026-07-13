# Send Action — Feature Spec

**Status:** Reference — documents existing behaviour
**Related:** `overview.spec.md`

---

## 1. Summary

Transfers a fungible token or NFT to an external address across all supported chains.

---

## 2. Scope

### In scope

- ICP native, ICRC1 tokens
- BTC (native)
- ETH (native) and ERC20 tokens (Arbitrum, Base, BNB, Polygon)
- NFT transfers
- Vault wallet support (`isOpenedFromVaults`)
- Address book autocomplete
- Memo field (ICP only)

### Out of scope

- Testnet tokens
- NFT batch transfers

---

## 3. User Flow

```
Token page / Vault  ──[Send]──▶  Send modal opens
                                   │
                         Source token pre-selected
                         Address input (+ address book autocomplete)
                         Amount input
                                   │
                         Fee estimation (triggered on amount change)
                         Validation
                                   │
                         [Confirm Send]
                                   │
                         Sign & broadcast via chain service
                                   │
                         ┌─── Error? ──▶ toast, modal stays open
                         │
                         TransferSuccess screen
                         [Close] → balance refresh
```

---

## 4. MAX Button Behaviour

| Token type           | Amount set in input         | How                                                                                     |
| -------------------- | --------------------------- | --------------------------------------------------------------------------------------- |
| ICP, ICRC1, BTC, ETH | `MAX_AMOUNT − Fee`          | Sets full balance first; fee fetched async; input updated to `balance − fee` on arrival |
| ERC20                | `MAX_AMOUNT` (full balance) | Fee is denominated in native ETH, not the token itself — no subtraction needed          |

**Implementation note:** `choose-from-token.tsx` handles this via the `isMaxClicked` flag. For SEND modal type, clicking Max immediately sets the input to full balance and starts a fee load; when `feeFormatted` arrives the `useEffect` at line 187 subtracts it and clears the flag. For ERC20 the effective fee in the token's own units is 0, so the result is the full balance.

---

## 5. UI Components

### Send Form

| Element          | Behaviour                                                      |
| ---------------- | -------------------------------------------------------------- |
| Token selector   | Pre-filled from `selectedFT`; switches chain service on change |
| To address input | Free text; address book autocomplete overlay                   |
| Memo input       | ICP only; optional                                             |
| Amount input     | Numeric; fee re-estimated on change                            |
| Max button       | See section 4                                                  |
| Fee display      | Shows network fee in token units and USD                       |
| Confirm button   | Disabled while fee is loading or amount/address invalid        |

---

## 6. State Machine Integration

**`ModalType`:** `SEND`
**Machine states:** `SendMachine.SendFT`, `SendMachine.SendNFT`

### Context fields

| Field            | Purpose                     |
| ---------------- | --------------------------- |
| `selectedFT`     | Source token                |
| `amount`         | Amount to send              |
| `address`        | Destination address         |
| `transferObject` | Passed to `TransferSuccess` |
| `error`          | Populated on failure        |

### Events

| Event                | When                   |
| -------------------- | ---------------------- |
| `ASSIGN_SELECTED_FT` | User changes token     |
| `ASSIGN_AMOUNT`      | User types amount      |
| `ASSIGN_ADDRESS`     | User types destination |
| `ON_TRANSFER`        | Tx confirmed           |
| `ASSIGN_ERROR`       | Tx failed              |

---

## 7. Service Layer

Chain is resolved from `selectedFT.getChainId()`:

| Chain               | Service                                          |
| ------------------- | ------------------------------------------------ |
| ICP                 | `icpService`                                     |
| ICRC1               | `icrc1Service`                                   |
| BTC                 | `bitcoinService`                                 |
| ETH native          | `ethereumService` / `evmService`                 |
| ERC20 (multi-chain) | `arbitrumErc20Service`, `baseErc20Service`, etc. |

---

## 8. Token Resolution (`resolveToken`)

`token` is resolved via a fallback chain to handle 0-balance tokens that would otherwise cause an infinite loader:

```
filteredTokens (tokens with balance)
  → initedTokens (all initialized tokens)
    → tokens (full raw list)
```

Match criteria: `token.getTokenAddress() === selected.address && token.getChainId() === selected.chainId`.

The balance-enriched version is preferred when available; a 0-balance token still resolves so the form renders correctly.

---

## 9. Key Files

| File                                                                      | Role                     |
| ------------------------------------------------------------------------- | ------------------------ |
| `features/transfer-modal/components/send-ft.tsx`                          | Send FT form UI          |
| `features/transfer-modal/components/send-nft.tsx`                         | Send NFT form UI         |
| `packages/ui/src/organisms/send-receive/components/choose-from-token.tsx` | Amount input + Max logic |
| `integration/ethereum/*.service.ts`                                       | EVM send execution       |
| `integration/bitcoin/`                                                    | BTC send execution       |
