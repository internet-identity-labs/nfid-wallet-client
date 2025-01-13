import { IcpSwapShroffBuilder } from "src/integration/swap/icpswap/impl/shroff-icp-swap-impl"
import { KongShroffBuilder } from "src/integration/swap/kong/impl/kong-swap-shroff"
import { Shroff } from "src/integration/swap/shroff"
import { SwapName } from "src/integration/swap/types/enums"

class SwapService {
  async getSwapProviders(
    source: string,
    target: string,
  ): Promise<Map<SwapName, Shroff>> {
    const kongShroff = await new KongShroffBuilder()
      .withTarget(target)
      .withSource(source)
      .build()
    const icpSwapShroff = await new IcpSwapShroffBuilder()
      .withTarget(target)
      .withSource(source)
      .build()

    const map = new Map<SwapName, Shroff>()
    map.set(kongShroff.getSwapName(), kongShroff)
    map.set(icpSwapShroff.getSwapName(), icpSwapShroff)

    return map
  }
}

export const swapService = new SwapService()
