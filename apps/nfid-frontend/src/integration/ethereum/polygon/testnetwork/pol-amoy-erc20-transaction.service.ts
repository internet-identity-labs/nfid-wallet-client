import { EVMTokenTransactionService } from "../../evm-transaction.service"
import { Erc20Service } from "../../erc20-abstract.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { polygonAmoyErc20Service } from "./pol-amoy-erc20.service"

export class PolygonAmoyErc20TransactionService extends EVMTokenTransactionService {
  protected getChainId(): number {
    return ChainId.POL_AMOY
  }

  protected getService(): Erc20Service {
    return polygonAmoyErc20Service
  }

  public getExplorerLink(txId: string): string {
    return `https://amoy.polygonscan.com/tx/${txId}`
  }
}

export const polygonAmoyErc20TransactionService =
  new PolygonAmoyErc20TransactionService()
