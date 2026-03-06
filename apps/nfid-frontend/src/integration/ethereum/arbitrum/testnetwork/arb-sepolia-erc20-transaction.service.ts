import { EVMTokenTransactionService } from "../../evm-transaction.service"
import { Erc20Service } from "../../erc20-abstract.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { arbSepoliaErc20Service } from "./arb-sepolia-erc20.service"

export class ArbSepoliaErc20TransactionService extends EVMTokenTransactionService {
  protected getChainId(): number {
    return ChainId.ARB_SEPOLIA
  }

  protected getService(): Erc20Service {
    return arbSepoliaErc20Service
  }

  public getExplorerLink(txId: string): string {
    return `https://sepolia.arbiscan.io/tx/${txId}`
  }
}

export const arbSepoliaErc20TransactionService =
  new ArbSepoliaErc20TransactionService()
