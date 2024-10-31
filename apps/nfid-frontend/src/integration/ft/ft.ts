import { Principal } from "@dfinity/principal"

import { Category, State } from "@nfid/integration/token/icrc1/enum/enums"

export interface FT {
  init(principal: Principal): Promise<FT>

  isInited(): boolean

  getTokenName(): string

  getTokenCategory(): Category

  getTokenCategoryFormatted(): string

  getTokenBalance(): bigint | undefined

  getTokenBalanceFormatted(): string | undefined

  getUSDBalanceFormatted(): Promise<string | undefined>

  getTokenRate(amount: string): Promise<number | undefined>

  getTokenRateFormatted(amount: string): Promise<string | undefined>

  getTokenAddress(): string

  getTokenIndex(): string | undefined

  getTokenSymbol(): string

  getTokenDecimals(): number | undefined

  getTokenLogo(): string | undefined

  getTokenState(): State

  getBlockExplorerLink(): string

  getIndexBlockExplorerLink(): string

  hideToken(): Promise<void>

  showToken(): Promise<void>

  getTokenFee(): bigint

  getTokenFeeFormatted(): string

  getTokenFeeFormattedUsd(): Promise<string | undefined>

  isHideable(): boolean
}
