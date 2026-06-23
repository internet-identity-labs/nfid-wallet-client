import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export const BRIDGE_ADDRESS = "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE"

export const CHAIN_OPTIONS: { label: string; value: ChainId }[] = [
  { label: "Ethereum", value: ChainId.ETH },
  { label: "Arbitrum", value: ChainId.ARB },
  { label: "Base", value: ChainId.BASE },
  { label: "Polygon", value: ChainId.POL },
]
