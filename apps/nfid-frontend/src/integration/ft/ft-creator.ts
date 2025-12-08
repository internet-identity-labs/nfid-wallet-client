import { ChainId, State } from "@nfid/integration/token/icrc1/enum/enums"
import { FTArbitrumImpl } from "./impl/ft-arb-impl"
import { FTBaseImpl } from "./impl/ft-base-impl"
import { FTBnbImpl } from "./impl/ft-bnb-impl"
import { FTBitcoinImpl } from "./impl/ft-btc-impl"
import { FTEthereumImpl } from "./impl/ft-eth-impl"
import { FTPolygonImpl } from "./impl/ft-pol-impl"
import { FTERC20EthImpl } from "./impl/ft-erc20-eth-impl"
import { FTERC20PolImpl } from "./impl/ft-erc20-pol-impl"
import { FTERC20ArbImpl } from "./impl/ft-erc20-arb-impl"
import { FTERC20BaseImpl } from "./impl/ft-erc20-base-impl"
import { FTERC20BnbImpl } from "./impl/ft-erc20-bnb-impl"
import { FTImpl } from "./impl/ft-impl"
import { FT } from "./ft"

type TokenParams = {
  type: "native" | "erc20" | "icrc1"
  chainId?: ChainId
  canister?: any
  tokenData?: any
  state?: State
}

export class FTCreator {
  static createToken(params: TokenParams): FT {
    switch (params.type) {
      case "native":
        switch (params.chainId) {
          case ChainId.ETH:
            return new FTEthereumImpl()
          case ChainId.BTC:
            return new FTBitcoinImpl()
          case ChainId.POL:
            return new FTPolygonImpl(params.state ?? State.Inactive)
          case ChainId.ARB:
            return new FTArbitrumImpl(params.state ?? State.Inactive)
          case ChainId.BASE:
            return new FTBaseImpl(params.state ?? State.Inactive)
          case ChainId.BNB:
            return new FTBnbImpl(params.state ?? State.Inactive)
          default:
            throw new Error(`Unknown native chainId: ${params.chainId}`)
        }

      case "erc20":
        switch (params.chainId) {
          case ChainId.ETH:
            return new FTERC20EthImpl({
              ...params.tokenData,
              state: params.state ?? params.tokenData.state,
            })
          case ChainId.POL:
            return new FTERC20PolImpl({
              ...params.tokenData,
              state: params.state ?? params.tokenData.state,
            })
          case ChainId.ARB:
            return new FTERC20ArbImpl({
              ...params.tokenData,
              state: params.state ?? params.tokenData.state,
            })
          case ChainId.BASE:
            return new FTERC20BaseImpl({
              ...params.tokenData,
              state: params.state ?? params.tokenData.state,
            })
          case ChainId.BNB:
            return new FTERC20BnbImpl({
              ...params.tokenData,
              state: params.state ?? params.tokenData.state,
            })
          default:
            throw new Error(`Unknown ERC20 chainId: ${params.chainId}`)
        }

      case "icrc1":
        return new FTImpl(params.canister)

      default:
        throw new Error(`Unknown token type: ${params.type}`)
    }
  }
}
