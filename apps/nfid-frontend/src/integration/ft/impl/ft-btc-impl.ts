import { SignIdentity } from "@dfinity/agent"

import { exchangeRateService } from "@nfid/integration"
import {
  BTC_DECIMALS,
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
  TRIM_ZEROS,
} from "@nfid/integration/token/constants"
import {
  Category,
  ChainId,
  State,
} from "@nfid/integration/token/icrc1/enum/enums"
import BtcIcon from "@nfid/ui/organisms/tokens/assets/bitcoin.svg"

import { bitcoinService } from "frontend/integration/bitcoin/bitcoin.service"

import { FT } from "../ft"
import { FeeResponseBTC } from "../utils"

import { FTImpl } from "./ft-impl"

export class FTBitcoinImpl extends FTImpl {
  constructor() {
    super({
      ledger: BTC_NATIVE_ID,
      symbol: "BTC",
      name: "Bitcoin",
      decimals: BTC_DECIMALS,
      category: Category.Native,
      logo: BtcIcon,
      state: State.Active,
      fee: BigInt(0),
      index: undefined,
      rootCanisterId: undefined,
    })
    this.tokenChainId = ChainId.BTC
  }

  async init(): Promise<FT> {
    await this.getBalance()
    return this
  }

  public async getBalance(): Promise<void> {
    try {
      this.tokenBalance = await bitcoinService.getQuickBalance()
    } catch (e) {
      console.error("BitcoinService error: ", (e as Error).message)
      return
    }

    try {
      this.tokenRate =
        await exchangeRateService.usdPriceForICRC1(CKBTC_CANISTER_ID)
    } catch (e) {
      console.error("Bitcoin rate fetch error: ", (e as Error).message)
    }

    if (this.tokenBalance !== undefined) {
      this.inited = true
    }
  }

  async getTokenFee(
    _value: number,
    _identity: SignIdentity,
  ): Promise<FeeResponseBTC> {
    const amount = _value.toFixed(this.decimals).replace(TRIM_ZEROS, "")
    const { fee_satoshis, utxos } = await bitcoinService.getFee(
      _identity,
      amount,
    )
    return new FeeResponseBTC(fee_satoshis, utxos)
  }
}
