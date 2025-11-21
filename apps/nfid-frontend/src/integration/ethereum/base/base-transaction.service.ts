import { ETH_DECIMALS, BASE_NATIVE_ID } from "@nfid/integration/token/constants"

import EthIcon from "packages/ui/src/organisms/tokens/assets/ethereum.svg"

import { EVMTransactionService } from "../evm-transaction.service"
import { BASE_CHAIN_ID } from "./base.service"

export class BaseTransactionService extends EVMTransactionService {
  constructor() {
    super()
  }

  protected getChainId(): number {
    return BASE_CHAIN_ID
  }

  protected getCurrency(): string {
    return "BASE"
  }

  protected getIcon(): string {
    return EthIcon //TODO: Add Arbitrum icon
  }

  protected getDecimals(): number {
    return ETH_DECIMALS
  }

  protected getCanister(): string {
    return BASE_NATIVE_ID
  }
}

export const baseTransactionService = new BaseTransactionService()
