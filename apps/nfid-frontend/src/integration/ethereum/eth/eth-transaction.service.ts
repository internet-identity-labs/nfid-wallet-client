import { ETH_DECIMALS, ETH_NATIVE_ID } from "@nfid/integration/token/constants"
import EthIcon from "@nfid/ui/organisms/tokens/assets/ethereum.svg"

import { EVMNativeTransactionService } from "../evm-transaction.service"

export class EthTransactionService extends EVMNativeTransactionService {
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

  public getExplorerLink(txId: string): string {
    return `https://etherscan.io/tx/${txId}`
  }
}

export const ethTransactionService = new EthTransactionService()
