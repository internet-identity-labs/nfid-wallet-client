import { EVMTokenTransactionService } from "../../evm-transaction.service"
import { Erc20Service } from "../../erc20-abstract.service"
import { ethSepoliaErc20Service } from "./eth-sepolia-erc20.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export class EthSepoliaErc20TransactionService extends EVMTokenTransactionService {
  protected getChainId(): number {
    return ChainId.ETH_SEPOLIA
  }

  protected getService(): Erc20Service {
    return ethSepoliaErc20Service
  }

  public getExplorerLink(txId: string): string {
    return `https://sepolia.etherscan.io/tx/${txId}`
  }
}

export const ethSepoliaErc20TransactionService =
  new EthSepoliaErc20TransactionService()
