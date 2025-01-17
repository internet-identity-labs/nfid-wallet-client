import { IcpSwapShroffBuilder } from "src/integration/swap/icpswap/impl/shroff-icp-swap-impl"
import { KongShroffBuilder } from "src/integration/swap/kong/impl/kong-swap-shroff"
import { Shroff } from "src/integration/swap/shroff"
import { SwapName } from "src/integration/swap/types/enums"

import { LiquidityError } from "../errors/types"
import { Quote } from "../quote"

export class SwapService {
  async getSwapProviders(
    source: string,
    target: string,
  ): Promise<Map<SwapName, Shroff | undefined>> {
    const map = new Map<SwapName, Shroff | undefined>()

    try {
      const icpSwapShroff = await new IcpSwapShroffBuilder()
        .withTarget(target)
        .withSource(source)
        .build()

      map.set(icpSwapShroff.getSwapName(), icpSwapShroff)
    } catch (e) {
      map.set(SwapName.ICPSwap, undefined)
    }

    try {
      const kongShroff = await new KongShroffBuilder()
        .withTarget(target)
        .withSource(source)
        .build()

      map.set(kongShroff.getSwapName(), kongShroff)
    } catch (e) {
      map.set(SwapName.Kongswap, undefined)
    }

    if (Array.from(map.values()).every((value) => value === undefined))
      throw new LiquidityError()

    return map
  }

  async getBestShroff(
    providers: Map<SwapName, Shroff | undefined>,
    amount?: string,
  ): Promise<Shroff | undefined> {
    if (!amount || !Number(amount)) return
    try {
      const quotesWithShroffs = await Promise.all(
        [...providers.entries()].map(async ([, shroff]) => {
          if (!shroff) return
          try {
            const quote = await shroff.getQuote(amount)

            return { shroff, quote }
          } catch (e) {
            return
          }
        }),
      )

      const validQuotes = quotesWithShroffs.filter(
        (item): item is { shroff: Shroff; quote: Quote } => item !== undefined,
      )

      const bestShroff = validQuotes.sort(
        (a, b) =>
          Number(b.quote.getTargetAmountPrettified()) -
          Number(a.quote.getTargetAmountPrettified()),
      )[0]?.shroff

      return bestShroff
    } catch (e) {
      throw e
    }
  }
}

export const swapService = new SwapService()
