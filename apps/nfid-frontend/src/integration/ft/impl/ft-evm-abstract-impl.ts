import { Principal } from "@dfinity/principal"
import { SignIdentity } from "@dfinity/agent"
import { FTImpl } from "./ft-impl"
import {
  CKETH_LEDGER_CANISTER_ID,
  TRIM_ZEROS,
} from "@nfid/integration/token/constants"
import { exchangeRateService } from "@nfid/integration"
import { FT } from "../ft"
import { FeeResponseETH } from "../utils"
import {
  EVMService,
  SendEthFee,
} from "frontend/integration/ethereum/evm.service"
import { AllowanceDetailDTO } from "@nfid/integration/token/icrc1/types"

export abstract class FTEvmAbstractImpl extends FTImpl {
  public abstract getProvider(): EVMService

  async init(_principal: Principal, viewOnlyAddress?: string): Promise<FT> {
    await this.fetchEvmBalance(viewOnlyAddress)
    return this
  }

  public async fetchEvmBalance(viewOnlyAddress?: string): Promise<void> {
    try {
      this.tokenBalance = viewOnlyAddress
        ? await this.getProvider().getBalance(viewOnlyAddress)
        : await this.getProvider().getQuickBalance()
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

  // Native EVM tokens (ETH, BNB, POL, etc.) do not support ERC20 allowances
  async getIcrc2Allowances(_: Principal): Promise<Array<AllowanceDetailDTO>> {
    return []
  }

  async revokeAllowance(
    _identity: SignIdentity,
    _spender: string,
  ): Promise<void> {}
}
