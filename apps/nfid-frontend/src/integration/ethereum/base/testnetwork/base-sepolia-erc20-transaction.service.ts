import { EVMTokenTransactionService } from "../../evm-transaction.service"
import { Erc20Service } from "../../erc20-abstract.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { baseSepoliaErc20Service } from "./base-sepolia-erc20.service"

export class BaseSepoliaErc20TransactionService extends EVMTokenTransactionService {
  protected getChainId(): number {
    return ChainId.BASE_SEPOLIA
  }

  protected getService(): Erc20Service {
    return baseSepoliaErc20Service
  }

  public getExplorerLink(txId: string): string {
    return `https://sepolia.basescan.org/tx/${txId}`
  }
}

export const baseSepoliaErc20TransactionService =
  new BaseSepoliaErc20TransactionService()
