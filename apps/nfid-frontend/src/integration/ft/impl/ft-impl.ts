import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import { FT } from "src/integration/ft/ft"
import { e8s } from "src/integration/nft/constants/constants"

import { exchangeRateService } from "@nfid/integration"
import { Category, State } from "@nfid/integration/token/icrc1/enums"
import { icrc1Service } from "@nfid/integration/token/icrc1/icrc1-service"
import { ICRC1 } from "@nfid/integration/token/icrc1/types"

export class FTImpl implements FT {
  private readonly tokenAddress: string
  private readonly tokenCategory: Category
  private readonly logo: string | undefined
  private readonly tokenName: string
  private tokenBalance: bigint | undefined
  private usdBalance: BigNumber | undefined
  private index: string | undefined
  private symbol: string
  private decimals: number | undefined

  constructor(icrc1Token: ICRC1) {
    this.tokenAddress = icrc1Token.ledger
    this.tokenCategory = icrc1Token.category
    this.tokenName = icrc1Token.name
    this.index = icrc1Token.index
    this.logo = icrc1Token.logo
    this.symbol = icrc1Token.symbol
  }

  async init(principal: Principal): Promise<FT> {
    const metadata = await icrc1Service.getICRC1Data(
      [this.tokenAddress],
      principal.toText(),
    )
    this.tokenBalance = metadata[0].balance
    this.decimals = metadata[0].decimals
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

  getTokenDecimals(): number | undefined {
    return this.decimals
  }

  getTokenBalance(): string | undefined {
    return this.tokenBalance
      ? new BigNumber(this.tokenBalance.toString())
          .dividedBy(new BigNumber(10).pow(this.decimals!))
          .toFormat({
            groupSeparator: "",
            decimalSeparator: ".",
          }) + ` ${this.symbol}`
      : undefined
  }

  getTokenCategory(): Category {
    return this.tokenCategory
  }

  getTokenName(): string {
    return this.tokenName
  }

  async getUSDBalance(): Promise<string | undefined> {
    if (!this.usdBalance) {
      const usdPrice: BigNumber | undefined =
        await exchangeRateService.usdPriceForICRC1(this.tokenAddress)
      if (!usdPrice) {
        return undefined
      }
      const tokenAmount = exchangeRateService.parseTokenAmount(
        this.tokenBalance,
        this.decimals,
      )
      console.log(tokenAmount.toNumber())
      console.log(usdPrice.toNumber())
      let a = usdPrice.multipliedBy(tokenAmount).dividedBy(e8s).toNumber()
      console.log(a)
    }
  }

  hideToken(): Promise<void> {
    return icrc1Service.changeCanisterState(this.tokenAddress, State.Inactive)
  }

  showToken(): Promise<void> {
    return icrc1Service.changeCanisterState(this.tokenAddress, State.Active)
  }

  getUSDBalanceNumber(): BigNumber | undefined {
    return this.usdBalance
  }
}
