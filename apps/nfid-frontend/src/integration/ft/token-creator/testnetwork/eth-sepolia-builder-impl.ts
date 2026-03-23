import { State } from "@nfid/integration/token/icrc1/enum/enums"

import { ERC20TokenInfo } from "frontend/integration/ethereum/erc20-abstract.service"
import { FT } from "../../ft"
import { TokenBuilder } from "../token-builder"
import { FTERC20EthSepoliaImpl } from "../../impl/testnetwork/ft-erc20-eth-sepolia-impl"
import { FTEthSepoliaImpl } from "../../impl/testnetwork/ft-eth-sepolia-impl"

export class EthSepoliaTokenBuilder implements TokenBuilder {
  buildNative(state: State = State.Inactive): FT {
    return new FTEthSepoliaImpl(state)
  }

  buildTokens(tokenData: ERC20TokenInfo, state?: State): FT {
    return new FTERC20EthSepoliaImpl({
      ...tokenData,
      state: state ?? tokenData.state,
    })
  }
}
