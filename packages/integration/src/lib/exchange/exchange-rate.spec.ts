import {exchangeRateService} from "./exchange-rate"

describe("exchange-rate", () => {
  it("should return some rate", async function () {
    await exchangeRateService.cacheUsdIcpRate()
    expect(exchangeRateService.getICP2USD().toNumber()).toBeGreaterThan(0)
  })

  it("should return some rate icrc1", async function () {
    const rate = await exchangeRateService.usdPriceForICRC1("ryjl3-tyaaa-aaaaa-aaaba-cai")
    expect(rate!.toNumber()).toBeGreaterThan(0)
  })
})
