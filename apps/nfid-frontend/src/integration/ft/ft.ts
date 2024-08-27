import {Principal} from "@dfinity/principal";
import {Category} from "@nfid/integration/token/icrc1/enums";

export interface FT {
  init(principal: Principal): Promise<FT>

  getTokenName(): string

  getTokenCategory(): Category

  getTokenBalance(): string | undefined

  getUSDBalanceFormatted(): Promise<string | undefined>

  getTokenAddress(): string

  getBlockExplorerLink(): string

  hideToken(): Promise<void>

  showToken(): Promise<void>

  //TODO
  //getTransactionHistory(): Promise<TransactionRecord[]>

}
