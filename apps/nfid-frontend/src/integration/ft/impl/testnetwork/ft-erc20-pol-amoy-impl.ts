import { Erc20Service } from "frontend/integration/ethereum/erc20-abstract.service"
import { polygonAmoyErc20Service } from "frontend/integration/ethereum/polygon/testnetwork/pol-amoy-erc20.service"
import { FTERC20AbstractImpl } from "../ft-erc20-abstract-impl"

export class FTERC20PolAmoyImpl extends FTERC20AbstractImpl {
  getProvider(): Erc20Service {
    return polygonAmoyErc20Service
  }

  getBlockExplorerLink(): string {
    return `https://amoy.polygonscan.com/address/${this.tokenAddress}`
  }
}
