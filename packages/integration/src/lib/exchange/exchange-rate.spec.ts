import { exchangeRateService } from "./exchange-rate"

describe("exchange-rate", () => {
  it("should return some rate", async () => {
    await exchangeRateService.cacheUsdIcpRate()
    expect(exchangeRateService.getICP2USD().toNumber()).toBeGreaterThan(0)
  })

  it("should return some rate icrc1", async () => {
    const rate = await exchangeRateService.usdPriceForICRC1(
      "ryjl3-tyaaa-aaaaa-aaaba-cai",
    )
    expect(rate!.value.toNumber()).toBeGreaterThan(0)
  })
})
