import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { BridgeChain } from "./types"

export const BRIDGE_SCAN_API = "https://api.wormholescan.io/api/v1/"

export const ATTESTATION_TIMEOUT = 50 * 60000

export const FORMATTED_CHAINS: Partial<Record<ChainId, BridgeChain>> = {
  [ChainId.ETH]: "Ethereum",
  [ChainId.POL]: "Polygon",
  [ChainId.BASE]: "Base",
  [ChainId.ARB]: "Arbitrum",
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
