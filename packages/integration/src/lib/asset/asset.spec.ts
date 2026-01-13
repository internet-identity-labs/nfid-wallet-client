import { PriceService } from "./asset-util"

describe("Ethereum Asset", () => {
  jest.setTimeout(200000)

  it("should return one fungible native tx", async () => {
    const tokens = ["AAA", "ICP"]
    const actual = await new PriceService().getPrice(tokens)

    expect(actual[0]).toMatchObject({
      token: "AAA",
      price: 0,
    })

    expect(actual[1]).toMatchObject({
      token: "ICP",
      price: expect.any(Number),
    })
  })
})
