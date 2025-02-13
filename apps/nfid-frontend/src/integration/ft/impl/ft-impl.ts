import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import { FT } from "src/integration/ft/ft"

import { exchangeRateService } from "@nfid/integration"
import { NFIDW_CANISTER_ID } from "@nfid/integration/token/constants"
import { Category, State } from "@nfid/integration/token/icrc1/enum/enums"
import { Icrc1Pair } from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair"
import { icrc1RegistryService } from "@nfid/integration/token/icrc1/service/icrc1-registry-service"
import { ICRC1 } from "@nfid/integration/token/icrc1/types"

import { formatUsdAmount } from "../../../util/format-usd-amount"

export class FTImpl implements FT {
  private readonly tokenAddress: string
  private readonly tokenCategory: Category
  private readonly logo: string | undefined
  private readonly tokenName: string
  private tokenBalance: bigint | undefined
  private tokenState: State
  private tokenRate?: {
    value: BigNumber
    dayChangePercent?: string
    dayChangePercentPositive?: boolean
  }
  private index: string | undefined
  private symbol: string
  private decimals: number
  private fee: bigint
  private inited: boolean

  constructor(icrc1Token: ICRC1) {
    this.tokenAddress = icrc1Token.ledger
    this.tokenCategory = icrc1Token.category
    this.tokenName = icrc1Token.name
    this.index = icrc1Token.index
    this.logo = icrc1Token.logo
    this.symbol = icrc1Token.symbol
    this.decimals = icrc1Token.decimals
    this.fee = icrc1Token.fee
    this.tokenState = icrc1Token.state
    this.inited = false
  }

  async init(globalPrincipal: Principal): Promise<FT> {
    const icrc1Pair = new Icrc1Pair(this.tokenAddress, this.index)

    try {
      this.tokenBalance = await icrc1Pair.getBalance(globalPrincipal.toText())
    } catch (error) {
      console.error("Icrc1Pair error: ", error)
      return this
    }

    this.tokenRate = await exchangeRateService.usdPriceForICRC1(
      this.tokenAddress,
    )

    this.inited = true
    return this
  }

  isInited(): boolean {
    return this.inited
  }

  async refreshBalance(globalPrincipal: Principal): Promise<FT> {
    const icrc1Pair = new Icrc1Pair(this.tokenAddress, this.index)

    try {
      this.tokenBalance = await icrc1Pair.getBalance(globalPrincipal.toText())
    } catch (e) {
      console.error("Icrc1Pair error: " + (e as Error).message)
    }

    return this
  }

  getBlockExplorerLink(): string {
    return `https://dashboard.internetcomputer.org/canister/${this.tokenAddress}`
  }

  getIndexBlockExplorerLink(): string {
    return `https://dashboard.internetcomputer.org/canister/${this.index}`
  }

  getTokenAddress(): string {
    return this.tokenAddress
  }

  getTokenIndex(): string | undefined {
    return this.index
  }

  getTokenSymbol(): string {
    return this.symbol
  }

  getTokenLogo(): string | undefined {
    return this.logo
  }

  getTokenDecimals(): number {
    return this.decimals
  }

  getTokenState(): State {
    return this.tokenState
  }

  getTokenBalance(): bigint | undefined {
    return this.tokenBalance
  }

  getTokenBalanceFormatted(): string | undefined {
    if (!this.tokenBalance) return undefined
    const tokenAmount = BigNumber(this.tokenBalance.toString()).div(
      10 ** this.decimals,
    )

    return this.tokenBalance
      ? tokenAmount.toFormat({
          groupSeparator: "",
          decimalSeparator: ".",
        })
      : undefined
  }

  getTokenCategory(): Category {
    return this.tokenCategory
  }

  getTokenCategoryFormatted(): string {
    if (this.tokenCategory === "Sns") {
      return "SNS"
    }

    return this.tokenCategory.replace(/([a-z])([A-Z])/g, "$1 $2")
  }

  getTokenName(): string {
    return this.tokenName
  }

  getUSDBalanceFormatted(formatLowAmountToFixed = true): string | undefined {
    if (!this.tokenRate) return

    const tokenAmount = exchangeRateService.parseTokenAmount(
      Number(this.tokenBalance),
      this.decimals,
    )
    const usdBalance = tokenAmount.multipliedBy(this.tokenRate.value)

    return formatUsdAmount(usdBalance, formatLowAmountToFixed)
  }

  getTokenRate(amount: string): BigNumber | undefined {
    if (!this.tokenRate) return

    const amountBigNumber = new BigNumber(amount || 0)
    const result = this.tokenRate.value.multipliedBy(amountBigNumber)

    return result
  }

  getTokenRateFormatted(
    amount: string,
    formatLowAmountToFixed = true,
  ): string | undefined {
    const tokenRate = this.getTokenRate(amount)
    if (!tokenRate) return undefined
    return formatUsdAmount(tokenRate, formatLowAmountToFixed)
  }

  getTokenRateDayChangePercent():
    | { value: string; positive: boolean }
    | undefined {
    if (!this.tokenRate || !this.tokenRate.dayChangePercent) return
    return {
      positive: !!this.tokenRate.dayChangePercentPositive,
      value: this.tokenRate.dayChangePercent,
    }
  }

  isHideable(): boolean {
    return !(
      this.tokenCategory === Category.Native ||
      this.tokenAddress === NFIDW_CANISTER_ID
    )
  }

  hideToken(): Promise<void> {
    this.tokenState = State.Inactive
    return icrc1RegistryService.storeICRC1Canister(
      this.tokenAddress,
      State.Inactive,
    )
  }

  showToken(): Promise<void> {
    this.tokenState = State.Active
    return icrc1RegistryService.storeICRC1Canister(
      this.tokenAddress,
      State.Active,
    )
  }

  getUSDBalance(): BigNumber | undefined {
    if (!this.tokenRate) return
    const tokenAmount = exchangeRateService.parseTokenAmount(
      Number(this.tokenBalance),
      this.decimals,
    )
    return tokenAmount.multipliedBy(this.tokenRate.value)
  }

  getUSDBalanceDayChange(): BigNumber | undefined {
    if (!this.tokenRate) return
    const rateChange = this.getTokenRateDayChangePercent() || {
      value: "0",
      positive: true,
    }
    const usdBalance = this.getUSDBalance()
    if (!usdBalance) return

    return usdBalance
      ?.multipliedBy(
        new BigNumber(100)
          [rateChange.positive ? "plus" : "minus"](rateChange.value)
          .div(100),
      )
      .minus(usdBalance)
  }

  getDecimals(): number {
    return this.decimals
  }

  getTokenFee(): bigint {
    return this.fee
  }

  getTokenFeeFormatted(): string {
    return `${(Number(this.fee) / 10 ** this.decimals).toLocaleString("en", {
      minimumFractionDigits: 0,
      maximumFractionDigits: this.decimals,
    })} ${this.symbol}`
  }

  getTokenFeeFormattedUsd(): string | undefined {
    const feeInUsd = this.getTokenRateFormatted(
      (Number(this.fee) / 10 ** this.decimals).toString(),
    )

    return feeInUsd
  }
}
