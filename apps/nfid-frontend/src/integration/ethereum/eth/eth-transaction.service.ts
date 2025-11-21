import { ETH_DECIMALS, ETH_NATIVE_ID } from "@nfid/integration/token/constants"

import EthIcon from "packages/ui/src/organisms/tokens/assets/ethereum.svg"

import { EVMTransactionService } from "../evm-transaction.service"

export class EthTransactionService extends EVMTransactionService {
  protected getChainId(): number {
    return 1
  }

  protected getCurrency(): string {
    return "ETH"
  }

  protected getIcon(): string {
    return EthIcon
  }

  protected getDecimals(): number {
    return ETH_DECIMALS
  }

  protected getCanister(): string {
    return ETH_NATIVE_ID
  }
}

export const ethTransactionService = new EthTransactionService()
