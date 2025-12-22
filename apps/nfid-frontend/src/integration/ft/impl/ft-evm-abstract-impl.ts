import { FTImpl } from "./ft-impl"
import {
  CKETH_LEDGER_CANISTER_ID,
  TRIM_ZEROS,
} from "@nfid/integration/token/constants"
import { exchangeRateService } from "@nfid/integration"
import { FT } from "../ft"
import { FeeResponseETH } from "../utils"
import { SignIdentity } from "@dfinity/agent"
import {
  EVMService,
  SendEthFee,
} from "frontend/integration/ethereum/evm.service"

export abstract class FTEvmAbstractImpl extends FTImpl {
  public abstract getProvider(): EVMService

  async init(): Promise<FT> {
    await this.getBalance()
    return this
  }

  public async getBalance(): Promise<void> {
    try {
      this.tokenBalance = await this.getProvider().getQuickBalance()
    } catch (e) {
      console.error("Ethereum balance fetch error: ", (e as Error).message)
      return
    }

    try {
      this.tokenRate = await exchangeRateService.usdPriceForICRC1(
        CKETH_LEDGER_CANISTER_ID,
      )
    } catch (e) {
      this.tokenRate = null
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

    const ethFeeData: SendEthFee = await this.getProvider().getSendEthFee(
      _to!,
      _from!,
      amount,
    )

    return new FeeResponseETH(ethFeeData)
  }
}
