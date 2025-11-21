import { Category, State } from "@nfid/integration/token/icrc1/enum/enums"
import EthIcon from "packages/ui/src/organisms/tokens/assets/ethereum.svg"

import { FTImpl } from "./ft-impl"
import {
  ethereumService,
  SendEthFee,
} from "frontend/integration/ethereum/ethereum.service"
import {
  CKETH_LEDGER_CANISTER_ID,
  ETH_DECIMALS,
  ETH_NATIVE_ID,
  TRIM_ZEROS,
} from "@nfid/integration/token/constants"
import { exchangeRateService } from "@nfid/integration"
import { FT } from "../ft"
import { ChainId, FeeResponseETH } from "../utils"
import { SignIdentity } from "@dfinity/agent"

export class FTETHImpl extends FTImpl {
  constructor() {
    super({
      ledger: ETH_NATIVE_ID,
      symbol: "ETH",
      name: "Ethereum",
      decimals: ETH_DECIMALS,
      category: Category.Native,
      logo: EthIcon,
      index: undefined,
      state: State.Active,
      fee: BigInt(0),
      rootCanisterId: undefined,
    })
    this.tokenChainId = ChainId.ETH
  }

  async init(): Promise<FT> {
    await this.getBalance()
    return this
  }

  public async getBalance(): Promise<void> {
    try {
      this.tokenBalance = await ethereumService.getQuickBalance()
    } catch (e) {
      console.error("EthereumService error: ", (e as Error).message)
      return
    }

    try {
      this.tokenRate = await exchangeRateService.usdPriceForICRC1(
        CKETH_LEDGER_CANISTER_ID,
      )
    } catch (e) {
      console.error("Ethereum rate fetch error: ", (e as Error).message)
    }

    if (this.tokenBalance !== undefined) {
      this.inited = true
    }
  }

  async getTokenFee(
    _value: number,
    _identity: SignIdentity,
    _to?: string,
    _from?: string,
  ): Promise<FeeResponseETH> {
    const amount = _value.toFixed(this.decimals).replace(TRIM_ZEROS, "")

    const ethFeeData: SendEthFee = await ethereumService.getSendEthFee(
      _to!,
      _from!,
      amount,
    )

    return new FeeResponseETH(ethFeeData)
  }
}
