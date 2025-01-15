import { SwapName } from "src/integration/swap/types/enums"

import { SwapService } from "./swap-service"

describe("SwapService", () => {
  jest.setTimeout(200000)
  const swapService = new SwapService()
  const sourceLedger = "ryjl3-tyaaa-aaaaa-aaaba-cai"
  const targetLedger = "mxzaz-hqaaa-aaaar-qaada-cai"

  it("should return swap providers map", async () => {
    const result = await swapService.getSwapProviders(
      sourceLedger,
      targetLedger,
    )

    expect(result.size).toEqual(2)
    expect(result.get(SwapName.ICPSwap)).toBeDefined()
    expect(result.get(SwapName.ICPSwap)?.getSwapName()).toEqual(
      SwapName.ICPSwap,
    )
  })

  it("should return the Shroff with the biggest quote", async () => {
    const result = await swapService.getShroffWithBiggestQuote(
      sourceLedger,
      targetLedger,
      "0.02",
    )

    expect(result).toBeDefined()
    expect(result?.getSwapName()).toEqual(SwapName.ICPSwap)
  })
})
