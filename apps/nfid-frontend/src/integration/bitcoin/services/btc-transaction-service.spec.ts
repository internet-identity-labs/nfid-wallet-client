import { getBtcActivitiesRows } from "./btc-transaction-service"

describe("BTC Transaction Service", () => {
  jest.setTimeout(50000)

  it("should get BTC activities", async () => {
    const activities = await getBtcActivitiesRows("n2yvAStr9w75oUMyb3c7s4QdQu78Rj9Sjc")
    expect(activities.length).toBeGreaterThan(0)
  })
})