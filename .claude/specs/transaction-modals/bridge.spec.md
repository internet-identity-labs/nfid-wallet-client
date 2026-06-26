# Bridge Action — Feature Spec

**Status:** Draft — awaiting engineer approval before execution
**Branch:** `feature/sc-19512-implement-the-ui-part-for-bridging-evm-tokens`
**Related:** `overview.spec.md`

---

## 1. Problem

NFID Wallet users hold EVM tokens across multiple networks (Ethereum, Arbitrum, Base, Polygon).
Moving assets between these chains today requires leaving the wallet and using a third-party bridge UI.
The Bridge action brings cross-chain EVM transfers natively into the wallet's unified transfer modal.

---

## 2. Scope

### In scope

- Bridge any mainnet EVM fungible token to any other mainnet EVM chain supported by LiFi
- Supported networks: **Ethereum, Arbitrum, Base, Polygon**
- Source and target token selection with LiFi-validated token lists
- Real-time quote with fee breakdown
- ERC20 approval flow (automated, pre-bridge)
- ICP chain-fusion signing (no external wallet required)
- Post-bridge balance refresh for both source and target tokens
- Success screen (amounts only, no explorer link)
- Error surfaced as dismissible toast; modal stays open for retry

### Out of scope

- Testnet networks
- Non-EVM chains (BTC, ICP native)
- NFT bridging
- BNB (not wired to `getProvider()` yet)
- Bridge status polling / in-flight tracker
- LiFi Explorer deep link on success

---

## 3. User Flow

```
Token page  ──[Bridge]──▶  Bridge modal opens
                              │
                    Source token pre-selected
                    Target token: first valid option
                              │
                    User picks target chain / token
                    User enters amount
                              │
                    Quote fetches automatically (debounced 1 s)
                    Fee breakdown displayed
                              │
                    [Confirm Bridge]
                              │
                    ┌─── ERC20 token? ─────────────────┐
                    │  Yes → approve(spender, amount)   │
                    │         wait for receipt          │
                    └───────────────────────────────────┘
                              │
                    Refresh quote (approval may have taken time)
                              │
                    Sign transaction via chain-fusion signer
                    Broadcast via Infura RPC
                    Wait for receipt
                              │
                    ┌─── Error? ──▶ toast, modal stays open
                    │
                    Success screen (source amount → target amount)
                    [Close]
                              │
                    Balance refresh (source + target tokens)
                    Target token made visible if hidden
```

---

## 4. MAX Button Behaviour

All EVM tokens in Bridge modal go through the deferred MAX flow (via `IModalType.BRIDGE`):

1. Form is set to full token balance immediately.
2. `onMaxResolved()` is called when `feeFormatted` becomes available (always `BigInt(0)` for Bridge modal), which sets `isMaxAmountRef.current = true`.
3. When `isMaxAmount = true`, `bridge.service.ts` runs a **probe quote** to measure the actual gas cost, then adjusts the amount by subtracting `gasLimit × maxFeePerGas × 1.2` from the balance (20 % buffer).
4. Native tokens (`value > 0` in probe tx): full deduction applied. ERC-20 tokens (`value = 0`): no deduction (gas is paid separately in native).

| Token type       | Amount set in input                        |
| ---------------- | ------------------------------------------ |
| Native (ETH/POL) | `balance − estimatedGas × 1.2`             |
| ERC-20           | `balance` (gas paid in native, not ERC-20) |

---

## 5. UI Components

### Bridge Form (`bridge.tsx`)

| Element               | Behaviour                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------ |
| Source token selector | Pre-filled from `selectedFT`; shows only LiFi-supported mainnet EVM tokens                 |
| Target token selector | Dropdown of `getSupportedTargetTokens()`; different chain or different token on same chain |
| Reverse button        | Swaps source ↔ target; re-fetches supported targets for new source                         |
| Amount input          | Numeric; triggers quote fetch on change (1 s debounce)                                     |
| Quote section         | Shows `amountTo`, `amountToUsd`, fee breakdown (gas, relay, protocol)                      |
| Confirm button        | Disabled while quote is loading or amount is empty/invalid                                 |
| Loading state         | Spinner overlay during quote fetch and during bridge execution                             |

### Fee Breakdown Display

Derived from `EstimatedBridge`:

| Label                | Field                          |
| -------------------- | ------------------------------ |
| You receive          | `amountTo` / `amountToUsd`     |
| Network fee (gas)    | `sourceCost` / `sourceUsdCost` |
| Total fees           | `totalUsdCost`                 |
| Protocol fees (list) | `protocolFee[]`                |

`protocolFee` is an array that maps directly from LiFi's `estimate.feeCosts[]`. Each entry:

```ts
{
  amount: string // e.g. "0.000477 USDC"
  amountUSD: string // e.g. "0.00 USD"
  name: string // e.g. "LIFI Fixed Fee", "Gas receiver fee"
  description: string // "Paid separately" when included=false, "" otherwise
  percentage: string // e.g. "0.10%" or "" if no percentage
}
```

Displayed as a scrollable list under a "Protocol fees:" heading. Each row shows `name`, `percentage`, `description`, `amount`, and `amountUSD`. Empty array renders nothing.

