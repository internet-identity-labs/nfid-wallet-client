import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export const BRIDGE_SCAN_API = "https://api.wormholescan.io/api/v1/"

export const ATTESTATION_TIMEOUT = 50 * 60000

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

export const FORMATTED_CHAINS: Partial<Record<ChainId, BridgeChain>> = {
  [ChainId.ETH]: "Ethereum",
  [ChainId.POL]: "Polygon",
  [ChainId.BASE]: "Base",
  [ChainId.ARB]: "Arbitrum",
}

export type BridgeTransaction = {
  status: string
  sourceChain?: { chainId?: number; transaction?: { txHash?: string } }
  targetChain?: { chainId?: number }
}

// Wormhole protocol chain IDs — distinct from EVM chain IDs
export const BRIDGE_CHAIN_ID: Record<number, number> = {
  [ChainId.ETH]: 2,
  [ChainId.POL]: 5,
  [ChainId.BASE]: 30,
  [ChainId.ARB]: 23,
}

export const BRIDGE_TO_CHAIN_ID: Partial<Record<number, ChainId>> =
  Object.fromEntries(
    Object.entries(BRIDGE_CHAIN_ID).map(([evmId, wormholeId]) => [
      wormholeId,
      Number(evmId) as ChainId,
    ]),
  )

// Wormhole Token Bridge contract addresses (mainnet)
export const TOKEN_BRIDGE_ADDRESS: Record<number, string> = {
  [ChainId.ETH]: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
  [ChainId.POL]: "0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE",
  [ChainId.BASE]: "0x8d2de8d2f73F1F4cAB472AC9A881C9b123C79627",
  [ChainId.ARB]: "0x0b2402144Bb366A632D14B83F244D2e0e21bD39c",
}

export const TOKEN_BRIDGE_ABI = [
  "function wrapAndTransferETH(uint16 recipientChain, bytes32 recipient, uint256 arbiterFee, uint32 nonce) payable returns (uint64)",
  "function transferTokens(address token, uint256 amount, uint16 recipientChain, bytes32 recipient, uint256 arbiterFee, uint32 nonce) returns (uint64)",
  "function completeTransfer(bytes memory encodedVm)",
  "function wrappedAsset(uint16 tokenChainId, bytes32 tokenAddress) external view returns (address)",
]
