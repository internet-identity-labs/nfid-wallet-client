import { Erc20Service } from "frontend/integration/ethereum/erc20-abstract.service"
import { ethErc20Service } from "frontend/integration/ethereum/eth/eth-erc20.service"

import { FTERC20AbstractImpl } from "./ft-erc20-abstract-impl"

export class FTERC20EthImpl extends FTERC20AbstractImpl {
  getProvider(): Erc20Service {
    return ethErc20Service
  }

  getBlockExplorerLink(): string {
    return `https://etherscan.io/address/${this.tokenAddress}`
  }
}
