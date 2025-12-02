import { EVMTokenTransactionService } from "../evm-transaction.service"
import { Erc20Service } from "../erc20-abstract.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { arbitrumErc20Service } from "./arbitrum-erc20.service"

export class ArbitrumErc20TransactionService extends EVMTokenTransactionService {
  protected getChainId(): number {
    return ChainId.ARB
  }

  protected getService(): Erc20Service {
    return arbitrumErc20Service
  }
}

export const arbitrumErc20TransactionService =
  new ArbitrumErc20TransactionService()
