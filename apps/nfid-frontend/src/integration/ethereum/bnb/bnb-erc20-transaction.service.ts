import { EVMTokenTransactionService } from "../evm-transaction.service"
import { Erc20Service } from "../erc20-abstract.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { bnbErc20Service } from "./bnb-erc20.service"

export class BnbErc20TransactionService extends EVMTokenTransactionService {
  protected getChainId(): number {
    return ChainId.BNB
  }

  protected getService(): Erc20Service {
    return bnbErc20Service
  }
}

export const bnbErc20TransactionService = new BnbErc20TransactionService()
