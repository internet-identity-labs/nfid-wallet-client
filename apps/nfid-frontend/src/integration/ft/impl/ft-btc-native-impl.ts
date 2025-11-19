import { Category, State } from "@nfid/integration/token/icrc1/enum/enums"
import BtcIcon from "packages/ui/src/organisms/tokens/assets/bitcoin.svg"

import { FTImpl } from "./ft-impl"
import {
  BTC_DECIMALS,
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
  TRIM_ZEROS,
} from "@nfid/integration/token/constants"
import { exchangeRateService } from "@nfid/integration"
import {
  bitcoinService,
  BitcointNetworkFeeAndUtxos,
} from "frontend/integration/bitcoin/bitcoin.service"
import { FT } from "../ft"
import { SignIdentity } from "@dfinity/agent"
import { satoshiService } from "frontend/integration/bitcoin/services/satoshi.service"

export class FTBTCImpl extends FTImpl {
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
    this.tokenChainId = 0
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

  async getBTCFee(
    identity: SignIdentity,
    value: number,
  ): Promise<BitcointNetworkFeeAndUtxos> {
    const amount = value.toFixed(this.decimals).replace(TRIM_ZEROS, "")
    return await bitcoinService.getFee(identity, amount)
  }

  getBTCFeeFormatted(fee: bigint): string {
    return `${Number(satoshiService.getFromSatoshis(fee)).toLocaleString("en", {
      minimumFractionDigits: 0,
      maximumFractionDigits: this.decimals,
    })} ${this.symbol}`
  }

  getBTCFeeFormattedUsd(fee: bigint): string | undefined {
    return (
      this.getTokenRateFormatted(
        Number(satoshiService.getFromSatoshis(fee)).toString(),
      ) || undefined
    )
  }
}
