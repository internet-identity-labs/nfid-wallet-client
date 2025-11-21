import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"

import { Category, State } from "@nfid/integration/token/icrc1/enum/enums"

import { AllowanceDetailDTO } from "@nfid/integration/token/icrc1/types"
import { ChainId, FeeResponse } from "./utils"

export interface FT {
  init(principal: Principal): Promise<FT>

  isInited(): boolean

  getTokenName(): string

  getTokenCategory(): Category

  getTokenCategoryFormatted(): string

  getTokenBalance(): bigint | undefined

  getTokenBalanceFormatted(): string | undefined

  getUSDBalanceFormatted(
    formatLowAmountToFixed?: boolean,
  ): string | undefined | null

  getUSDBalance(): BigNumber | undefined

  getUSDBalanceDayChange(usdAmount?: BigNumber): BigNumber | undefined

  getTokenRate(amount: string): BigNumber | undefined | null

  getTokenRateDayChangePercent():
    | { value: string; positive: boolean }
    | undefined

  getTokenRateFormatted(
    amount: string,
    formatLowAmountToFixed?: boolean,
  ): string | undefined | null

  refreshBalance(principal: Principal): Promise<FT>

  getTokenAddress(): string

  getTokenIndex(): string | undefined

  getTokenSymbol(): string

  getTokenDecimals(): number

  getTokenLogo(): string | undefined

  getTokenState(): State

  getBlockExplorerLink(): string

  getIndexBlockExplorerLink(): string

  getChainId(): ChainId

  hideToken(): Promise<void>

  showToken(): Promise<void>

  getTokenFee(
    value?: number,
    identity?: SignIdentity,
    to?: string,
    from?: string,
  ): Promise<FeeResponse>

  getTokenFeeFormatted(fee: bigint): string

  getTokenFeeFormattedUsd(fee: bigint): string | undefined

  isHideable(): boolean

  getRootSnsCanister(): Principal | undefined

  getIcrc2Allowances(principal: Principal): Promise<Array<AllowanceDetailDTO>>

  revokeAllowance(identity: SignIdentity, spender: string): Promise<void>
}
