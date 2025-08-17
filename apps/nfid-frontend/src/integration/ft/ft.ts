import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"

import { Category, State } from "@nfid/integration/token/icrc1/enum/enums"

import { BitcointNetworkFeeAndUtxos } from "../bitcoin/bitcoin.service"

export interface FT {
  init(principal: Principal): Promise<FT>

  isInited(): boolean

  getTokenName(): string

  getTokenCategory(): Category

  getTokenCategoryFormatted(): string

  getTokenBalance(): bigint | undefined

  getTokenBalanceFormatted(): string | undefined

  getUSDBalanceFormatted(formatLowAmountToFixed?: boolean): string | undefined

  getUSDBalance(): BigNumber | undefined

  getUSDBalanceDayChange(usdAmount?: BigNumber): BigNumber | undefined

  getTokenRate(amount: string): BigNumber | undefined

  getTokenRateDayChangePercent():
    | { value: string; positive: boolean }
    | undefined

  getTokenRateFormatted(
    amount: string,
    formatLowAmountToFixed?: boolean,
  ): string | undefined

  refreshBalance(principal: Principal): Promise<FT>

  getTokenAddress(): string

  getTokenIndex(): string | undefined

  getTokenSymbol(): string

  getTokenDecimals(): number

  getTokenLogo(): string | undefined

  getTokenState(): State

  getBlockExplorerLink(): string

  getIndexBlockExplorerLink(): string

  hideToken(): Promise<void>

  showToken(): Promise<void>

  getTokenFee(): bigint

  getTokenFeeFormatted(): string

  getBTCFee(
    identity: SignIdentity,
    amount: string,
  ): Promise<BitcointNetworkFeeAndUtxos>

  getETHFee(to: string, value: string): Promise<bigint>

  getBTCFeeFormatted(fee: bigint): string

  getBTCFeeFormattedUsd(fee: bigint): string | undefined

  getETHFeeFormatted(fee: bigint): string

  getETHFeeFormattedUsd(fee: bigint): string | undefined

  getTokenFeeFormattedUsd(): string | undefined

  isHideable(): boolean

  getRootSnsCanister(): Principal | undefined
}
