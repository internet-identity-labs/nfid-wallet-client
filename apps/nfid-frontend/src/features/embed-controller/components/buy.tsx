import { TransactionRequest } from "@ethersproject/abstract-provider"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import clsx from "clsx"
import { useMemo } from "react"

import {
  SDKApplicationMeta,
  IconCmpOut,
  IconCmpSettings,
  Button,
} from "@nfid-frontend/ui"
import { copyToClipboard } from "@nfid-frontend/utils"

import { useExchangeRates } from "frontend/features/fungable-token/eth/hooks/use-eth-exchange-rate"
import { AuthorizingAppMeta } from "frontend/state/authorization"
import { CenterEllipsis } from "frontend/ui/atoms/center-ellipsis"
import { useTimer } from "frontend/ui/utils/use-timer"

import { RPCApplicationMetaSubtitle } from "../ui/app-meta/subtitle"
import { AssetPreview } from "../ui/asset-item"
import { InfoListItem } from "../ui/info-list-item"
import { calcPrice } from "../util/calcPriceUtil"
import { ApproverCmpProps } from "./types"

interface IBuyComponent {
  showTransactionDetails: () => void
  onApprove: () => void
  onCancel: () => void
  applicationMeta?: AuthorizingAppMeta
  isButtonDisabled?: boolean
  fromAddress?: string
  toAddress?: string
  data?: any
  populatedTransaction?: [TransactionRequest, Error | undefined]
}

export const BuyComponent: React.FC<IBuyComponent> = ({
  showTransactionDetails,
  applicationMeta,
  isButtonDisabled: isButtonDisabledProp = false,
  onApprove,
  onCancel,
  fromAddress,
  toAddress,
  data,
  populatedTransaction,
}: IBuyComponent) => {
  const { rates } = useExchangeRates()
  const { counter } = useTimer({
    defaultCounter: 100,
    frequency: 100,
    loop: false,
  })

  const isButtonDisabled = useMemo(
    () => (!isButtonDisabledProp ? isButtonDisabledProp : counter > 0),
    [counter, isButtonDisabledProp],
  )

  const price = useMemo(() => {
    return calcPrice(rates, populatedTransaction)
  }, [rates, populatedTransaction])

  return (
    <TooltipProvider>
      <SDKApplicationMeta
        title="Buy collectible"
        applicationLogo={applicationMeta?.logo}
        subTitle={
          <RPCApplicationMetaSubtitle applicationURL={applicationMeta?.url} />
        }
      />
      <AssetPreview
        icon={data?.meta?.content[0].url}
        title={data?.meta?.name}
        subtitle={data?.collectionData?.name}
      />
      <div className={clsx("mt-6 space-y-2 text-sm")}>
        <InfoListItem
          title="From"
          description={
            <CenterEllipsis
              value={toAddress ?? ""}
              trailingChars={6}
              leadingChars={4}
            />
          }
          icon={
            <IconCmpOut
              className="ml-2.5 cursor-pointer"
              onClick={(e) => copyToClipboard(e, toAddress)}
            />
          }
        />
        <InfoListItem
          title="To"
          description={
            <CenterEllipsis
              value={fromAddress ?? ""}
              trailingChars={6}
              leadingChars={4}
            />
          }
          icon={
            <IconCmpOut
              className="ml-2.5 cursor-pointer"
              onClick={(e) => copyToClipboard(e, fromAddress)}
            />
          }
        />
        <InfoListItem title="Network" description={data?.blockchain} />
        <InfoListItem
          title="Network fee"
          description={`$${price?.feeUsd}`}
          tooltip="Applies to all transactions. Not paid to NFID Wallet."
          icon={<IconCmpSettings className="ml-[6px] cursor-pointer" />}
        />
        <InfoListItem
          title="Collectible cost"
          description={`${price?.price} ETH`}
        />
        <InfoListItem
          title="Total"
          description={`${price?.total} ETH`}
          isBold
          subDescription={`~$${price.totalUsd}`}
        />
      </div>

      <p
        className="mt-4 text-sm text-blue-600 cursor-pointer"
        onClick={showTransactionDetails}
      >
        Transaction details
      </p>
      <div className="flex items-center w-full mt-14">
        <Button type="stroke" className="w-full mr-2" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          disabled={isButtonDisabled}
          className={clsx(
            "w-full relative disabled:bg-gray-200 overflow-hidden",
          )}
          onClick={onApprove}
        >
          <div
            className={clsx(
              "absolute left-0 top-0",
              "h-full w-full bg-gray-400/30 transition-all",
              !isButtonDisabled && "hidden",
            )}
            style={{
              transform: `translateX(calc(-1%*${counter}))`,
            }}
          />
          Confirm
        </Button>
      </div>
    </TooltipProvider>
  )
}

const MappedBuy: React.FC<ApproverCmpProps> = ({
  appMeta,
  rpcMessage,
  rpcMessageDecoded,
  populatedTransaction,
  onConfirm,
  onReject,
}) => {
  return (
    <BuyComponent
      applicationMeta={appMeta}
      // TODO: handle details internally
      showTransactionDetails={() => {}}
      onApprove={onConfirm}
      onCancel={onReject}
      data={rpcMessageDecoded?.data}
      fromAddress={rpcMessage?.params[0].from}
      toAddress={rpcMessage?.params[0].to}
      populatedTransaction={populatedTransaction}
    />
  )
}

export default MappedBuy
