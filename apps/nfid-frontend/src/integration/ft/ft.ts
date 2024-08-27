import { Principal } from "@dfinity/principal"

import { Category } from "@nfid/integration/token/icrc1/enums"

export interface FT {
  init(principal: Principal): Promise<FT>

  getTokenName(): string

  getTokenCategory(): Category

  getTokenBalance(): string | undefined

  getUSDBalance(): Promise<string | undefined>

  getTokenAddress(): string

  getTokenSymbol(): string

  getTokenLogo(): string | undefined

  getTokenDecimals(): number | undefined

  getBlockExplorerLink(): string

  hideToken(): Promise<boolean>
  //TODO
  //getTransactionHistory(): Promise<TransactionRecord[]>
}
