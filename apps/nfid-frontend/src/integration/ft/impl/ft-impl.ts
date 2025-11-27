import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import { FT } from "src/integration/ft/ft"

import { exchangeRateService } from "@nfid/integration"
import {
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
  CKETH_LEDGER_CANISTER_ID,
  ETH_NATIVE_ID,
  ICP_CANISTER_ID,
  NFIDW_CANISTER_ID,
} from "@nfid/integration/token/constants"
import {
  Category,
  ChainId,
  State,
} from "@nfid/integration/token/icrc1/enum/enums"
import { Icrc1Pair } from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair"
import { icrc1RegistryService } from "@nfid/integration/token/icrc1/service/icrc1-registry-service"
import { ICRC1, AllowanceDetailDTO } from "@nfid/integration/token/icrc1/types"

import { formatUsdAmount } from "../../../util/format-usd-amount"
import { FeeResponse, FeeResponseICP } from "../utils"

export class FTImpl implements FT {
  protected readonly tokenAddress: string
  private readonly tokenCategory: Category
  private readonly logo: string | undefined
  private readonly tokenName: string
  protected tokenChainId: ChainId
  protected tokenBalance: bigint | undefined
  private tokenState: State
  protected tokenRate?: {
    value: BigNumber
    dayChangePercent?: string
    dayChangePercentPositive?: boolean
  } | null
  private index: string | undefined
  protected symbol: string
  protected decimals: number
  protected fee: bigint
  protected inited: boolean
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
    this.tokenChainId = ChainId.ICP
  }

  async init(globalPrincipal: Principal): Promise<FT> {
    await this.getBalance(globalPrincipal)
    return this
  }

  getChainId(): ChainId {
    return this.tokenChainId
  }

  isInited(): boolean {
    return this.inited
  }

  async refreshBalance(globalPrincipal: Principal): Promise<FT> {
    return this.init(globalPrincipal)
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
      this.tokenAddress === ICP_CANISTER_ID ||
      this.tokenAddress === BTC_NATIVE_ID ||
      this.tokenAddress === ETH_NATIVE_ID ||
      this.tokenAddress === NFIDW_CANISTER_ID ||
      this.tokenAddress === CKBTC_CANISTER_ID ||
      this.tokenAddress === CKETH_LEDGER_CANISTER_ID
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

  async getTokenFee(
    _value?: number,
    _identity?: SignIdentity,
    _to?: string,
    _from?: string,
  ): Promise<FeeResponse> {
    return new FeeResponseICP(this.fee)
  }

  getTokenFeeFormatted(fee: bigint): string {
    return `${(Number(fee) / 10 ** this.decimals).toLocaleString("en", {
      minimumFractionDigits: 0,
      maximumFractionDigits: this.decimals,
    })} ${this.symbol}`
  }

  getTokenFeeFormattedUsd(fee: bigint): string | undefined {
    const feeInUsd = this.getTokenRateFormatted(
      (Number(fee) / 10 ** this.decimals).toString(),
    )

    return feeInUsd || undefined
  }

  getRootSnsCanister(): Principal | undefined {
    return this.rootSnsCanister
      ? Principal.fromText(this.rootSnsCanister)
      : undefined
  }

  async getIcrc2Allowances(
    globalPrincipal: Principal,
  ): Promise<Array<AllowanceDetailDTO>> {
    const icrc1Pair = new Icrc1Pair(this.tokenAddress, this.index)
    let icrc2Allowances = await icrc1Pair.getIcrc2Allowances(globalPrincipal)
    return icrc2Allowances
  }

  async revokeAllowance(
    identity: SignIdentity,
    spender: string,
  ): Promise<void> {
    const icrc1Pair = new Icrc1Pair(this.tokenAddress, this.index)
    if (this.tokenAddress === ICP_CANISTER_ID) {
      await icrc1Pair.removeApprovalICPLedger(identity, spender)
    } else {
      await icrc1Pair.setAllowance(
        identity,
        Principal.fromText(spender),
        BigInt(0),
      )
    }
  }

  protected async getBalance(globalPrincipal: Principal): Promise<void> {
    const icrc1Pair = new Icrc1Pair(this.tokenAddress, this.index)

    try {
      this.tokenBalance = await icrc1Pair.getBalance(globalPrincipal.toText())
    } catch (e) {
      console.error("Icrc1Pair error: " + (e as Error).message)
      return
    }

    try {
      this.tokenRate = await exchangeRateService.usdPriceForICRC1(
        this.tokenAddress,
      )
    } catch (e) {
      console.error("ICRC1 rate fetch error: ", (e as Error).message)
    }

    if (this.tokenBalance !== undefined) {
      this.inited = true
    }
  }
}
