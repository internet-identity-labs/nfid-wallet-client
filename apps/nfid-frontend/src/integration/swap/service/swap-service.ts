import { IcpSwapShroffBuilder } from "src/integration/swap/icpswap/impl/shroff-icp-swap-impl"
import { KongShroffBuilder } from "src/integration/swap/kong/impl/kong-swap-shroff"
import { Shroff } from "src/integration/swap/shroff"
import { SwapName } from "src/integration/swap/types/enums"

import { LiquidityError, ServiceUnavailableError } from "../errors/types"
import { Quote } from "../quote"

const PROVIDERS = [
  { builder: new IcpSwapShroffBuilder(), name: SwapName.ICPSwap },
  { builder: new KongShroffBuilder(), name: SwapName.Kongswap },
]

export class SwapService {
  async getSwapProviders(
    source: string,
    target: string,
  ): Promise<Map<SwapName, Shroff | undefined>> {
    let success = false

    const map = new Map<SwapName, Shroff | undefined>()

    for (let i = 0; i < PROVIDERS.length; i++) {
      const provider = PROVIDERS[i]
      try {
        const buildedProvider = await provider.builder
          .withTarget(target)
          .withSource(source)
          .build()

        map.set(provider.name, buildedProvider)
        success = true
      } catch (e) {
        map.set(provider.name, undefined)

        if (e instanceof LiquidityError) success = true
      }
    }

    if (!success) throw new ServiceUnavailableError()

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
          } catch (_e) {}
        }),
      )

      if (
        Array.from(quotesWithShroffs.values()).every(
          (value) => value === undefined,
        )
      )
        throw new LiquidityError()

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
