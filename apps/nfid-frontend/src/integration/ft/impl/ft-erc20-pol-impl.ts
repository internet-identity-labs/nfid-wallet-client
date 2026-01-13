import { Erc20Service } from "frontend/integration/ethereum/erc20-abstract.service"
import { polygonErc20Service } from "frontend/integration/ethereum/polygon/pol-erc20.service"

import { FTERC20AbstractImpl } from "./ft-erc20-abstract-impl"

export class FTERC20PolImpl extends FTERC20AbstractImpl {
  getProvider(): Erc20Service {
    return polygonErc20Service
  }

  getBlockExplorerLink(): string {
    return `https://polygonscan.com/address/${this.tokenAddress}`
  }
}
