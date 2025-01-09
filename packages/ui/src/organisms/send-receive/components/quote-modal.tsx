import clsx from "clsx"
import { ModalComponent } from "packages/ui/src/molecules/modal/index-v0"
import { FC } from "react"

import { IconCmpArrow } from "@nfid-frontend/ui"

import { Quote } from "src/integration/swap/quote"

export interface QuoteModalProps {
  setModalOpen: (v: boolean) => void
  modalOpen: boolean
  quote: Quote | undefined
}

export const QuoteModal: FC<QuoteModalProps> = ({
  setModalOpen,
  modalOpen,
  quote,
}) => {
  const [targetFee, sourceFee] = quote?.getEstimatedTransferFee() ?? []

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
          <div className="flex gap-[10px] items-center mb-2">
            <IconCmpArrow
              className="cursor-pointer"
              onClick={() => {
                setModalOpen(false)
              }}
            />
            <div className="text-[20px] leading-[40px] font-bold">
              Swap quote
            </div>
          </div>
          <div
            className={clsx(
              "overflow-auto max-h-[396px] pr-[16px]",
              "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
              "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
            )}
          >
            <div className="text-sm">
              <div className="flex justify-between py-3 leading-5 border-b border-gray-100">
                <p>Quote rate</p>
                <p>{quote?.getQuoteRate()}</p>
              </div>
              <div className="flex flex-wrap justify-between py-3 leading-5 border-b border-gray-100">
                <p>Liquidity provider fee</p>
                <p>{quote?.getLiquidityProviderFee()}</p>
                <p className="text-xs text-gray-500 basis-[100%] leading-[19px] mt-1">
                  ICPSwap’s 0.3% fee.
                </p>
              </div>
              <div className="flex flex-wrap justify-between py-3 leading-5 border-b border-gray-100">
                <p>Price impact</p>
                <p>{quote?.getPriceImpact()?.priceImpact}</p>
                <p className="text-xs text-gray-500 basis-[100%] leading-[19px] mt-1">
                  The difference between the market price and your price due to
                  trade size.
                </p>
              </div>
              <div className="flex justify-between py-3 leading-5 border-b border-gray-100">
                <p>Estimated transfer fee</p>
                <p className="text-right">
                  {targetFee} <br />
                  {sourceFee}
                </p>
              </div>
              <div className="flex flex-wrap justify-between py-3 leading-5 border-b border-gray-100">
                <p>Max slippage</p>
                <p>{quote?.getMaxSlippagge()}</p>
                <p className="text-xs text-gray-500 basis-[100%] leading-[19px] mt-1">
                  The amount the price can change before it’s reverted between
                  the time your order is placed and confirmed.
                </p>
              </div>
              <div className="flex flex-wrap justify-between py-3 leading-5 border-b border-gray-100">
                <p>Widget fee</p>
                <p>{quote?.getWidgetFee()}</p>
                <p className="text-xs text-gray-500 basis-[100%] leading-[19px] mt-1">
                  The fee of 0.875% is automatically factored into this quote to
                  support the NFID Wallet Community.
                </p>
              </div>
              <div className="flex flex-wrap justify-between py-3 leading-5">
                <p>Guaranteed amount</p>
                <p>{quote?.getGuaranteedAmount()}</p>
                <p className="text-xs text-gray-500 basis-[100%] leading-[19px] mt-1">
                  This is the minimum amount you will receive after all fees.
                  You may receive more depending on slippage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ModalComponent>
    </>
  )
}
