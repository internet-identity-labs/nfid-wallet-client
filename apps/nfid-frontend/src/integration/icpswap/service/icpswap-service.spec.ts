import { icpSwapService } from "src/integration/icpswap/service/icpswap-service"

import { SwapTransaction } from "../swap-transaction"

describe("icpswap service", () => {
  jest.setTimeout(200000)

  it("get pool test", async function () {
    const poolData = await icpSwapService.getPoolFactory(
      "ryjl3-tyaaa-aaaaa-aaaba-cai",
      "mxzaz-hqaaa-aaaar-qaada-cai",
    )
    expect(poolData).toBeDefined()
    expect(poolData.canisterId.toText()).toEqual("xmiu5-jqaaa-aaaag-qbz7q-cai")
  })

  it("should return the correct tx loading state", () => {
    const mockTransaction: jest.Mocked<Partial<SwapTransaction>> = {
      getIsLoading: jest.fn().mockReturnValue(true),
      setIsLoading: jest.fn(),
    }

    expect(mockTransaction.getIsLoading!()).toBe(true)
    expect(mockTransaction.getIsLoading).toHaveBeenCalledTimes(1)

    mockTransaction.setIsLoading!(false)
    expect(mockTransaction.setIsLoading).toHaveBeenCalledWith(false)
  })
})
