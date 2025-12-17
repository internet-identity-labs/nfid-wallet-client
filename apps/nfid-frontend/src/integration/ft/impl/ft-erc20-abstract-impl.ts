import { Principal } from "@dfinity/principal"
import { FT } from "src/integration/ft/ft"
import BigNumber from "bignumber.js"
import { FTImpl } from "./ft-impl"
import {
  Erc20Service,
  ERC20TokenInfo,
} from "frontend/integration/ethereum/erc20-abstract.service"
import { ethereumService } from "frontend/integration/ethereum/eth/ethereum.service"
import { icrc1RegistryService } from "@nfid/integration/token/icrc1/service/icrc1-registry-service"
import { Category, ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { SignIdentity } from "@dfinity/agent"
import { FeeResponseETH } from "../utils"
import {
  ETH_DECIMALS,
  EVM_NATIVE,
  TRIM_ZEROS,
} from "@nfid/integration/token/constants"
import { authState } from "packages/integration/src/lib/authentication"

export abstract class FTERC20AbstractImpl extends FTImpl {
  constructor(erc20TokenInfo: ERC20TokenInfo) {
    super({
      ledger: erc20TokenInfo.address,
      symbol: erc20TokenInfo.symbol,
      name: erc20TokenInfo.name,
      decimals: erc20TokenInfo.decimals,
      category: Category.ERC20,
      logo: erc20TokenInfo.logoURI,
      index: undefined,
      state: erc20TokenInfo.state,
      fee: BigInt(0),
      rootCanisterId: undefined,
    })
    this.tokenChainId = erc20TokenInfo.chainId
  }

  public abstract getProvider(): Erc20Service

  async init(_: Principal): Promise<FT> {
    await this.getBalance()
    return this
  }

  isInited(): boolean {
    return super.isInited()
  }

  private async getTokens(): Promise<Array<string>> {
    const contracts = await icrc1RegistryService.getStoredUserTokens()

    return contracts
      .filter((c) => c.network === this.tokenChainId && c.ledger !== EVM_NATIVE)
      .map((c) => c.ledger)
  }

  public async getBalance(): Promise<void> {
    const ethAddress = await ethereumService.getQuickAddress()
    const ledgers = await this.getTokens()

    const [balances, usdBalances] = await Promise.all([
      this.getProvider().getMultipleTokenBalances(ethAddress, ledgers),
      this.getProvider().getUSDPrices(ledgers),
    ])

    const balance = balances.find(
      (b) => b.contractAddress === super.getTokenAddress(),
    )?.balance

    const usdPrice = usdBalances.find(
      (u) => u.token === super.getTokenAddress(),
    )?.price

    this.tokenBalance = balance ? BigInt(balance) : undefined

    this.tokenRate = usdPrice
      ? {
          value: new BigNumber(usdPrice),
          // TODO: implement day change percent fetch instead of undefined
          dayChangePercent: undefined,
          dayChangePercentPositive: undefined,
        }
      : undefined

    if (this.tokenBalance !== undefined) {
      this.inited = true
    }
  }

  async getTokenFee(
    _value: number,
    _identity: SignIdentity,
    _to?: string,
    _from?: string,
    _decimals?: number,
  ): Promise<FeeResponseETH> {
    try {
      const amount = _value.toFixed(this.decimals).replace(TRIM_ZEROS, "")

      const erc20FeeData = await this.getProvider().estimateERC20Gas(
        this.tokenAddress,
        _from!,
        amount,
        _decimals!,
      )

      return new FeeResponseETH(erc20FeeData)
    } catch (e: any) {
      console.log("eeeerr", e)
      throw new Error(e)
    }
  }

  getTokenFeeFormatted(fee: bigint): string {
    return `${(Number(fee) / 10 ** ETH_DECIMALS).toLocaleString("en", {
      minimumFractionDigits: 0,
      maximumFractionDigits: this.decimals,
    })} ${this.getChainId() === ChainId.POL ? "POL" : "ETH"}`
  }

  getTokenFeeFormattedUsd(fee: bigint): string | undefined {
    const feeInUsd = this.getTokenRateFormatted(
      (Number(fee) / 10 ** this.decimals).toString(),
    )

    return feeInUsd || undefined
  }
}
