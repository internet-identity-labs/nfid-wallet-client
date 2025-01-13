import BigNumber from "bignumber.js"
import {QuoteAbstract} from "src/integration/swap/quote-abstract";
import {TRIM_ZEROS} from "@nfid/integration/token/constants";

export class KongQuoteImpl extends QuoteAbstract {
    getEstimatedTransferFee(): string[] {
      const sourceFee = BigNumber(Number(this.source.fee))
        .div(10 ** this.source.decimals)
        .multipliedBy(2)
        .toFixed(this.source.decimals)
        .replace(TRIM_ZEROS, "")
      return [
        `${sourceFee} ${this.source.symbol}`,
      ]
    }

    getLiquidityProviderFee(): string {
      return `?.? ${this.target.symbol}`
    }

}
