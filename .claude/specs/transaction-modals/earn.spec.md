# Aave V3 — Integration Service

## 1. Overview

The Aave integration allows users to **supply** tokens into Aave V3 lending pools and **withdraw** them. Supplied assets earn interest (yield) in the form of aTokens that grow in balance over time.

The integration lives in `apps/nfid-frontend/src/integration/aave/`.

---

## 2. Supported Networks

| Network  | ChainId | Pool Address                                 |
| -------- | ------- | -------------------------------------------- |
| Ethereum | `1`     | `0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2` |
| Polygon  | `137`   | `0x794a61358D6845594F94dc1DB02A252b5b4814aD` |
| Arbitrum | `42161` | `0x794a61358D6845594F94dc1DB02A252b5b4814aD` |
| Base     | `8453`  | `0xA238Dd80C259a72e81d7e4664a9801593F98d1c5` |

---

## 3. File Structure

```
apps/nfid-frontend/src/integration/aave/
├── aave.service.ts   # AaveService — main service class
├── abi.ts            # Aave Pool, WETHGateway, ERC20, aToken ABIs
├── constants.ts      # Contract addresses per chain
├── types.ts          # TypeScript interfaces
└── index.ts          # Public exports
```

---

## 4. Types

```typescript
interface AaveSupplyParams {
  chainId: AaveSupportedChainId // ChainId.ETH | POL | ARB | BASE
  asset: string // ERC-20 token contract address (or WETH address for native)
  amount: string // Human-readable amount ("0.5", "100")
  isNativeToken: boolean // true for ETH/POL supply via WETHGateway
}

interface AaveWithdrawParams {
  chainId: AaveSupportedChainId
  asset: string // Underlying asset address
  amount: string // Human-readable amount or "max" for full withdrawal
  isNativeToken: boolean // true to receive native token via WETHGateway
}

interface AaveSupplyFee {
  gasUsed: bigint
  maxFeePerGas: bigint
  maxPriorityFeePerGas: bigint
  networkFee: bigint // gasUsed * maxFeePerGas (in wei)
}

interface AaveUserPosition {
  chainId: ChainId
  asset: string // Underlying asset address
  aTokenAddress: string // aToken address
  symbol: string // aToken symbol ("aEthWETH", "aPolUSDC", etc.)
  balance: bigint // Raw balance
  balanceFormatted: string // Formatted balance ("1.5234")
  decimals: number
  supplyAPY: number // Current APY in percent (e.g. 3.42)
}
```

---

## 5. Service Interface

```typescript
import { aaveService } from "frontend/integration/aave"

class AaveService {
  // Get reserve data (aToken address, APY rate)
  async getReserveData(chainId, asset): Promise<AaveReserveData>

  // Calculate supply APY from raw liquidity rate
  getSupplyAPY(currentLiquidityRate: bigint): number

  // Get all user positions with non-zero aToken balances
  async getUserPositions(identity, chainId, assets): Promise<AaveUserPosition[]>

  // Estimate gas fee for supply transaction
  async estimateSupplyFee(identity, params): Promise<AaveSupplyFee>

  // Supply tokens to Aave pool
  async supply(identity, params, fee): Promise<TransactionResponse>

  // Withdraw tokens from Aave pool
  async withdraw(identity, params, fee): Promise<TransactionResponse>
}
```

---

## 6. Frontend Flow — Supply

```
┌─────────────────────────────────────────────────────┐
│ 1. User selects token & amount                       │
│ 2. Call estimateSupplyFee() → show fee to user       │
│ 3. User confirms                                     │
│ 4. Call supply() → wait for tx                       │
│ 5. Show success / error                              │
└─────────────────────────────────────────────────────┘
```

### Example: Supply 0.1 ETH on Ethereum

```typescript
import { aaveService } from "frontend/integration/aave"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { getWalletDelegation } from "frontend/integration/facade/wallet"

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

async function supplyETH() {
  const identity = await getWalletDelegation()

  const params = {
    chainId: ChainId.ETH,
    asset: WETH,
    amount: "0.1",
    isNativeToken: true, // native ETH → goes through WETHGateway
  }

  // 1. Estimate fee
  const fee = await aaveService.estimateSupplyFee(identity, params)
  // fee.networkFee is in wei — convert to ETH for display:
  // formatUnits(fee.networkFee, 18) → "0.002341..."

  // 2. After user confirms:
  const tx = await aaveService.supply(identity, params, fee)
  // tx.hash — transaction hash for tracking
}
```