### Success Screen

Reuses the existing `TransferSuccess` component.

- Title: "Bridge submitted"
- Subtitle: `{amountFrom} → {amountTo}`
- No explorer link
- Close button triggers balance refresh

---

## 6. State Machine Integration

**New `ModalType`:** `BRIDGE` (already added to enum)
**New guard in `machine.ts`:** `isBridgeMachine` — routes to `BridgeMachine` state

### Context fields used by Bridge

| Field              | Purpose                                      |
| ------------------ | -------------------------------------------- |
| `selectedFT`       | Source token (`{ address, chainId }`)        |
| `selectedTargetFT` | Target token address string                  |
| `amount`           | Amount to bridge                             |
| `direction`        | Must equal `ModalType.BRIDGE`                |
| `transferObject`   | Passed to `TransferSuccess` on `ON_TRANSFER` |
| `error`            | Populated on failure                         |

### Events bridge component sends

| Event                       | When                      |
| --------------------------- | ------------------------- |
| `ASSIGN_SELECTED_FT`        | User changes source token |
| `ASSIGN_SELECTED_TARGET_FT` | User changes target token |
| `ASSIGN_AMOUNT`             | User types amount         |
| `ON_TRANSFER`               | Bridge tx confirmed       |
| `ASSIGN_ERROR`              | Bridge tx failed          |

---

## 7. Service Layer (`bridge.service.ts`)

Singleton `BridgeService` — initialized once per session via `bridgeService.init(identity)` in `wallet/index.tsx`.

### Public API

```ts
init(identity: SignIdentity): Promise<LiFiClient>
getQuote(fromChain, toChain, fromToken, toToken, fromAmount, decimals): Promise<EstimatedBridge>
bridge(): Promise<string>                      // returns tx hash
getSupportedSourceTokens(tokens): Promise<FT[]>
getSupportedTargetTokens(tokens, fromToken): FT[]
```

### Signing

Uses ICP **chain-fusion signer** — no MetaMask or browser wallet.
`chainFusionSignerService.ethSignTransaction(identity, EthSignTransactionRequest)`

### ERC20 Approval

- Skipped for native tokens (`address === EVM_ZERO_ADDRESS`)
- Checks current allowance first; skips `approve()` call if already sufficient
- Approval tx mined before proceeding to bridge tx
- Quote is re-fetched after approval (original may expire during mining)

### RPC Providers (Infura)

| Chain            | Chain ID |
| ---------------- | -------- |
| Ethereum mainnet | 1        |
| Polygon          | 137      |
| Base             | 8453     |
| Arbitrum One     | 42161    |

---

## 8. Token Filtering Rules

### Source tokens

- Must be EVM (`isEvmToken(chainId) === true`)
- Must not be testnet (`isTestnetToken(chainId) === false`)
- Must appear in LiFi's token list for that chain (cached after first load)
- Native ETH/EVM tokens always included (`address === ETH_NATIVE_ID || EVM_NATIVE`)

### Target tokens

- Must be EVM, non-testnet
- Must not be the same token on the same chain as the source
- No LiFi validation required (LiFi handles route availability at quote time)

---

## 9. Error Handling

| Error                                     | User-facing message                         |
| ----------------------------------------- | ------------------------------------------- |
| `Insufficient funds for transaction fees` | "Insufficient ETH to cover gas fees"        |
| LiFi quote unavailable                    | "No route found for this token pair"        |
| `Quote has no transactionRequest`         | "Bridge quote is invalid, please try again" |
| Broadcast / receipt failure               | "Transaction failed, please try again"      |
| Approval tx failure                       | "Token approval failed, please try again"   |

All errors surface as a **dismissible toast**; the bridge modal remains open so the user can retry or change inputs.

---

## 10. Key Files

| File                                            | Role                                                    |
| ----------------------------------------------- | ------------------------------------------------------- |
| `features/transfer-modal/components/bridge.tsx` | Bridge form UI component                                |
| `features/transfer-modal/machine.ts`            | XState machine — BridgeMachine state + guard            |
| `features/transfer-modal/coordinator.tsx`       | Renders bridge.tsx when state = BridgeMachine           |
| `features/transfer-modal/types/index.ts`        | `ModalType.BRIDGE`, context, events                     |
| `integration/ethereum/bridge/bridge.service.ts` | All bridge logic (quote, approve, execute)              |
| `integration/ethereum/bridge/types.ts`          | `EstimatedBridge`, `BridgeStatus`                       |
| `integration/ethereum/bridge/constants.ts`      | `EVM_ZERO_ADDRESS`, chain IDs                           |
| `features/wallet/index.tsx`                     | Calls `bridgeService.init(identity)` on mount           |
| `features/fungible-token/index.tsx`             | `onBridgeClick` → dispatches `CHANGE_DIRECTION: BRIDGE` |

---

## 11. Open Questions

- [ ] Should the reverse button be available when only one chain's tokens are loaded (i.e., source has no valid reverse target)?
- [ ] What is the expected UX during the approval mining step — spinner with a status label, or generic loading?
- [ ] Should `BridgeStatus` enum be used for a future polling/status-tracking screen, or is it dead code for now?
