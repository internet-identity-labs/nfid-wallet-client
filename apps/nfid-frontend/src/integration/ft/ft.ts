import { Principal } from "@dfinity/principal"

import { State } from "@nfid/integration/token/icrc1/enum/enums"

export interface FT {
  init(principal: Principal): Promise<FT>

  getTokenName(): string

  getTokenCategory(): string

  getTokenBalanceRaw(): bigint | undefined

  getTokenBalanceFormatted(): string | undefined

  getUSDBalanceFormatted(): Promise<string | undefined>

  getTokenRateRaw(amount: string): Promise<number | undefined>

  getTokenRateFormatted(amount: string): Promise<string | undefined>

  getTokenAddress(): string

  getTokenSymbol(): string

  getTokenDecimals(): number | undefined

  getTokenLogo(): string | undefined

  getTokenState(): State

  getBlockExplorerLink(): string

  hideToken(): Promise<void>

  showToken(): Promise<void>

  getTokenFeeRaw(): bigint

  getTokenFeeFormatted(): string

  getTokenFeeFormattedUsd(): Promise<string | undefined>

  isHideable(): boolean
}