### Example: Supply 100 USDC on Polygon

```typescript
const USDC_POLYGON = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"

async function supplyUSDC() {
  const identity = await getWalletDelegation()

  const params = {
    chainId: ChainId.POL,
    asset: USDC_POLYGON,
    amount: "100",
    isNativeToken: false, // ERC-20 token
  }

  const fee = await aaveService.estimateSupplyFee(identity, params)
  const tx = await aaveService.supply(identity, params, fee)
  // ERC-20 approve is handled automatically inside supply()
}
```

---

## 7. Frontend Flow — Withdraw

```
┌─────────────────────────────────────────────────────┐
│ 1. Show user positions (getUserPositions)            │
│ 2. User selects position & amount (or "max")         │
│ 3. Call estimateSupplyFee() for withdraw gas          │
│ 4. User confirms                                     │
│ 5. Call withdraw() → wait for tx                     │
│ 6. Show success / error                              │
└─────────────────────────────────────────────────────┘
```

### Example: Withdraw all WETH on Ethereum (receive native ETH)

```typescript
async function withdrawAllETH() {
  const identity = await getWalletDelegation()

  const params = {
    chainId: ChainId.ETH,
    asset: WETH,
    amount: "max", // withdraw full balance
    isNativeToken: true, // receive native ETH
  }

  const fee = await aaveService.estimateSupplyFee(identity, params)
  const tx = await aaveService.withdraw(identity, params, fee)
}
```

### Example: Withdraw 50 USDC on Polygon

```typescript
async function withdrawUSDC() {
  const identity = await getWalletDelegation()

  const params = {
    chainId: ChainId.POL,
    asset: USDC_POLYGON,
    amount: "50",
    isNativeToken: false,
  }

  const fee = await aaveService.estimateSupplyFee(identity, params)
  const tx = await aaveService.withdraw(identity, params, fee)
}
```

---

## 8. Getting User Positions

```typescript
const COMMON_ASSETS_ETH = [
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
  "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
  "0x6B175474E89094C44Da98b954EesdeCD73BBD1F", // DAI
]

async function loadPositions() {
  const identity = await getWalletDelegation()

  const positions = await aaveService.getUserPositions(
    identity,
    ChainId.ETH,
    COMMON_ASSETS_ETH,
  )

  // positions: AaveUserPosition[]
  // Each has: symbol, balanceFormatted, supplyAPY
  // Example: { symbol: "aEthWETH", balanceFormatted: "0.1", supplyAPY: 2.34 }
}
```

---

## 9. Important Notes

1. **ERC-20 Approve** — handled automatically inside `supply()`. If allowance is insufficient, the service sends an approve transaction before supply.

2. **Native token (ETH/POL)** — uses WETHGateway contract. Set `isNativeToken: true` in params. For withdraw with `isNativeToken: true`, the service approves aToken to WETHGateway, then calls `withdrawETH`.

3. **"max" withdrawal** — pass `amount: "max"` to withdraw the full aToken balance. The service reads the current balance on-chain.

4. **Fee estimation** — `estimateSupplyFee()` uses `provider.estimateGas()`. For ERC-20 supply, the estimate may fail if the token hasn't been approved yet (gas estimation requires valid state). In that case, use a fallback gas value (e.g., `250_000` for supply, `300_000` for withdraw).

5. **APY calculation** — `getSupplyAPY()` converts the raw `currentLiquidityRate` (in RAY units, 27 decimals) to an annualized percentage using compound interest formula.

6. **Transaction signing** — all transactions are signed via IC chain-fusion signer (same as other EVM operations in the wallet).

---

## 10. Error Handling

| Scenario                  | What happens                                                      |
| ------------------------- | ----------------------------------------------------------------- |
| Insufficient balance      | `estimateGas` will revert — catch and show "Insufficient balance" |
| Approve fails             | `supply()` throws — transaction reverted                          |
| Quote expired (fee stale) | Transaction may underestimate gas — re-estimate before retry      |
| Asset not listed on Aave  | `getReserveData()` returns zero aTokenAddress                     |
| Network unavailable       | Infura provider throws — show network error                       |
