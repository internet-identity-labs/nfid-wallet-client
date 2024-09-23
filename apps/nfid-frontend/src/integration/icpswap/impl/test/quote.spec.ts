import BigNumber from "bignumber.js"
import { QuoteImpl } from "src/integration/icpswap/impl/quote-impl"

import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"

describe("quote test", () => {
  jest.setTimeout(200000)

  it("quote interface test", async function () {
    const sourceLedger = "ryjl3-tyaaa-aaaaa-aaaba-cai"
    const targetLedger = "mxzaz-hqaaa-aaaar-qaada-cai"

    const [st] = await Promise.all([icrc1OracleService.getICRC1Canisters()])

    const source = st.find((icrc1) => icrc1.ledger === sourceLedger)
    const target = st.find((icrc1) => icrc1.ledger === targetLedger)
    const quote = new QuoteImpl(
      0.5,
      BigInt(6631),
      source!,
      target!,
      BigNumber(63603.80961802474),
      BigNumber(8.437122672555095),
    )

    expect(quote.getSourceAmountPrettified()).toEqual("0.5")
    expect(quote.getTargetAmountPrettified()).toEqual("0.00006631")
    expect(quote.getQuoteRate()).toEqual("1 ICP = 0.00013262 ckBTC")
    expect(quote.getLiquidityProviderFee()).toEqual("0.0015 ICP")
    expect(quote.getMaxSlippagge()).toEqual("0%")
    expect(quote.getWidgetFee()).toEqual("0.004375 ICP")
    expect(quote.getTargetAmountUSD()).toEqual("4.22 USD")
    expect(quote.getSourceAmountUSD()).toEqual("4.22 USD")
    expect(quote.getGuaranteedAmount()).toEqual("0.00006631 ckBTC")
    expect(quote.getEstimatedTransferFee()).toEqual([
      "0.0003 ICP",
      "0.0000001 ckBTC",
    ])
  })
})
