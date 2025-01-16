import BigNumber from "bignumber.js"

import { formatUsdAmount } from "./format-usd-amount"

describe("format usd amount util suit", () => {
  it("should correctly format usd amount", async () => {
    expect(formatUsdAmount(BigNumber(0.002))).toEqual("0.00 USD")
    expect(formatUsdAmount(BigNumber(0.002), false)).toEqual("0.002 USD")
    expect(formatUsdAmount(BigNumber(0.123))).toEqual("0.12 USD")
    expect(formatUsdAmount(BigNumber(0.123), false)).toEqual("0.12 USD")
  })
})
