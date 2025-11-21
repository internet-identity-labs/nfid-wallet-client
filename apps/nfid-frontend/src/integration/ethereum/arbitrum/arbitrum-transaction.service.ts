import {
  ETH_DECIMALS,
  ARBITRUM_NATIVE_ID,
} from "@nfid/integration/token/constants"

import EthIcon from "packages/ui/src/organisms/tokens/assets/ethereum.svg"

import { EVMTransactionService } from "../evm-transaction.service"
import { ARBITRUM_CHAIN_ID } from "./arbitrum.service"

export class ArbitrumTransactionService extends EVMTransactionService {
  constructor() {
    super()
  }

  protected getChainId(): number {
    return ARBITRUM_CHAIN_ID
  }

  protected getCurrency(): string {
    return "ARB"
  }

  protected getIcon(): string {
    return EthIcon //TODO: Add Arbitrum icon
  }

  protected getDecimals(): number {
    return ETH_DECIMALS
  }

  protected getCanister(): string {
    return ARBITRUM_NATIVE_ID
  }
}

export const arbitrumTransactionService = new ArbitrumTransactionService()
