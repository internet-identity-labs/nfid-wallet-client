import clsx from "clsx"
import { IconCaret } from "packages/ui/src/atoms/icons/caret"
import { InputAmount } from "packages/ui/src/molecules/input-amount"
import { FC, useEffect, useRef, useState } from "react"

import { IconCmpArrow, IconInfo, Tooltip } from "@nfid-frontend/ui"

import { useDarkTheme } from "frontend/hooks"
import { Quote } from "frontend/integration/swap/quote"
import { Shroff } from "frontend/integration/swap/shroff"
import { SwapName } from "frontend/integration/swap/types/enums"

import { SwapModal } from "./swap"

const SLIPPAGE_VARIANTS = [1, 2, 3, 5]
const MIN_SLIPPAGE = 1
const MAX_SLIPPAGE = 50

interface QuoteMap {
  [key: string]: Quote | undefined
}

export interface SwapSettingsProps {
  setSwapModal: (v: SwapModal) => void
  setSelectedShroff: (v: Shroff) => void
  isOpen: boolean
  slippage: number
  setSlippage: (v: number) => void
  swapProviders: Map<SwapName, Shroff | undefined>
  shroff: Shroff | undefined
  amount: string
  setProvider: (v: Shroff) => void
}

export const SwapSettings: FC<SwapSettingsProps> = ({
  setSwapModal,
  isOpen,
  setSelectedShroff,
  slippage,
  setSlippage,
  swapProviders,
  shroff,
  amount,
  setProvider,
}) => {
  const isDarkTheme = useDarkTheme()
  const [isCustom, setIsCustom] = useState(false)
  const [customSlippage, setCustomSlippage] = useState<number | undefined>()
  const customInputRef = useRef<HTMLInputElement>(null)
  const [quotes, setQuotes] = useState<Array<QuoteMap>>([])

  useEffect(() => {
    if (!shroff) return

    const getQuotes = async () => {
      try {
        const quotes = await Promise.all(
          [...swapProviders.entries()].map(async ([key, provider]) => {
            if (!provider) return { [key]: undefined }
            const quote = await provider.getQuote(amount)
            return {
              [provider.getSwapName()]: quote,
            }
          }),
        )
        setQuotes(quotes)
      } catch (_e) {
        return
      }
    }

    getQuotes()
  }, [shroff, swapProviders])

  useEffect(() => {
    if (!customSlippage) return
    setSlippage(customSlippage)
  }, [customSlippage])

  const setInputSlippage = (value: string) => {
    setIsCustom(!!customSlippage)

    setCustomSlippage(+value)
  }

  useEffect(() => {
    if (!SLIPPAGE_VARIANTS.includes(slippage)) {
      setIsCustom(true)
      setCustomSlippage(slippage)
    } else {
      setIsCustom(false)
      setCustomSlippage(undefined)
    }
  }, [slippage])

  const handleCustomClick = () => {
    setIsCustom(true)
    setTimeout(() => customInputRef.current?.focus(), 0)
  }

  return (
    <div className={clsx(!isOpen && "hidden")}>
      <div>
        <div className="flex gap-[10px] items-center mb-[18px]">
          <IconCmpArrow
            className="cursor-pointer"
            onClick={() => {
              setSwapModal(SwapModal.SWAP)
            }}
          />
          <div className="text-[20px] leading-[40px] font-bold">
            Swap parameters
          </div>
        </div>
        <div>
          <p className="font-bold leading-6">Slippage tolerance</p>
          <p className="text-sm mt-[10px] mb-[20px] sm:pr-[30px]">
            The amount the price can change before it’s reverted between the
            time your order is placed and confirmed.
          </p>
          <div className="rounded-[12px] bg-gray-100 dark:bg-zinc-900 h-[48px] flex text-sm mb-[30px] cursor-pointer overflow-hidden">
            {SLIPPAGE_VARIANTS.map((percent) => (
              <div
                key={percent}
                className="flex border-r border-white dark:border-darkGray basis-1/5 shrink-0 grow-0 hover:bg-gray-50 dark:hover:bg-black"
                onClick={() => setSlippage(percent)}
              >
                <span
                  className={clsx(
                    percent === slippage
                      ? "text-white cursor-default bg-primaryButtonColor transition-colors duration-300 ease-in-out"
                      : "",
                    "rounded-[12px] h-full w-full flex items-center justify-center",
                  )}
                >
                  {percent}%
                </span>
              </div>
            ))}
            <div
              className={clsx(
                "relative flex border-r border-white dark:border-darkGray basis-1/5 shrink-0 grow-0 hover:bg-gray-50 dark:hover:bg-zinc-800",
              )}
            >
              <span
                className={clsx(
                  "rounded-[12px] h-full w-full flex items-center justify-center",
                  isCustom
                    ? "bg-primaryButtonColor text-white"
                    : "text-black dark:text-white",
                )}
                onClick={handleCustomClick}
              >
                <span className={clsx(isCustom ? "hidden" : "")}>Custom</span>
              </span>
              <div
                className={clsx(
                  !isCustom ? "hidden" : "",
                  "w-full h-full absolute rounded-[12px] bg-primaryButtonColor text-white",
                  "flex items-center justify-center px-[4px] sm:px-[14px]",
                )}
              >
                <InputAmount
                  id="slippage"
                  className="!text-white !h-auto !placeholder-white/50"
                  decimals={2}
                  fontSize={14}
                  isLoading={false}
                  value={`${customSlippage}`}
                  ref={customInputRef}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      ;(e.target as HTMLInputElement).blur()
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value
                    const calculatedValue =
                      +value < MIN_SLIPPAGE
                        ? `${MIN_SLIPPAGE}`
                        : +value > MAX_SLIPPAGE
                          ? `${MAX_SLIPPAGE}`
                          : value

                    setInputSlippage(calculatedValue)

                    customInputRef!.current!.value = calculatedValue
                  }}
                />
                %
              </div>
            </div>
          </div>
          {shroff && (
            <div>
              <p className="font-bold leading-6">Quotes</p>
              <p className="text-sm mt-[10px] mb-[20px] sm:pr-1">
                Below are the quotes gathered from multiple liquidity sources,
                and NFID Wallet’s recommendation optimized on tokens received
                and swap success rate.
              </p>
              <div className="flex items-center text-sm font-bold leading-5 text-gray-400 dark:text-zinc-400 mb-[10px]">
                <p className="flex items-center gap-1">
                  <span>Guaranteed amount</span>
                  {isOpen && (
                    <Tooltip
                      align="center"
                      tip={
                        <span>
                          This is the minimum amount you will receive after{" "}
                          <br />
                          all fees. You may receive more depending on <br />
                          slippage.
                        </span>
                      }
                    >
                      <img
                        src={IconInfo}
                        alt="icon"
                        className="w-[18px] h-[18px] transition-all cursor-pointer hover:opacity-70 top-[1px] relative"
                      />
                    </Tooltip>
                  )}
                </p>
                <p className="basis-[130px] ml-auto">Quote source</p>
              </div>
              <div>
                {[...swapProviders.entries()].map(([key, value]) => {
                  if (!value)
                    return (
                      <div
                        key={SwapName[key]}
                        className={clsx(
                          "flex items-center pl-[14px] rounded-[12px] h-[56px] text-sm",
                          "cursor-not-allowed text-gray-400",
                        )}
                      >
                        <p>
                          Provider doesn’t have enough liquidity to complete
                          this swap.
                        </p>
                        <div className="basis-[130px] ml-auto flex items-center justify-between">
                          <span>{SwapName[key]}</span>
                          <div
                            className={clsx(
                              "relative transition-all group w-[36px] h-[36px]",
                              "flex items-center justify-center mr-2.5 rounded-[6px]",
                            )}
                          >
                            <IconCaret color="#9CA3AF" />
                          </div>
                        </div>
                      </div>
                    )
                  const swapNameValue = value.getSwapName()
                  const swapName = SwapName[swapNameValue]

                  const quoteEntry = quotes.find(
                    (entry) => entry[swapNameValue] !== undefined,
                  )

                  const quote = quoteEntry
                    ? quoteEntry[swapNameValue]
                    : undefined

                  if (quote && quote?.getSlippage() > slippage) {
                    return (
                      <div
                        key={SwapName[key]}
                        className={clsx(
                          "flex items-center pl-[14px] rounded-[12px] h-[56px] text-sm",
                          "cursor-not-allowed text-gray-400",
                        )}
                      >
                        <p className="text-xs sm:text-sm">
                          Slippage tolerance too low{" "}
                          <span className="block text-xs">
                            Increase above {quote?.getSlippage().toFixed(2)}%
                          </span>
                        </p>
                        <div className="basis-[130px] ml-auto flex items-center justify-between">
                          <span>{SwapName[key]}</span>
                          <div
                            className={clsx(
                              "relative transition-all group w-[36px] h-[36px]",
                              "flex items-center justify-center mr-2.5 rounded-[6px]",
                            )}
                          >
                            <IconCaret color="#9CA3AF" />
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={swapName}
                      className={clsx(
                        "flex items-center pl-[14px] rounded-[12px] h-[48px] text-sm transition-colors",
                        shroff.getSwapName() === swapNameValue
                          ? "cursor-default bg-primaryButtonColor text-white"
                          : "cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700",
                      )}
                      onClick={() => {
                        if (shroff.getSwapName() === swapNameValue) return
                        setProvider(value)
                      }}
                    >
                      <p>{quote?.getGuaranteedAmount(slippage)}</p>
                      <div className="basis-[130px] ml-auto flex items-center justify-between">
                        <span>{swapName}</span>
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedShroff(value)
                            setSwapModal(SwapModal.QUOTE)
                          }}
                          className={clsx(
                            "relative transition-all cursor-pointer group w-[36px] h-[36px]",
                            "flex items-center justify-center mr-2.5 rounded-[6px]",
                            shroff.getSwapName() === swapNameValue
                              ? "hover:bg-teal-600 dark:hover:bg-teal-600"
                              : "hover:bg-gray-50 hover:bg-zinc-500",
                          )}
                        >
                          <IconCaret
                            color={
                              shroff.getSwapName() === swapNameValue ||
                              isDarkTheme
                                ? "white"
                                : "black"
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
