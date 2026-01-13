import { State } from "@nfid/integration/token/icrc1/enum/enums"

import { ERC20TokenInfo } from "frontend/integration/ethereum/erc20-abstract.service"

import { FT } from "../ft"
import { FTERC20EthImpl } from "../impl/ft-erc20-eth-impl"
import { FTEthereumImpl } from "../impl/ft-eth-impl"

import { TokenBuilder } from "./token-builder"

export class EthereumTokenBuilder implements TokenBuilder {
  buildNative(): FT {
    return new FTEthereumImpl()
  }

  buildTokens(tokenData: ERC20TokenInfo, state?: State): FT {
    return new FTERC20EthImpl({
      ...tokenData,
      state: state ?? tokenData.state,
    })
  }
}
