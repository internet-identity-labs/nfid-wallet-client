import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import { FT } from "src/integration/ft/ft"

import { storageWithTtl } from "@nfid/client-db"
import { exchangeRateService } from "@nfid/integration"
import {
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
  CKETH_CANISTER_ID,
  ETH_NATIVE_ID,
  NFIDW_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { Category, State } from "@nfid/integration/token/icrc1/enum/enums"
import { Icrc1Pair } from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair"
import { icrc1RegistryService } from "@nfid/integration/token/icrc1/service/icrc1-registry-service"
import { ICRC1 } from "@nfid/integration/token/icrc1/types"

import {
  bitcoinService,
  BitcointNetworkFeeAndUtxos,
} from "frontend/integration/bitcoin/bitcoin.service"
import { satoshiService } from "frontend/integration/bitcoin/services/satoshi.service"
import {
  ethereumService,
  SendEthFee,
} from "frontend/integration/ethereum/ethereum.service"

import { formatUsdAmount } from "../../../util/format-usd-amount"

const ftBalanceCacheName = "FTBalance"

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
  } | null
  private index: string | undefined
  private symbol: string
  private decimals: number
  private fee: bigint
  private inited: boolean
  private rootSnsCanister: string | undefined

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
    this.rootSnsCanister = icrc1Token.rootCanisterId
  }

  private isNativeBtc(): boolean {
    return this.tokenAddress === BTC_NATIVE_ID
  }

  private isNativeEth(): boolean {
    return this.tokenAddress === ETH_NATIVE_ID
  }

  private async getNativeBtcBalance(): Promise<void> {
    try {
      this.tokenBalance = await bitcoinService.getQuickBalance()
    } catch (e) {
      console.error("BitcoinService error: ", (e as Error).message)
      return
    }

    this.tokenRate =
      await exchangeRateService.usdPriceForICRC1(CKBTC_CANISTER_ID)
  }

  private async getNativeEthBalance(): Promise<void> {
    try {
      this.tokenBalance = await ethereumService.getQuickBalance()
    } catch (e) {
      console.error("EthereumService error: ", (e as Error).message)
      return
    }

    this.tokenRate =
      await exchangeRateService.usdPriceForICRC1(CKETH_CANISTER_ID)
  }

  private async getIcrc1Balance(globalPrincipal: Principal): Promise<void> {
    const icrc1Pair = new Icrc1Pair(this.tokenAddress, this.index)

    try {
      this.tokenBalance = await icrc1Pair.getBalance(globalPrincipal.toText())
    } catch (e) {
      console.error("Icrc1Pair error: " + (e as Error).message)
      return
    }

    this.tokenRate = await exchangeRateService.usdPriceForICRC1(
      this.tokenAddress,
    )
  }

  private async getBalance(globalPrincipal: Principal): Promise<void> {
    if (this.isNativeBtc()) {
      await this.getNativeBtcBalance()
    } else if (this.isNativeEth()) {
      await this.getNativeEthBalance()
    } else {
      await this.getIcrc1Balance(globalPrincipal)
    }
    this.inited = true
  }

  private serializeBalanceData(): string {
    return JSON.stringify({
      tokenAddress: this.tokenAddress,
      tokenBalance: this.tokenBalance?.toString() || null,
      tokenRate: this.tokenRate
        ? {
            value: this.tokenRate.value.toString(),
            dayChangePercent: this.tokenRate.dayChangePercent,
            dayChangePercentPositive: this.tokenRate.dayChangePercentPositive,
          }
        : null,
      inited: this.inited,
    })
  }

  private deserializeBalanceData(serialized: string): void {
    const data = JSON.parse(serialized)
    this.tokenBalance =
      data.tokenBalance && data.tokenBalance !== null
        ? BigInt(data.tokenBalance)
        : undefined
    this.tokenRate =
      data.tokenRate && data.tokenRate !== null
        ? {
            value: new BigNumber(data.tokenRate.value),
            dayChangePercent: data.tokenRate.dayChangePercent,
            dayChangePercentPositive: data.tokenRate.dayChangePercentPositive,
          }
        : undefined
    this.inited = data.inited
  }

  async init(globalPrincipal: Principal, refetch?: boolean): Promise<FT> {
    const cacheKey = `${ftBalanceCacheName}_${this.tokenAddress}_${globalPrincipal.toText()}`
    const cache = await storageWithTtl.getEvenExpired(cacheKey)

    if (!cache || Boolean(refetch)) {
      await this.getBalance(globalPrincipal)
      storageWithTtl.set(
        cacheKey,
        this.serializeBalanceData(),
        10 * 1000, // 10 seconds cache
      )
      return this
    }

    if (cache && cache.expired) {
      // Update in background
      this.getBalance(globalPrincipal).then(() => {
        storageWithTtl.set(cacheKey, this.serializeBalanceData(), 10 * 1000)
      })

      this.deserializeBalanceData(cache.value as string)
      return this
    }

    this.deserializeBalanceData(cache.value as string)
    return this
  }

  isInited(): boolean {
    return this.inited
  }

  async refreshBalance(globalPrincipal: Principal): Promise<FT> {
    return this.init(globalPrincipal, true) // Force refetch
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

  getUSDBalanceFormatted(
    formatLowAmountToFixed = true,
  ): string | undefined | null {
    if (this.tokenRate === null) return null
    if (this.tokenRate === undefined) return

    const tokenAmount = exchangeRateService.parseTokenAmount(
      Number(this.tokenBalance),
      this.decimals,
    )
    const usdBalance = tokenAmount.multipliedBy(this.tokenRate.value)

    return formatUsdAmount(usdBalance, formatLowAmountToFixed)
  }

  getTokenRate(amount: string): BigNumber | undefined | null {
    if (this.tokenRate === null) return null
    if (this.tokenRate === undefined) return

    const amountBigNumber = new BigNumber(amount || 0)
    const result = this.tokenRate.value.multipliedBy(amountBigNumber)

    return result
  }

  getTokenRateFormatted(
    amount: string,
    formatLowAmountToFixed = true,
  ): string | undefined | null {
    const tokenRate = this.getTokenRate(amount)
    if (tokenRate === null) return null
    if (tokenRate === undefined) return undefined
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
      this.tokenAddress === NFIDW_CANISTER_ID ||
      this.tokenAddress === CKBTC_CANISTER_ID
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

  getUSDBalanceDayChange(usdAmount?: BigNumber): BigNumber | undefined {
    if (!this.tokenRate) return
    const rateChange = this.getTokenRateDayChangePercent() || {
      value: "0",
      positive: true,
    }
    let usdBalance
    if (!usdAmount) {
      usdBalance = this.getUSDBalance()
    } else {
      usdBalance = usdAmount
    }

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

  async getBTCFee(
    identity: SignIdentity,
    amount: string,
  ): Promise<BitcointNetworkFeeAndUtxos> {
    return await bitcoinService.getFee(identity, amount)
  }

  getBTCFeeFormatted(fee: bigint): string {
    return `${satoshiService.getFromSatoshis(fee)} ${this.symbol}`
  }

  getBTCFeeFormattedUsd(fee: bigint): string | undefined {
    return (
      this.getTokenRateFormatted(
        Number(satoshiService.getFromSatoshis(fee)).toString(),
      ) || undefined
    )
  }

  async getETHFee(
    to: string,
    from: string,
    value: string,
  ): Promise<SendEthFee> {
    return await ethereumService.getSendEthFee(to, from, value)
  }

  getETHFeeFormatted(fee: bigint): string {
    return `${(Number(fee) / 10 ** this.decimals).toLocaleString("en", {
      minimumFractionDigits: 0,
      maximumFractionDigits: this.decimals,
    })} ${this.symbol}`
  }

  getETHFeeFormattedUsd(fee: bigint): string | undefined {
    const feeInUsd = this.getTokenRateFormatted(
      (Number(fee) / 10 ** this.decimals).toString(),
    )

    if (!feeInUsd) return

    return feeInUsd
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

    return feeInUsd || undefined
  }

  getRootSnsCanister(): Principal | undefined {
    return this.rootSnsCanister
      ? Principal.fromText(this.rootSnsCanister)
      : undefined
  }
}
