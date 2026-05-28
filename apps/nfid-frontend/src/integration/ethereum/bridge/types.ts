import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export enum ChainMode {
  MAINNET = "Mainnet",
  TESTNET = "Testnet",
  DEVNET = "Devnet",
}

export type BridgeChain = "Ethereum" | "Polygon" | "Base" | "Arbitrum"

export type PendingBridge = {
  sourceTxHash: string
  fromChainId: ChainId
  toChainId: ChainId
}

export type EstimatedBridge = {
  sourceCost: string
  redeemCost: string
  time?: string
}

export type BridgeTransaction = {
  status: string
  sourceChain?: { chainId?: number; transaction?: { txHash?: string } }
  targetChain?: { chainId?: number }
}
