import { Principal } from "@dfinity/principal"
import { FT } from "src/integration/ft/ft"

import { FTImpl } from "./ft-impl"
import {
  Erc20Service,
  ERC20TokenInfo,
} from "frontend/integration/ethereum/erc20-abstract.service"
import { ethereumService } from "frontend/integration/ethereum/eth/ethereum.service"
import { icrc1RegistryService } from "@nfid/integration/token/icrc1/service/icrc1-registry-service"
import { exchangeRateService } from "@nfid/integration"
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

    const balance = await icrc1RegistryService
      .getCanistersByRoot(globalPrincipal.toText())
      .then((contracts) =>
        contracts.filter((c) => c.network === this.tokenChainId),
      )
      .then((contracts) => contracts.map((c) => c.ledger))
      .then((addresses) =>
        this.getProvider().getMultipleTokenBalances(ethAddress, addresses),
      )
      .then(
        (balances) =>
          balances.find((b) => b.contractAddress === super.getTokenAddress())
            ?.balance,
      )

    this.tokenBalance = balance ? BigInt(balance) : undefined

    try {
      this.tokenRate = await exchangeRateService.usdPriceForERC20(
        this.tokenAddress,
      )
    } catch (e) {
      console.error("Polygon rate fetch error: ", (e as Error).message)
    }

    if (this.tokenBalance !== undefined) {
      this.inited = true
    }
  }
}
