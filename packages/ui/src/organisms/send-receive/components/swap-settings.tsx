import clsx from "clsx"
import { IconCaret } from "packages/ui/src/atoms/icons/caret"
import { InputAmount } from "packages/ui/src/molecules/input-amount"
import { ModalComponent } from "packages/ui/src/molecules/modal/index-v0"
import { FC, useEffect, useRef, useState } from "react"

import { IconCmpArrow, IconInfo, Tooltip } from "@nfid-frontend/ui"

import { Shroff } from "frontend/integration/swap/shroff"
import { SwapName } from "frontend/integration/swap/types/enums"

const SLIPPAGE_VARIANTS = [1, 2, 3, 5]

interface GuaranteedAmount {
  [key: string]: string
}

export interface SwapSettingsProps {
  setModalOpen: (v: boolean) => void
  setSelectedShroff: (v: Shroff) => void
  modalOpen: boolean
  slippage: number
  setSlippage: (v: number) => void
  swapProviders: Map<SwapName, Shroff>
  shroff: Shroff | undefined
  amount: string
}

export const SwapSettings: FC<SwapSettingsProps> = ({
  setModalOpen,
  modalOpen,
  setSelectedShroff,
  slippage,
  setSlippage,
  swapProviders,
  shroff,
  amount,
}) => {
  const [isCustom, setIsCustom] = useState(false)
  const customInputRef = useRef<HTMLInputElement>(null)
  const [guaranteedAmounts, setGuaranteedAmounts] = useState<
    Array<GuaranteedAmount>
  >([])

  useEffect(() => {
    if (!shroff) return

    const getGuaranteedAmounts = async () => {
      const amounts = await Promise.all(
        [...swapProviders.values()].map(async (provider) => {
          const quote = await provider.getQuote(amount)
          return {
            [provider.getSwapName()]: quote.getGuaranteedAmount(),
          }
        }),
      )
      setGuaranteedAmounts(amounts)
    }

    getGuaranteedAmounts()
  }, [shroff, swapProviders])

  useEffect(() => {
    setIsCustom(!SLIPPAGE_VARIANTS.includes(slippage))
  }, [slippage])

  const handleCustomClick = () => {
    setIsCustom(true)
    setTimeout(() => customInputRef.current?.focus(), 0)
  }

  return (
    <>
      <ModalComponent
        isVisible={modalOpen}
        onClose={() => {
          setModalOpen(false)
        }}
        className="p-5 w-[340px] sm:w-[450px] !min-h-[480px] z-[100] !rounded-[24px]"
      >
        <div>
          <div className="flex gap-[10px] items-center mb-[18px]">
            <IconCmpArrow
              className="cursor-pointer"
              onClick={() => {
                setModalOpen(false)
              }}
            />
            <div className="text-[20px] leading-[40px] font-bold">
              Swap parameters
            </div>
          </div>
          <div>
            <p className="font-bold leading-6">Slippage tolerance</p>
            <p className="text-sm mt-[10px] mb-[20px]">
              The amount the price can change before it’s reverted <br />{" "}
              between the time your order is placed and confirmed.
            </p>
            <div className="rounded-[12px] bg-gray-100 h-[48px] flex text-sm mb-[30px] cursor-pointer overflow-hidden">
              {SLIPPAGE_VARIANTS.map((percent) => (
                <div
                  key={percent}
                  className="flex border-r border-white basis-1/5 shrink-0 grow-0 hover:bg-gray-50"
                  onClick={() => setSlippage(percent)}
                >
                  <span
                    className={clsx(
                      percent === slippage
                        ? "text-white cursor-default bg-primaryButtonColor"
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
                  "relative flex border-r border-white basis-1/5 shrink-0 grow-0 hover:bg-gray-50",
                )}
              >
                <span
                  className={clsx(
                    "rounded-[12px] h-full w-full flex items-center justify-center",
                    isCustom
                      ? "bg-primaryButtonColor text-white"
                      : "text-black",
                  )}
                  onClick={handleCustomClick}
                >
                  <span className={clsx(isCustom ? "hidden" : "")}>Custom</span>
                </span>
                <div
                  className={clsx(
                    !isCustom ? "hidden" : "",
                    "w-full h-full absolute rounded-[12px] bg-primaryButtonColor text-white",
                    "flex items-center justify-center px-[14px]",
                  )}
                >
                  <InputAmount
                    id="slippage"
                    className="!text-white !h-auto !placeholder-white/50"
                    decimals={2}
                    fontSize={14}
                    isLoading={false}
                    value=""
                    ref={customInputRef}
                    onBlur={(e) => {
                      const value = e.target.value
                      setIsCustom(false)
                      if (value) setSlippage(+value)
                    }}
                  />
                  %
                </div>
              </div>
            </div>
            {shroff && (
              <div>
                <p className="font-bold leading-6">Quotes</p>
                <p className="text-sm mt-[10px] mb-[20px]">
                  Below are the quotes gathered from multiple liquidity sources,
                  and NFID Wallet’s recommendation optimized on tokens <br />
                  received and swap success rate.
                </p>
                <div className="flex items-center text-sm font-bold leading-5 text-gray-400 mb-[10px]">
                  <p className="flex items-center gap-1">
                    <span>Guaranteed amount</span>
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
                  </p>
                  <p className="basis-[130px] ml-auto">Quote source</p>
                </div>
                <div>
                  {[...swapProviders.values()].map((value) => {
                    const swapNameValue = value.getSwapName()
                    const swapName = SwapName[swapNameValue]

                    const guaranteedAmountEntry = guaranteedAmounts.find(
                      (entry) => entry[swapNameValue] !== undefined,
                    )

                    const guaranteedAmount = guaranteedAmountEntry
                      ? guaranteedAmountEntry[swapNameValue]
                      : ""

                    return (
                      <div
                        key={swapName}
                        className={clsx(
                          "flex items-center pl-[14px] rounded-[12px] h-[48px] text-sm",
                          shroff.getSwapName() === swapNameValue
                            ? "cursor-default bg-primaryButtonColor text-white"
                            : "cursor-pointer hover:bg-gray-50",
                        )}
                      >
                        <p>{guaranteedAmount}</p>
                        <p className="basis-[130px] ml-auto flex items-center justify-between">
                          <span>{swapName}</span>
                          <div
                            onClick={() => {
                              setSelectedShroff(value)
                            }}
                            className={clsx(
                              "relative transition-all cursor-pointer group w-[36px] h-[36px]",
                              "flex items-center justify-center mr-2.5 rounded-[6px]",
                              shroff.getSwapName() === swapNameValue
                                ? "hover:bg-teal-600"
                                : "hover:bg-gray-50",
                            )}
                          >
                            <IconCaret
                              color={
                                shroff.getSwapName() === swapNameValue
                                  ? "white"
                                  : "black"
                              }
                            />
                          </div>
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </ModalComponent>
    </>
  )
}
