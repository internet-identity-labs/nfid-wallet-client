import { State } from "@nfid/integration/token/icrc1/enum/enums"

export interface FT {
  init(): Promise<FT>

  getTokenName(): string

  getTokenCategory(): string

  getTokenBalance(): string

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
