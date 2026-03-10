import { Erc20Service } from "frontend/integration/ethereum/erc20-abstract.service"

import { arbSepoliaErc20Service } from "frontend/integration/ethereum/arbitrum/testnetwork/arb-sepolia-erc20.service"
import { FTERC20AbstractImpl } from "../ft-erc20-abstract-impl"

export class FTERC20ArbSepoliaImpl extends FTERC20AbstractImpl {
  getProvider(): Erc20Service {
    return arbSepoliaErc20Service
  }

  getBlockExplorerLink(): string {
    return `https://arbitrum-sepolia.blockscout.com/address/${this.tokenAddress}`
  }
}
