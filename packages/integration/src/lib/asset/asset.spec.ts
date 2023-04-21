import { getPrice } from "./asset-util"

describe("Ethereum Asset", () => {
  jest.setTimeout(200000)

  it("should return one fungible native tx", async function () {
    const tokens = ["AAA", "ICP"]
    const actual = await getPrice(tokens)

    expect(actual[0]).toMatchObject({
      token: "AAA",
      price: "N/A",
    })

    expect(actual[1]).toMatchObject({
      token: "ICP",
      price: expect.any(String),
    })
  })
})
