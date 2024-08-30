import { Principal } from "@dfinity/principal"

import { State, Category } from "@nfid/integration/token/icrc1/enum/enums"

export interface FT {
  init(principal: Principal): Promise<FT>

  getTokenName(): string

  getTokenCategory(): Category

  getTokenBalance(): string | undefined

  getUSDBalanceFormatted(): Promise<string | undefined>

  getTokenRate(amount: string): Promise<string | undefined>

  getTokenAddress(): string

  getTokenSymbol(): string

  getTokenDecimals(): number | undefined

  getTokenFee(): bigint | undefined

  getTokenLogo(): string | undefined

  getTokenState(): State

  getBlockExplorerLink(): string

  hideToken(): Promise<void>

  showToken(): Promise<void>

  isHideable(): boolean

  //TODO
  //getTransactionHistory(): Promise<TransactionRecord[]>
}
