import { Principal } from "@dfinity/principal"

import { Category, State } from "@nfid/integration/token/icrc1/enum/enums"

export interface FT {
  init(principal: Principal): Promise<FT>

  getTokenName(): string

  getTokenCategory(): Category

  getTokenBalance(): string | undefined

  getUSDBalanceFormatted(): Promise<string | undefined>

  getTokenAddress(): string

  getTokenSymbol(): string

  getTokenLogo(): string | undefined

  getTokenState(): State

  getTokenDecimals(): number | undefined

  getBlockExplorerLink(): string

  hideToken(): Promise<void>

  showToken(): Promise<void>

  //TODO
  //getTransactionHistory(): Promise<TransactionRecord[]>
}
