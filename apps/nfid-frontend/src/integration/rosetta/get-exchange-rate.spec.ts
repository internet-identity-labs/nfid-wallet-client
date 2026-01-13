import { getExchangeRate } from "./get-exchange-rate"

describe("getExchangeRate", () => {
  it("should return correct exchange rate.", async () => {
    const response = await getExchangeRate("ICP")
    expect(typeof response).toBe("number")
  })
})
