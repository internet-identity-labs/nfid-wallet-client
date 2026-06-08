import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export const EVM_ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

export const BRIDGE_ADDRESS = "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE"

export const isBridgeTx = (to: string | undefined): boolean => {
  if (!to) return false
  return to.toLowerCase() === BRIDGE_ADDRESS.toLowerCase()
}

export const CHAIN_OPTIONS: { label: string; value: ChainId }[] = [
  { label: "Ethereum", value: ChainId.ETH },
  { label: "Arbitrum", value: ChainId.ARB },
  { label: "Base", value: ChainId.BASE },
  { label: "Polygon", value: ChainId.POL },
]
