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
import { Category } from "@nfid/integration/token/icrc1/enum/enums"

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

  protected abstract getProvider(): Erc20Service

  async init(globalPrincipal: Principal): Promise<FT> {
    await this.getBalance(globalPrincipal)
    return this
  }

  isInited(): boolean {
    return super.isInited()
  }

  public async getBalance(globalPrincipal: Principal): Promise<void> {
    const ethAddress = await ethereumService.getQuickAddress()

    const contracts = await icrc1RegistryService.getCanistersByRoot(
      globalPrincipal.toText(),
    )

    const ledgers = contracts
      .filter((c) => c.network === this.tokenChainId)
      .map((c) => c.ledger)

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
}
