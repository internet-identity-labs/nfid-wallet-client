import {ShroffBuilder} from "src/integration/icpswap/impl/shroff-impl";

describe("shroff test", () => {

  jest.setTimeout(200000)

  it("shroff quote test", async function () {
    const sourceLedger = "ryjl3-tyaaa-aaaaa-aaaba-cai"
    const targetLedger = "mxzaz-hqaaa-aaaar-qaada-cai"
    const shroff = await new ShroffBuilder()
      .withSource(sourceLedger)
      .withTarget(targetLedger)
      .build()
    const quote = await shroff.getQuote(0.5)
    expect(quote.getSourceAmountPrettified()).toEqual("0.5")
  })
})
