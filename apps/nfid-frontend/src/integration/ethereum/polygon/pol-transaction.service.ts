import {
  ETH_DECIMALS,
  POLYGON_NATIVE_ID,
} from "@nfid/integration/token/constants"

import EthIcon from "packages/ui/src/organisms/tokens/assets/ethereum.svg"

import { EVMTransactionService } from "../evm-transaction.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export class PolygonTransactionService extends EVMTransactionService {
  protected getChainId(): number {
    return ChainId.POL
  }

  protected getCurrency(): string {
    return "POL"
  }

  protected getIcon(): string {
    return EthIcon //TODO: Add Polygon icon
  }

  protected getDecimals(): number {
    return ETH_DECIMALS
  }

  protected getCanister(): string {
    return POLYGON_NATIVE_ID
  }
}

export const polygonTransactionService = new PolygonTransactionService()
