import { Principal } from "@dfinity/principal"
import { FT } from "src/integration/ft/ft"

import { Category } from "@nfid/integration/token/icrc1/enum/enums"

import { FTImpl } from "./ft-impl"
import { ERC20TokenInfo } from "frontend/integration/ethereum/erc20.service"
import { erc20Service } from "frontend/integration/ethereum/erc20.service"
import { ethereumService } from "frontend/integration/ethereum/eth/ethereum.service"
import { icrc1RegistryService } from "@nfid/integration/token/icrc1/service/icrc1-registry-service"

export class FTERC20Impl extends FTImpl {
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

  async init(globalPrincipal: Principal): Promise<FT> {
    await this.getBalance(globalPrincipal)
    return this
  }

  isInited(): boolean {
    return super.isInited()
  }

  public async getBalance(globalPrincipal: Principal): Promise<void> {
    console.debug("getBalance", globalPrincipal.toText())
    const ethAddress = await ethereumService.getQuickAddress()
    const balance = await icrc1RegistryService
      .getCanistersByRoot(globalPrincipal.toText())
      .then((contracts) =>
        contracts.filter((c) => c.network === this.tokenChainId),
      )
      .then((contracts) => contracts.map((c) => c.ledger))
      .then((addresses) =>
        erc20Service.getMultipleTokenBalances(ethAddress, addresses),
      )
      .then(
        (balances) =>
          balances.find((b) => b.contractAddress === super.getTokenAddress())
            ?.balance,
      )
    this.tokenBalance = balance ? BigInt(balance) : BigInt(0)

    if (this.tokenBalance !== undefined) {
      this.inited = true
    }
  }
}
