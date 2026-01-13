import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

import { Erc20Service } from "../erc20-abstract.service"
import { EVMTokenTransactionService } from "../evm-transaction.service"

import { baseErc20Service } from "./base-erc20.service"

export class BaseErc20TransactionService extends EVMTokenTransactionService {
  protected getChainId(): number {
    return ChainId.BASE
  }

  protected getService(): Erc20Service {
    return baseErc20Service
  }

  public getExplorerLink(txId: string): string {
    return `https://basescan.org/tx/${txId}`
  }
}

export const baseErc20TransactionService = new BaseErc20TransactionService()
