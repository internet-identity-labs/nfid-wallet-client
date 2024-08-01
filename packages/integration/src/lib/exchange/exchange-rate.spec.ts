import { exchangeRateService } from "./exchange-rate"

describe("exchange-rate", () => {
  it("should return some rate", async function () {
    await exchangeRateService.cacheUsdIcpRate()
    expect(exchangeRateService.getICP2USD().toNumber()).toBeGreaterThan(0)
  })
})
