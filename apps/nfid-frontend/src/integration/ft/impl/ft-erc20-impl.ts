import { Principal } from "@dfinity/principal"
import { FT } from "src/integration/ft/ft"

import { Category, State } from "@nfid/integration/token/icrc1/enum/enums"

import { FTImpl } from "./ft-impl"
import { ERC20TokenInfo } from "frontend/integration/ethereum/erc20.service"
import { erc20Service } from "frontend/integration/ethereum/erc20.service"
import { ethereumService } from "frontend/integration/ethereum/ethereum.service"

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
      state: State.Inactive,
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

  public async getBalance(_: Principal): Promise<void> {
    const ethAddress = await ethereumService.getQuickAddress()
    const balance = await erc20Service.getMultipleTokenBalances(ethAddress, [
      super.getTokenAddress(),
    ])
    this.tokenBalance = balance[0].balance
  }
}
