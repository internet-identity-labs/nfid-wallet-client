import {
  ETH_DECIMALS,
  POLYGON_NATIVE_ID,
} from "@nfid/integration/token/constants"

import EthIcon from "packages/ui/src/organisms/tokens/assets/ethereum.svg"

import { EVMTransactionService } from "../evm-transaction.service"
import { POLYGON_CHAIN_ID } from "./polygon.service"

export class PolygonTransactionService extends EVMTransactionService {
  protected getChainId(): number {
    return POLYGON_CHAIN_ID
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
