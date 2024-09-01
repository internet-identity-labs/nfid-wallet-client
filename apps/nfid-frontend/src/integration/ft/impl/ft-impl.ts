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
  private decimals: number | undefined
  private fee: bigint | undefined

  constructor(icrc1Token: ICRC1) {
    this.tokenAddress = icrc1Token.ledger
    this.tokenCategory = icrc1Token.category
    this.tokenName = icrc1Token.name
    this.index = icrc1Token.index
    this.logo = icrc1Token.logo
    this.symbol = icrc1Token.symbol
    this.tokenState = icrc1Token.state
  }

  async init(globalPrincipal: Principal): Promise<FT> {
    const icrc1Pair = new Icrc1Pair(this.tokenAddress, this.index)
    const [metadata, balance] = await Promise.all([
      icrc1Pair.getMetadata(),
      icrc1Pair.getBalance(globalPrincipal.toText()),
    ])
    this.tokenBalance = balance
    this.decimals = metadata.decimals
    this.fee = metadata.fee
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

  async getTokenFee(): Promise<
    | {
        raw: bigint
        formatted: string
        formattedUsd: string
      }
    | undefined
  > {
    const rate = await exchangeRateService.usdPriceForICRC1(this.tokenAddress)

    if (!this.fee || !this.decimals || !rate) return

    const usdPrice: BigNumber | undefined =
      await exchangeRateService.usdPriceForICRC1(this.tokenAddress)

    if (!usdPrice) {
      return undefined
    }

    const feeInUsd = await this.getTokenRate(
      (Number(this.fee) / 10 ** this.decimals).toString(),
    )

    return {
      raw: this.fee,
      formatted: `${Number(this.fee) / 10 ** this.decimals} ${this.symbol}`,
      formattedUsd: `${feeInUsd?.raw || "0.00"} USD`,
    }
  }

  getTokenLogo(): string | undefined {
    return this.logo
  }

  getTokenDecimals(): number | undefined {
    return this.decimals
  }

  getTokenState(): State {
    return this.tokenState
  }

  getTokenBalance(): { raw: bigint; formatted: string } | undefined {
    const tokenAmount = exchangeRateService.parseTokenAmount(
      Number(this.tokenBalance),
      this.decimals,
    )

    return this.tokenBalance
      ? {
          raw: this.tokenBalance,
          formatted:
            tokenAmount.toFormat({
              groupSeparator: "",
              decimalSeparator: ".",
            }) + ` ${this.symbol}`,
        }
      : undefined
  }

  getTokenCategory(): Category {
    return this.tokenCategory
  }

  getTokenName(): string {
    return this.tokenName
  }

  async getTokenRate(
    amount: string,
  ): Promise<{ raw: number; formatted: string } | undefined> {
    const rate = await exchangeRateService.usdPriceForICRC1(this.tokenAddress)
    if (!rate) return

    const amountBigNumber = new BigNumber(amount)
    const result = rate.multipliedBy(amountBigNumber)

    return {
      raw: Number(result.toFixed(2)),
      formatted: `${result.toFixed(2)} USD`,
    }
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
}
