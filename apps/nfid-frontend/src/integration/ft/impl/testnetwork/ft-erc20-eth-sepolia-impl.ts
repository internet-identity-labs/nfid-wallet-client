import { Erc20Service } from "frontend/integration/ethereum/erc20-abstract.service"

import { ethSepoliaErc20Service } from "frontend/integration/ethereum/eth/testnetwork/eth-sepolia-erc20.service"
import { FTERC20AbstractImpl } from "../ft-erc20-abstract-impl"

export class FTERC20EthSepoliaImpl extends FTERC20AbstractImpl {
  getProvider(): Erc20Service {
    return ethSepoliaErc20Service
  }

  getBlockExplorerLink(): string {
    return `https://sepolia.etherscan.io/token/${this.tokenAddress}`
  }
}
