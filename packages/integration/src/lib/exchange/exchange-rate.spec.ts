import { exchangeRateService } from "./exchange-rate"

describe("exchange-rate", () => {
  it("should return some rate", async function () {
    await new Promise((resolve) => setTimeout(resolve, 777))
    expect(exchangeRateService.getICP2USD().toNumber()).toBeGreaterThan(0)
  })
})
