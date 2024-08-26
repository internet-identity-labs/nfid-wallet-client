import {TokenCategory} from "src/integration/ft/enum/enums";
import {Principal} from "@dfinity/principal";

export interface FT {
  init(principal: Principal): Promise<FT>

  getTokenName(): string

  getTokenCategory(): TokenCategory

  getTokenBalance(): string | undefined

  getUSDBalance(): Promise<string | undefined>

  getTokenAddress(): string

  getBlockExplorerLink(): string

  hideToken(): Promise<boolean>
  //TODO
  //getTransactionHistory(): Promise<TransactionRecord[]>

}
