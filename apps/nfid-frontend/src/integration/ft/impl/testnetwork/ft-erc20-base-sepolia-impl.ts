import { Erc20Service } from "frontend/integration/ethereum/erc20-abstract.service"
import { baseSepoliaErc20Service } from "frontend/integration/ethereum/base/testnetwork/base-sepolia-erc20.service"
import { FTERC20AbstractImpl } from "../ft-erc20-abstract-impl"

export class FTERC20BaseSepoliaImpl extends FTERC20AbstractImpl {
  getProvider(): Erc20Service {
    return baseSepoliaErc20Service
  }

  getBlockExplorerLink(): string {
    return `https://sepolia.basescan.org/token/${this.tokenAddress}`
  }
}
