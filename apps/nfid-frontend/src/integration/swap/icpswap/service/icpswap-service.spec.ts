import { icpSwapService } from "src/integration/swap/icpswap/service/icpswap-service"

describe("icpswap service", () => {
  jest.setTimeout(200000)

  it("get pool test", async () => {
    const poolData = await icpSwapService.getPoolFactory(
      "ryjl3-tyaaa-aaaaa-aaaba-cai",
      "mxzaz-hqaaa-aaaar-qaada-cai",
    )
    expect(poolData).toBeDefined()
    expect(poolData.canisterId.toText()).toEqual("xmiu5-jqaaa-aaaag-qbz7q-cai")
  })
})
