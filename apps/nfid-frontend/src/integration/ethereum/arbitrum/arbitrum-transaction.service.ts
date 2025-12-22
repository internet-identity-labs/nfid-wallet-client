import { ETH_DECIMALS, EVM_NATIVE } from "@nfid/integration/token/constants"

import EthIcon from "packages/ui/src/organisms/tokens/assets/ethereum.svg"

import { EVMNativeTransactionService } from "../evm-transaction.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export class ArbitrumTransactionService extends EVMNativeTransactionService {
  protected getChainId(): number {
    return ChainId.ARB
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
    return EVM_NATIVE
  }

  public getExplorerLink(txId: string): string {
    return `https://arbiscan.io/tx/${txId}`
  }
}

export const arbitrumTransactionService = new ArbitrumTransactionService()
