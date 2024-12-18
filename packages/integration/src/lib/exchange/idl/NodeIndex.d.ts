import type { ActorMethod } from "@dfinity/agent"
import type { Principal } from "@dfinity/principal"

export type Address = string
export type NatResult = { ok: bigint } | { err: string }
export interface PublicPoolOverView {
  id: bigint
  token0TotalVolume: number
  volumeUSD1d: number
  volumeUSD7d: number
  token0Id: string
  token1Id: string
  token1Volume24H: number
  totalVolumeUSD: number
  sqrtPrice: number
  pool: string
  tick: bigint
  liquidity: bigint
  token1Price: number
  feeTier: bigint
  token1TotalVolume: number
  volumeUSD: number
  feesUSD: number
  token0Volume24H: number
  token1Standard: string
  txCount: bigint
  token1Decimals: number
  token0Standard: string
  token0Symbol: string
  token0Decimals: number
  token0Price: number
  token1Symbol: string
}
export interface PublicTokenOverview {
  id: bigint
  volumeUSD1d: number
  volumeUSD7d: number
  totalVolumeUSD: number
  name: string
  volumeUSD: number
  feesUSD: number
  priceUSDChange: number
  address: string
  txCount: bigint
  priceUSD: number
  standard: string
  symbol: string
}
export interface Transaction {
  to: string
  action: TransactionType
  token0Id: string
  token1Id: string
  liquidityTotal: bigint
  from: string
  hash: string
  tick: bigint
  token1Price: number
  recipient: string
  token0ChangeAmount: number
  sender: string
  liquidityChange: bigint
  token1Standard: string
  token0Fee: number
  token1Fee: number
  timestamp: bigint
  token1ChangeAmount: number
  token1Decimals: number
  token0Standard: string
  amountUSD: number
  amountToken0: number
  amountToken1: number
  poolFee: bigint
  token0Symbol: string
  token0Decimals: number
  token0Price: number
  token1Symbol: string
  poolId: string
}
export type TransactionType =
  | { decreaseLiquidity: null }
  | { claim: null }
  | { swap: null }
  | { addLiquidity: null }
  | { increaseLiquidity: null }
export interface _SERVICE {
  addOwner: ActorMethod<[Principal], undefined>
  addQuoteToken: ActorMethod<[string, boolean], undefined>
  allPoolStorage: ActorMethod<[], Array<string>>
  allTokenStorage: ActorMethod<[], Array<string>>
  allUserStorage: ActorMethod<[], Array<string>>
  batchInsert: ActorMethod<[Array<Transaction>], undefined>
  clean: ActorMethod<[], undefined>
  cycleAvailable: ActorMethod<[], NatResult>
  cycleBalance: ActorMethod<[], NatResult>
  getAllPools: ActorMethod<[], Array<PublicPoolOverView>>
  getAllTokens: ActorMethod<[], Array<PublicTokenOverview>>
  getControllers: ActorMethod<[], Array<Principal>>
  getDataQueueSize: ActorMethod<[], bigint>
  getLastDataTime: ActorMethod<[], bigint>
  getOwners: ActorMethod<[], Array<Principal>>
  getPoolQueueSize: ActorMethod<[], Array<[string, bigint]>>
  getPoolsForToken: ActorMethod<[string], Array<PublicPoolOverView>>
  getQuoteTokens: ActorMethod<[], Array<string>>
  getSyncLock: ActorMethod<[], boolean>
  getSyncStatus: ActorMethod<[], Array<[string, boolean, string]>>
  getTokenQueueSize: ActorMethod<[], Array<[string, bigint]>>
  getTotalVolumeAndUser: ActorMethod<[], [number, bigint]>
  getUserQueueSize: ActorMethod<[], Array<[string, bigint]>>
  insert: ActorMethod<[Transaction], undefined>
  poolMapping: ActorMethod<[], Array<[string, string]>>
  poolStorage: ActorMethod<[string], [] | [string]>
  setPoolSyncStatus: ActorMethod<[boolean], boolean>
  setQuoteTokens: ActorMethod<[Array<string>, boolean], undefined>
  setTokenSyncStatus: ActorMethod<[boolean], boolean>
  setUserSyncStatus: ActorMethod<[boolean], boolean>
  syncOverview: ActorMethod<[], undefined>
  tokenMapping: ActorMethod<[], Array<[string, string]>>
  tokenStorage: ActorMethod<[string], [] | [string]>
  userMapping: ActorMethod<[], Array<[string, string]>>
  userStorage: ActorMethod<[Address], [] | [string]>
}
