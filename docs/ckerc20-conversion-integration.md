# ckERC20 Conversion — Integration Service

## 1. Overview

Generic mint/withdraw flow between ERC20 tokens on Ethereum and their
chain-key counterparts (ckERC20) on the Internet Computer. Mirrors the
existing ckETH ↔ ETH service but is parameterised by the ckERC20 ledger
canister id — the same code paths handle any token registered in the
config.

Implemented entirely at the integration layer (no UI). The frontend
caller passes a ckERC20 ledger canister id and an amount; the service
resolves the underlying ERC20 contract, decimals, minter and helper
contract from a config map and runs the conversion.

Seeded with **ckUSDC** and **ckUSDT** on Ethereum mainnet.

---

## 2. File Structure

```
packages/integration/src/lib/token/
└── ckerc20.config.ts                 # Token registry + lookups

apps/nfid-frontend/src/integration/ethereum/
├── cketh.constants.ts                # CKETH_ABI + ckERC20 helper constants
└── evm.service.ts                    # convertToCkErc20 / convertFromCkErc20
                                      # + fee estimators on EVMService
```

---

## 3. Token Configuration

`packages/integration/src/lib/token/ckerc20.config.ts`

```ts
export interface CkErc20Token {
  symbol: string // e.g. "ckUSDC"
  underlyingSymbol: string // e.g. "USDC"
  ledgerCanisterId: string // ckUSDC ledger on IC
  erc20ContractAddress: string // USDC contract on Ethereum
  decimals: number // matches the ERC20 (6 for USDC/USDT)
  chainId: ChainId // ChainId.ETH (multi-chain ready)
  minterCanisterId: string // ckETH minter handles all ckERC20
  helperContractAddress: string // Ethereum helper that exposes depositErc20
  minWithdrawalAmount: bigint // ckERC20 wei
}

export const CKERC20_TOKENS: Record<string, CkErc20Token>
```

Lookups:

```ts
getCkErc20ByLedgerId(ledgerCanisterId): CkErc20Token | undefined
isCkErc20Token(ledgerCanisterId): boolean
getCkErc20ByErc20Address(erc20ContractAddress): CkErc20Token | undefined
```

`CKERC20_TOKENS` is keyed by ledger canister id, so a single string
identifier is enough for any caller.

---

## 4. Public API

All methods live on `EVMService` (`apps/nfid-frontend/src/integration/ethereum/evm.service.ts`)
and are inherited by `ethereumService`.

### 4.1 Types

```ts
export type Erc20ToCkErc20Fee = {
  approveGasUsed: bigint // gas for the ERC20 approve tx
  depositGasUsed: bigint // gas for the depositErc20 tx
  maxPriorityFeePerGas: bigint
  maxFeePerGas: bigint
  baseFeePerGas: bigint
  ethereumNetworkFee: bigint // (approveGas + depositGas) * maxFeePerGas
  amountToReceive: bigint // ckERC20 minted, in token units
}

export type CkErc20ToErc20Fee = {
  ethereumNetworkFee: bigint // wei — paid in ckETH via ICRC2 approval
  amountToReceive: bigint // ERC20 received on Ethereum, in token units
  icpNetworkFee: bigint // ckETH ledger fee × 2 (for two ICRC2 approves)
  identityLabsFee: bigint // 0.0000875% of amount, paid in ckERC20
}
```

### 4.2 Methods

```ts
// Mint ERC20 → ckERC20
getErc20ToCkErc20Fee(
  identity: SignIdentity,
  ledgerCanisterId: string,
  amount: string,
): Promise<Erc20ToCkErc20Fee>

convertToCkErc20(
  identity: SignIdentity,
  ledgerCanisterId: string,
  amount: string,
  fee: Erc20ToCkErc20Fee,
): Promise<TransactionResponse>

// Withdraw ckERC20 → ERC20
getCkErc20ToErc20Fee(
  ledgerCanisterId: string,
  amount: string,
): Promise<CkErc20ToErc20Fee>

convertFromCkErc20(
  identity: SignIdentity,
  ledgerCanisterId: string,
  address: Address,
  amount: string,
): Promise<CkEthMinterDid.RetrieveErc20Request>
```

`amount` is a human-readable string (e.g. `"100.5"`); the service applies
`parseUnits(amount, token.decimals)` internally.

---

## 5. Mint Flow (ERC20 → ckERC20)

