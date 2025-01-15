import { IcpSwapShroffBuilder } from "src/integration/swap/icpswap/impl/shroff-icp-swap-impl"
import { KongShroffBuilder } from "src/integration/swap/kong/impl/kong-swap-shroff"
import { Shroff } from "src/integration/swap/shroff"
import { SwapName } from "src/integration/swap/types/enums"

export class SwapService {
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
    map.set(icpSwapShroff.getSwapName(), icpSwapShroff)
    map.set(kongShroff.getSwapName(), kongShroff)

    return map
  }

  async getShroffWithBiggestQuote(
    target: string,
    source: string,
    amount?: string,
  ): Promise<Shroff | undefined> {
    if (!amount || !Number(amount)) return
    const providers = await this.getSwapProviders(target, source)

    const quotesWithShroffs = await Promise.all(
      [...providers.entries()].map(async ([, shroff]) => {
        const quote = await shroff.getQuote(amount)
        return { shroff, quote }
      }),
    )

    console.log("quotesWithShroffs", quotesWithShroffs)
    return quotesWithShroffs.sort((a, b) => {
      return (
        parseFloat(b.quote.getGuaranteedAmount()) -
        parseFloat(a.quote.getGuaranteedAmount())
      )
    })[0]?.shroff
  }
}

export const swapService = new SwapService()
