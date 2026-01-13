import BigNumber from "bignumber.js"

import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"

import { SourceInputCalculatorIcpSwap } from "src/integration/swap/icpswap/impl/icp-swap-calculator"
import { IcpSwapQuoteImpl } from "src/integration/swap/icpswap/impl/icp-swap-quote-impl"

describe("quote test", () => {
  jest.setTimeout(200000)

  it("quote interface test", async () => {
    const sourceLedger = "ryjl3-tyaaa-aaaaa-aaaba-cai"
    const targetLedger = "mxzaz-hqaaa-aaaar-qaada-cai"

    const [st] = await Promise.all([icrc1OracleService.getICRC1Canisters()])

    const source = st.find((icrc1) => icrc1.ledger === sourceLedger)
    const target = st.find((icrc1) => icrc1.ledger === targetLedger)
    const quote = new IcpSwapQuoteImpl(
      "0.5",
      new SourceInputCalculatorIcpSwap(
        BigInt(0.5 * 10 ** source!.decimals),
        source!.fee,
      ),
      BigInt(6631),
      source!,
      target!,
      2,
      BigNumber(63603.80961802474),
      BigNumber(8.437122672555095),
    )
    const priceImpactResult = quote.getPriceImpact()

    expect(quote.getSourceAmountPrettified()).toEqual("0.5")
    expect(quote.getTargetAmountPrettified()).toEqual("0.00006621")
    expect(quote.getQuoteRate()).toEqual("1 ICP = 0.00013387 ckBTC")
    expect(quote.getLiquidityProviderFee()).toEqual("0.00148598 ICP")
    expect(quote.getWidgetFee()).toEqual("0.00437238 ICP")
    expect(quote.getTargetAmountUSD()).toEqual("4.22 USD")
    expect(quote.getSourceAmountUSD()).toEqual("4.22 USD")
    expect(quote.getTargetAmountPrettifiedWithSymbol()).toEqual(
      "0.00006621 ckBTC",
    )
    expect(quote.getEstimatedTransferFee()).toEqual([
      "0.0003 ICP",
      "0.0000002 ckBTC",
    ])
    expect(priceImpactResult).toBeDefined()
    expect(priceImpactResult!.priceImpact).toEqual("0.92%")
    expect(priceImpactResult!.status).toEqual("low")
  })
})