```
1. (Fee) eth_estimateGas for approve(helper, amount) on the ERC20 contract
2. (Fee) eth_estimateGas for depositErc20(...) on the helper contract
         — falls back to a constant if the user hasn't approved yet
3. Read current ERC20 allowance(user, helper)
4. If allowance < amount: sign + broadcast approve(helper, amount)
5. Sign + broadcast helper.depositErc20(erc20, amount, principalHex, 0x00…00)
6. Minter observes the on-chain event and mints ckERC20 1:1 to the
   caller's principal
```

The deposit transaction sends no ETH (`value: 0`); the helper contract
pulls the tokens via `transferFrom`.

---

## 6. Withdraw Flow (ckERC20 → ERC20)

```
1. Validate amount ≥ token.minWithdrawalAmount
2. ICRC2 approve(ckERC20 ledger, minter, amount)
3. Query minter.eip1559TransactionPrice({ ckErc20LedgerId })
   → max_transaction_fee in wei
4. ICRC2 approve(ckETH ledger, minter, max_transaction_fee)
   — covers the Ethereum gas the minter will spend on the user's behalf
5. minter.withdrawErc20({ address, amount, ledgerCanisterId })
   → RetrieveErc20Request
6. ICRC1 transfer(identityLabsFee, ckERC20 ledger, NFID_WALLET_CANISTER)
   — NFID's 0.0000875% fee, fire-and-forget
```

The user pays in **three buckets** for a withdrawal:

- `amount` ckERC20 → burned by the minter, equivalent ERC20 sent on Ethereum
- `max_transaction_fee` ckETH → burned by the minter to pay Ethereum gas
- `identityLabsFee` ckERC20 → transferred to NFID

---

## 7. Adding a New ckERC20 Token

Single edit in `ckerc20.config.ts` — no service changes:

```ts
const CKLINK_LEDGER_CANISTER_ID = "g4tto-rqaaa-aaaar-qageq-cai"

export const CKERC20_TOKENS: Record<string, CkErc20Token> = {
  // …existing entries…
  [CKLINK_LEDGER_CANISTER_ID]: {
    symbol: "ckLINK",
    underlyingSymbol: "LINK",
    ledgerCanisterId: CKLINK_LEDGER_CANISTER_ID,
    erc20ContractAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    decimals: 18,
    chainId: ChainId.ETH,
    minterCanisterId: CKETH_MINTER_CANISTER_ID,
    helperContractAddress: MINTER_ADDRESS,
    minWithdrawalAmount: BigInt("100000000000000000"), // 0.1 LINK
  },
}
```

For another chain (e.g. ckLINK on Arbitrum once supported), set
`chainId` accordingly and call the methods on the matching EVM service
(`arbitrumService.convertToCkErc20(...)`).

---

## 8. Notes & Constraints

- **Minter is shared.** All ckERC20 tokens on Ethereum mainnet are
  handled by the ckETH minter (`sv3dd-oaaaa-aaaar-qacoa-cai`). The helper
  contract on Ethereum (`MINTER_ADDRESS`) is the same one used for ckETH
  deposits — `depositEth` and `depositErc20` live on it.

- **Deposit gas estimation falls back.** When the user hasn't approved
  the helper yet, `eth_estimateGas` for `depositErc20` reverts because
  the inner `transferFrom` would fail. The service falls back to
  `CKERC20_DEPOSIT_FALLBACK_GAS` (150 000) so a fee can still be shown.
  Real gas after the approve usually lands in the 80–110k range.

- **identityLabsFee formula is shared with ckETH.** The 0.0000875%
  formula was sized for ckETH (18 decimals). For 6-decimal tokens
  (USDC, USDT) the fee rounds to dust amounts (≈ 8.75e-6 USDC on 100
  USDC). Adjust the formula if a different revenue model is needed for
  ckERC20.

- **No retry on price drift.** `eip1559TransactionPrice` is queried once,
  approved exactly, and then `withdrawErc20` is called. If Ethereum gas
  spikes between the query and the minter's execution, the withdrawal
  may fail with an insufficient-allowance error — the user must retry.

- **Withdrawal address is not validated.** Callers are expected to
  pass an already-validated Ethereum address. The minter will reject
  invalid input.

- **Mint is 1:1.** The minter does not take an ERC20-side fee on
  deposit; `amountToReceive` in the mint fee equals the input amount.
  All cost is in Ethereum gas (ETH).
