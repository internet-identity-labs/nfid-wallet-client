import clsx from "clsx"
import { IconCmpArrow } from "packages/ui/src/atoms/icons"
import { Skeleton } from "packages/ui/src/atoms/skeleton"
import { FC } from "react"
import { BridgeModal } from "./bridge"
import { EstimatedBridge } from "./bridge"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { CHAIN_OPTIONS } from "frontend/integration/ethereum/bridge"

export interface BridgeDetailsProps {
  isOpen: boolean
  setBridgeModal: (v: BridgeModal) => void
  fromTokenChain: ChainId
  toTokenChain: ChainId
  bridgeData?: EstimatedBridge
  amount?: string
}

export const BridgeDetails: FC<BridgeDetailsProps> = ({
  isOpen,
  setBridgeModal,
  fromTokenChain,
  toTokenChain,
  bridgeData,
  amount,
}) => {
  const fromChainLabel =
    CHAIN_OPTIONS.find((o) => o.value === fromTokenChain)?.label ?? ""
  const toChainLabel =
    CHAIN_OPTIONS.find((o) => o.value === toTokenChain)?.label ?? ""
  return (
    <div className={clsx(!isOpen && "hidden")}>
      <div>
        <div className="flex gap-[10px] items-center mb-[18px]">
          <IconCmpArrow
            className="cursor-pointer"
            onClick={() => {
              setBridgeModal(BridgeModal.BRIDGE)
            }}
          />
          <div className="text-[20px] leading-[40px] font-bold">
            Bridge fee details
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
            <div className="flex justify-between py-3 leading-5 border-b border-gray-100 dark:border-zinc-700">
              <div>
                <p className="leading-5">Gas fee on source chain</p>
                <p className="text-xs leading-5 text-secondary dark:zinc-500">
                  {fromChainLabel}
                </p>
              </div>
              <p className="leading-5 text-right font-inter">
                {!amount ? null : !bridgeData ? (
                  <Skeleton className="w-[70px] h-4 rounded-lg" />
                ) : (
                  <>
                    {bridgeData.sourceCost}
                    <span className="block text-xs text-gray-400 dark:text-zinc-500">
                      {bridgeData.sourceUsdCost}
                    </span>
                  </>
                )}
              </p>
            </div>
            <div className="flex justify-between py-3 leading-5 border-b border-gray-100 dark:border-zinc-700">
              <div>
                <p>Gas fee on destination chain</p>
                <p className="text-xs leading-5 text-secondary dark:zinc-500">
                  {toChainLabel}
                </p>
              </div>
              <p className="leading-5 text-right font-inter">
                {!amount ? null : !bridgeData ? (
                  <Skeleton className="w-[70px] h-4 rounded-lg" />
                ) : (
                  <>
                    {bridgeData.redeemCost}
                    <span className="block text-xs text-gray-400 dark:text-zinc-500">
                      {bridgeData.redeemUsdCost}
                    </span>
                  </>
                )}
              </p>
            </div>
            {bridgeData?.protocolFee && (
              <div className="flex justify-between py-3 leading-5 border-b border-gray-100 dark:border-zinc-700">
                <p>Bridge fee</p>
                <p className="leading-5 text-right font-inter">
                  {bridgeData.protocolFee}
                  <span className="block text-xs text-gray-400 dark:text-zinc-500">
                    {bridgeData.protocolFeeUsd}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
