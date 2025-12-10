import { Erc20Service } from "frontend/integration/ethereum/erc20-abstract.service"
import { FTERC20AbstractImpl } from "./ft-erc20-abstract-impl"
import { baseErc20Service } from "frontend/integration/ethereum/base/base-erc20.service"

export class FTERC20BaseImpl extends FTERC20AbstractImpl {
  getProvider(): Erc20Service {
    return baseErc20Service
  }
}
