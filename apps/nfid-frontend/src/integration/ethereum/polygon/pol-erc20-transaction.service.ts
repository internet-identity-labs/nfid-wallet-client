import { EVMTokenTransactionService } from "../evm-transaction.service"
import { Erc20Service } from "../erc20-abstract.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { polygonErc20Service } from "./pol-erc20.service"

export class PolygonErc20TransactionService extends EVMTokenTransactionService {
  protected getChainId(): number {
    return ChainId.POL
  }

  protected getService(): Erc20Service {
    return polygonErc20Service
  }

  public getExplorerLink(txId: string): string {
    return `https://polygonscan.com/tx/${txId}`
  }
}

export const polygonErc20TransactionService =
  new PolygonErc20TransactionService()
