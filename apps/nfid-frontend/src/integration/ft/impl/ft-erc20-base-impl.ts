import { baseErc20Service } from "frontend/integration/ethereum/base/base-erc20.service"
import { Erc20Service } from "frontend/integration/ethereum/erc20-abstract.service"

import { FTERC20AbstractImpl } from "./ft-erc20-abstract-impl"

export class FTERC20BaseImpl extends FTERC20AbstractImpl {
  getProvider(): Erc20Service {
    return baseErc20Service
  }

  getBlockExplorerLink(): string {
    return `https://basescan.org/address/${this.tokenAddress}`
  }
}
