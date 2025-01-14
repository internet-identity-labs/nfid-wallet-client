import clsx from "clsx"
import { IconCaret } from "packages/ui/src/atoms/icons/caret"
import { InputAmount } from "packages/ui/src/molecules/input-amount"
import { ModalComponent } from "packages/ui/src/molecules/modal/index-v0"
import { FC, useRef, useState } from "react"

import { IconCmpArrow, IconInfo, Tooltip } from "@nfid-frontend/ui"

export interface SwapSettingsProps {
  setModalOpen: (v: boolean) => void
  setQuoteModalOpen: (v: boolean) => void
  modalOpen: boolean
}

export const SwapSettings: FC<SwapSettingsProps> = ({
  setModalOpen,
  modalOpen,
  setQuoteModalOpen,
}) => {
  const [isCustom, setIsCustom] = useState(false)
  const [, setCustomValue] = useState("")
  const customInputRef = useRef<HTMLInputElement>(null)

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
        className="p-5 w-[340px] sm:w-[450px] min-h-[480px] z-[100] !rounded-[24px]"
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
              {[1, 2, 3, 5].map((percent) => (
                <div
                  key={percent}
                  className="flex border-r border-white basis-1/5 shrink-0 grow-0 hover:bg-gray-50"
                >
                  <span
                    className={clsx(
                      percent === 2
                        ? "text-white cursor-default bg-primaryButtonColor"
                        : "",
                      "rounded-[12px] h-full w-full flex items-center justify-center",
                    )}
                  >
                    {percent}%
                  </span>
                </div>
              ))}
              <div className="relative flex border-r border-white basis-1/5 shrink-0 grow-0 hover:bg-gray-50">
                <span
                  className="rounded-[12px] h-full w-full flex items-center justify-center"
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
                    id={"choose-to-token-amount"}
                    className="!text-white !h-auto !placeholder-white/50"
                    decimals={2}
                    fontSize={14}
                    isLoading={false}
                    value=""
                    ref={customInputRef}
                    onBlur={() => setIsCustom(false)}
                    onChange={(e) => {
                      setCustomValue(e.target.value)
                    }}
                  />
                  %
                </div>
              </div>
            </div>
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
                        This is the minimum amount you will receive after <br />
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
                <div className="flex items-center pl-[14px] rounded-[12px] h-[48px] text-sm cursor-default bg-primaryButtonColor text-white">
                  <p>30,035.61 ICP</p>
                  <p className="basis-[130px] ml-auto flex items-center justify-between">
                    <span>ICPSwap</span>
                    <div
                      onClick={() => {
                        setQuoteModalOpen(true)
                      }}
                      className={clsx(
                        "relative transition-all cursor-pointer group w-[36px] h-[36px]",
                        "flex items-center justify-center hover:bg-teal-600 mr-2.5 rounded-[6px]",
                      )}
                    >
                      <IconCaret color="white" />
                    </div>
                  </p>
                </div>
                <div className="flex items-center pl-[14px] rounded-[12px] h-[48px] text-sm cursor-pointer hover:bg-gray-50">
                  <p>30,035.22 ICP</p>
                  <p className="basis-[130px] ml-auto flex items-center justify-between">
                    <span>Kongswap</span>
                    <div
                      onClick={() => {
                        setQuoteModalOpen(true)
                      }}
                      className={clsx(
                        "relative transition-all cursor-pointer group w-[36px] h-[36px]",
                        "flex items-center justify-center hover:bg-gray-50 mr-2.5 rounded-[6px]",
                      )}
                    >
                      <IconCaret />
                    </div>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalComponent>
    </>
  )
}
