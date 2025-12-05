import { Erc20Service } from "frontend/integration/ethereum/erc20-abstract.service"
import { FTERC20AbstractImpl } from "./ft-erc20-abstract-impl"
import { polygonErc20Service } from "frontend/integration/ethereum/polygon/pol-erc20.service"

export class FTERC20PolImpl extends FTERC20AbstractImpl {
  getProvider(): Erc20Service {
    return polygonErc20Service
  }
}
