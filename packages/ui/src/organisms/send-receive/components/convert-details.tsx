import clsx from "clsx"
import { IconCmpArrow } from "packages/ui/src/atoms/icons"
import { Skeleton } from "packages/ui/src/atoms/skeleton"
import { FC } from "react"

import { BTC_NATIVE_ID } from "@nfid/integration/token/constants"

import { FT } from "frontend/integration/ft/ft"

import { IConversionFee } from "../utils"
import { ConvertModal } from "./convert"

export interface ConvertDetailsProps {
  token: FT
  isOpen: boolean
  setConvertModal: (v: ConvertModal) => void
  fee?: IConversionFee
}

export const ConvertDetails: FC<ConvertDetailsProps> = ({
  token,
  isOpen,
  setConvertModal,
  fee,
}) => {
  return (
    <div className={clsx(!isOpen && "hidden")}>
      <div>
        <div className="flex gap-[10px] items-center mb-[18px]">
          <IconCmpArrow
            className="cursor-pointer"
            onClick={() => {
              setConvertModal(ConvertModal.CONVERT)
            }}
          />
          <div className="text-[20px] leading-[40px] font-bold">
            Conversion details
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
              <p>BTC network fee</p>
              <p className="leading-5 text-right font-inter">
                {!fee ? (
                  <Skeleton className="w-[70px] h-4 rounded-lg" />
                ) : (
                  <>
                    {fee?.btcNetworkFee} {token.getTokenSymbol()}
                    <span className="block text-xs text-gray-400 dark:text-zinc-500">
                      {token?.getTokenRateFormatted(fee?.btcNetworkFee || "0")}
                    </span>
                  </>
                )}
              </p>
            </div>
            <div className="flex justify-between py-3 leading-5 border-b border-gray-100 dark:border-zinc-500">
              <p>ICP network fee</p>
              <p className="leading-5 text-right font-inter">
                {!fee ? (
                  <Skeleton className="w-[70px] h-4 rounded-lg" />
                ) : (
                  <>
                    {fee?.icpNetworkFee} {token.getTokenSymbol()}
                    <span className="block text-xs text-gray-400 dark:text-zinc-500">
                      {token?.getTokenRateFormatted(fee?.icpNetworkFee || "0")}
                    </span>
                  </>
                )}
              </p>
            </div>
            {token.getTokenAddress() !== BTC_NATIVE_ID && (
              <div className="flex flex-wrap justify-between py-3 leading-5">
                <p>Widget fee</p>
                <p className="leading-5 text-right font-inter">
                  {!fee ? (
                    <Skeleton className="w-[70px] h-4 rounded-lg" />
                  ) : (
                    <>
                      {fee?.widgetFee} {token.getTokenSymbol()}
                      <span className="block text-xs text-gray-400">
                        {token?.getTokenRateFormatted(fee?.widgetFee || "0")}
                      </span>
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500 basis-[100%] leading-[19px] mt-1">
                  The fee of 0.875% is automatically factored into this <br />
                  conversion to support the NFID Wallet Community.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
