import { Erc20Service } from "frontend/integration/ethereum/erc20-abstract.service"
import { FTERC20AbstractImpl } from "./ft-erc20-abstract-impl"
import { bnbErc20Service } from "frontend/integration/ethereum/bnb/bnb-erc20.service"

export class FTERC20BnbImpl extends FTERC20AbstractImpl {
  getProvider(): Erc20Service {
    return bnbErc20Service
  }

  getBlockExplorerLink(): string {
    return `https://bscscan.com/address/${this.tokenAddress}`
  }
}
