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
  private usdBalance: BigNumber | undefined
  private index: string | undefined
  private symbol: string
  private decimals: number
  private fee: bigint

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
  }

  async init(globalPrincipal: Principal): Promise<FT> {
    const icrc1Pair = new Icrc1Pair(this.tokenAddress, this.index)
    const [balance] = await Promise.all([
      icrc1Pair.getBalance(globalPrincipal.toText()),
    ])
    this.tokenBalance = balance
    return this
  }

  getBlockExplorerLink(): string {
    return `https://dashboard.internetcomputer.org/canister/${this.tokenAddress}`
  }

  getTokenAddress(): string {
    return this.tokenAddress
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
    const tokenAmount = exchangeRateService.parseTokenAmount(
      Number(this.tokenBalance),
      this.decimals,
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

  async getTokenRate(amount: string): Promise<number | undefined> {
    const rate = await exchangeRateService.usdPriceForICRC1(this.tokenAddress)
    if (!rate) return

    const amountBigNumber = new BigNumber(amount)
    const result = rate.multipliedBy(amountBigNumber)

    return Number(result.toFixed(2))
  }

  async getTokenRateFormatted(amount: string): Promise<string | undefined> {
    return `${(await this.getTokenRate(amount)) || "0.00"} USD`
  }

  isHideable(): boolean {
    return this.tokenCategory !== Category.Native
  }

  async getUSDBalanceFormatted(): Promise<string | undefined> {
    if (!this.usdBalance) {
      const usdPrice: BigNumber | undefined =
        await exchangeRateService.usdPriceForICRC1(this.tokenAddress)

      if (!usdPrice) {
        return undefined
      }
      const tokenAmount = exchangeRateService.parseTokenAmount(
        Number(this.tokenBalance),
        this.decimals,
      )
      this.usdBalance = tokenAmount.multipliedBy(usdPrice)
    }
    return this.usdBalance.toFixed(2) + " USD"
  }

  hideToken(): Promise<void> {
    return icrc1RegistryService.storeICRC1Canister(
      this.tokenAddress,
      State.Inactive,
    )
  }

  showToken(): Promise<void> {
    return icrc1RegistryService.storeICRC1Canister(
      this.tokenAddress,
      State.Active,
    )
  }

  getUSDBalance(): BigNumber | undefined {
    return this.usdBalance
  }

  getDecimals(): number {
    return this.decimals
  }

  getTokenFee(): bigint {
    return this.fee
  }

  getTokenFeeFormatted(): string {
    return `${Number(this.fee) / 10 ** this.decimals} ${this.symbol}`
  }

  async getTokenFeeFormattedUsd(): Promise<string | undefined> {
    const rate = await exchangeRateService.usdPriceForICRC1(this.tokenAddress)

    if (!this.fee || !this.decimals || !rate) return

    const usdPrice: BigNumber | undefined =
      await exchangeRateService.usdPriceForICRC1(this.tokenAddress)

    if (!usdPrice) return

    const feeInUsd = await this.getTokenRate(
      (Number(this.fee) / 10 ** this.decimals).toString(),
    )

    return `${feeInUsd || "0.00"} USD`
  }
}
