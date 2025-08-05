import clsx from "clsx"
import { FC, useEffect, useState } from "react"
import { Quote } from "src/integration/swap/quote"

import { IconCmpArrow } from "@nfid-frontend/ui"

import { Shroff } from "frontend/integration/swap/shroff"
import { SwapName } from "frontend/integration/swap/types/enums"

import { SwapModal } from "./swap"

export interface QuoteModalProps {
  isOpen: boolean
  setSwapModal: (v: SwapModal) => void
  closeModal: () => void
  shroff: Shroff | undefined
  amount: string
}

export const QuoteModal: FC<QuoteModalProps> = ({
  isOpen,
  setSwapModal,
  shroff,
  amount,
}) => {
  const [quote, setQuote] = useState<Quote>()
  const [targetFee, sourceFee] = quote?.getEstimatedTransferFee() ?? []

  useEffect(() => {
    if (!shroff) return undefined

    const getQuote = async () => {
      const quote = await shroff.getQuote(amount)
      setQuote(quote)
    }

    getQuote()
  }, [shroff])

  if (!shroff) return null

  return (
    <div className={clsx(!isOpen && "hidden")}>
      <div>
        <div className="flex gap-[10px] items-center mb-2">
          <IconCmpArrow
            className="cursor-pointer"
            onClick={() => setSwapModal(SwapModal.SETTINGS)}
          />
          <div className="text-[20px] leading-[40px] font-bold">
            {SwapName[shroff.getSwapName()]} quote details
          </div>
        </div>
        <div
          className={clsx(
            "overflow-auto max-h-[396px] pr-[16px]",
            "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
            "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
            "dark:scrollbar-thumb-zinc-600 dark:scrollbar-track-[#242427]",
          )}
        >
          <div className="text-sm">
            <div className="flex justify-between py-3 leading-5 border-b border-gray-100 dark:border-zinc-500">
              <p>Quote rate</p>
              <p>{quote?.getQuoteRate()}</p>
            </div>
            <div className="flex flex-wrap justify-between py-3 leading-5 border-b border-gray-100 dark:border-zinc-500">
              <p>Liquidity provider fee</p>
              <p>{quote?.getLiquidityProviderFee()}</p>
            </div>
            <div className="flex flex-wrap justify-between py-3 leading-5 border-b border-gray-100 dark:border-zinc-500">
              <p>Price impact</p>
              <p>{quote?.getPriceImpact()?.priceImpact}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-500 basis-[100%] leading-[19px] mt-1">
                The difference between the market price and your price due to
                trade size.
              </p>
            </div>
            <div className="flex justify-between py-3 leading-5 border-b border-gray-100 dark:border-zinc-500">
              <p>Estimated transfer fee</p>
              <p className="text-right">
                {targetFee} <br />
                {sourceFee}
              </p>
            </div>
            <div className="flex flex-wrap justify-between py-3 leading-5">
              <p>Widget fee</p>
              <p>{quote?.getWidgetFee()}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-500 basis-[100%] leading-[19px] mt-1">
                The fee of 0.875% is automatically factored into this quote to
                support the NFID Wallet Community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
