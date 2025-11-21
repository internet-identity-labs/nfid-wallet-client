import { ETH_DECIMALS, BNB_NATIVE_ID } from "@nfid/integration/token/constants"

import EthIcon from "packages/ui/src/organisms/tokens/assets/ethereum.svg"

import { EVMTransactionService } from "../evm-transaction.service"
import { BNB_CHAIN_ID } from "./bnb.service"

export class BnbTransactionService extends EVMTransactionService {
  constructor() {
    super()
  }

  protected getChainId(): number {
    return BNB_CHAIN_ID
  }

  protected getCurrency(): string {
    return "BNB"
  }

  protected getIcon(): string {
    return EthIcon //TODO: Add Arbitrum icon
  }

  protected getDecimals(): number {
    return ETH_DECIMALS
  }

  protected getCanister(): string {
    return BNB_NATIVE_ID
  }
}

export const bnbTransactionService = new BnbTransactionService()
