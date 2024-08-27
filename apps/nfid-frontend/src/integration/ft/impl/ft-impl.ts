import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
// import { TokenCategory } from "src/integration/ft/enum/enums"
import { FT } from "src/integration/ft/ft"
import { e8s } from "src/integration/nft/constants/constants"

import { exchangeRateService, ICRC1TypeOracle } from "@nfid/integration"
import { Category } from "@nfid/integration/token/icrc1/enums"
import { icrc1Service } from "@nfid/integration/token/icrc1/icrc1-service"
import { ICRC1 } from "@nfid/integration/token/icrc1/types"

export class FTImpl implements FT {
  private readonly tokenAddress: string
  private readonly tokenCategory: Category
  private readonly logo: string | undefined
  private readonly tokenName: string
  private tokenBalance: bigint | undefined
  private usdBalance: string | undefined
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
          .dividedBy(this.decimals!)
          .toFormat(2, BigNumber.ROUND_DOWN, {
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
    //todo
    if (this.usdBalance) {
      const usdIcp: BigNumber = exchangeRateService.getICP2USD()
      // this.usdBalance = usdIcp
      //   .multipliedBy(this.)
      //   .dividedBy(e8s)
      //   .toNumber()
    }
    return undefined
  }

  hideToken(): Promise<boolean> {
    return Promise.resolve(false)
  }
}
