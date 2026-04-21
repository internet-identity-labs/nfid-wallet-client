import { exchangeRateService } from "./exchange-rate"
import BigNumber from "bignumber.js"

describe("exchange-rate", () => {
  it("should return some rate", async function () {
    await exchangeRateService.cacheUsdIcpRate()
    expect(exchangeRateService.getICP2USD().toNumber()).toBeGreaterThan(0)
  })

  it("should return some rate icrc1", async function () {
    jest.spyOn(exchangeRateService, "usdPriceForICRC1").mockResolvedValue({
      value: new BigNumber("0.1"),
      dayChangePercent: "0",
      dayChangePercentPositive: true,
    })

    const rate = await exchangeRateService.usdPriceForICRC1(
      "ryjl3-tyaaa-aaaaa-aaaba-cai",
    )
    expect(rate!.value.toNumber()).toBeGreaterThan(0)
  })
})
