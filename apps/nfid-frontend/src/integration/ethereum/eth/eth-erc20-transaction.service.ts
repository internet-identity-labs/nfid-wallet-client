import { EVMTokenTransactionService } from "../evm-transaction.service"
import { Erc20Service } from "../erc20-abstract.service"
import { ethErc20Service } from "./eth-erc20.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export class EthErc20TransactionService extends EVMTokenTransactionService {
  protected getChainId(): number {
    return ChainId.ETH
  }

  protected getService(): Erc20Service {
    return ethErc20Service
  }

  public getExplorerLink(txId: string): string {
    return `https://etherscan.io/tx/${txId}`
  }
}

export const ethErc20TransactionService = new EthErc20TransactionService()
