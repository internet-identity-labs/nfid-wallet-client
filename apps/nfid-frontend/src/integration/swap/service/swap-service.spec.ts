import { SwapName } from "src/integration/swap/types/enums"

import { LiquidityError } from "../errors/types"
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

    expect(result.get(SwapName.Kongswap)).toBeDefined()
    expect(result.get(SwapName.Kongswap)?.getSwapName()).toEqual(
      SwapName.Kongswap,
    )
  })

  it("should return the Shroff with the biggest quote", async () => {
    const providers = await swapService.getSwapProviders(
      sourceLedger,
      targetLedger,
    )
    const result = await swapService.getBestShroff(providers, "0.02")

    expect(result).toBeDefined()
    expect(result?.getSwapName()).toEqual(SwapName.ICPSwap)
  })

  it.skip("should return Kongswap shroff only", async () => {
    const targetLedger = "3h3vv-7yaaa-aaaam-qcu5a-cai"
    const result = await swapService.getSwapProviders(
      sourceLedger,
      targetLedger,
    )

    expect(result.size).toEqual(2)

    expect(result.get(SwapName.ICPSwap)).toBeUndefined()
    expect(result.get(SwapName.Kongswap)).toBeDefined()
  })

  it.skip("should return ICPSwap shroff only", async () => {
    const targetLedger = "etik7-oiaaa-aaaar-qagia-cai"
    const result = await swapService.getSwapProviders(
      sourceLedger,
      targetLedger,
    )

    expect(result.size).toEqual(2)

    expect(result.get(SwapName.ICPSwap)).toBeDefined()
    expect(result.get(SwapName.Kongswap)).toBeUndefined()
  })

  it("should return no shroffs", async () => {
    const targetLedger = "ilzky-ayaaa-aaaar-qahha-cai"

    await expect(
      swapService.getSwapProviders(sourceLedger, targetLedger),
    ).rejects.toThrow(LiquidityError)
  })
})
