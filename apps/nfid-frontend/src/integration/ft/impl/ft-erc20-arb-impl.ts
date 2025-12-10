import { Erc20Service } from "frontend/integration/ethereum/erc20-abstract.service"
import { FTERC20AbstractImpl } from "./ft-erc20-abstract-impl"
import { arbitrumErc20Service } from "frontend/integration/ethereum/arbitrum/arbitrum-erc20.service"

export class FTERC20ArbImpl extends FTERC20AbstractImpl {
  getProvider(): Erc20Service {
    return arbitrumErc20Service
  }
}
