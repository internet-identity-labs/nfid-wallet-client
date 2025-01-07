import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import { FT } from "src/integration/ft/ft"

import { exchangeRateService } from "@nfid/integration"
import { Category, State } from "@nfid/integration/token/icrc1/enum/enums"
import { Icrc1Pair } from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair"
import { icrc1RegistryService } from "@nfid/integration/token/icrc1/service/icrc1-registry-service"
import { ICRC1 } from "@nfid/integration/token/icrc1/types"

export class FTImpl implements FT {
  private readonly tokenAddress: string
  private readonly tokenCategory: Category
  private readonly logo: string | undefined
  private readonly tokenName: string
  private tokenBalance: bigint | undefined
  private tokenState: State
  private tokenRate: BigNumber | undefined
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
    const [balance, rate] = await Promise.allSettled([
      icrc1Pair.getBalance(globalPrincipal.toText()),
      exchangeRateService.usdPriceForICRC1(this.tokenAddress),
    ])

    if (balance.status === "rejected") {
      console.error("Icrc1Pair error: ", balance.reason)
      return this
    }

    this.tokenBalance = balance.value

    if (rate.status === "fulfilled") {
      this.tokenRate = rate.value
    } else {
      console.error("Exchange service error: ", rate.reason)
    }

    this.inited = true
    return this
  }

  isInited(): boolean {
    return this.inited
  }

  async refreshBalance(globalPrincipal: Principal): Promise<FT> {
    const icrc1Pair = new Icrc1Pair(this.tokenAddress, this.index)
    const newBalance = await icrc1Pair.getBalance(globalPrincipal.toText())

    this.tokenBalance = newBalance

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

  getUSDBalanceFormatted(): string | undefined {
    if (!this.tokenRate) return

    const tokenAmount = exchangeRateService.parseTokenAmount(
      Number(this.tokenBalance),
      this.decimals,
    )
    const usdBalance = tokenAmount.multipliedBy(this.tokenRate)

    return usdBalance.toFixed(2) + " USD"
  }

  getTokenRate(amount: string): number | undefined {
    if (!this.tokenRate) return

    const amountBigNumber = new BigNumber(amount)
    const result = this.tokenRate.multipliedBy(amountBigNumber)

    return Number(result.toFixed(2))
  }

  getTokenRateFormatted(amount: string): string | undefined {
    return `${this.getTokenRate(amount) || "0.00"} USD`
  }

  isHideable(): boolean {
    return this.tokenCategory !== Category.Native
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
    return tokenAmount.multipliedBy(this.tokenRate)
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
    const feeInUsd = this.getTokenRate(
      (Number(this.fee) / 10 ** this.decimals).toString(),
    )

    return `${feeInUsd || "0.00"} USD`
  }
}
