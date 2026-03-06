import { EVMTokenTransactionService } from "../../evm-transaction.service"
import { Erc20Service } from "../../erc20-abstract.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { bnbTestnetErc20Service } from "./bnb-testnet-erc20.service"

export class BnbTestnetErc20TransactionService extends EVMTokenTransactionService {
  protected getChainId(): number {
    return ChainId.BNB_TESTNET
  }

  protected getService(): Erc20Service {
    return bnbTestnetErc20Service
  }

  public getExplorerLink(txId: string): string {
    return `https://testnet.bscscan.com/tx/${txId}`
  }
}

export const bnbTestnetErc20TransactionService =
  new BnbTestnetErc20TransactionService()
