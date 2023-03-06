import { TooltipProvider } from "@radix-ui/react-tooltip"
import clsx from "clsx"
import { useMemo, useState } from "react"

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

interface IBuyComponent {
  showTransactionDetails: () => void
  onApprove: () => void
  onCancel: () => void
  applicationMeta?: AuthorizingAppMeta
  isButtonDisabled: boolean
  fromAddress?: string
  toAddress?: string
  data?: any
  feeMin?: string
  feeMax?: string
  price?: string
}

export const BuyComponent = ({
  showTransactionDetails,
  applicationMeta,
  onApprove,
  onCancel,
  fromAddress,
  toAddress,
  feeMin,
  feeMax,
  price,
  data,
}: IBuyComponent) => {
  const { rates } = useExchangeRates(["ETH"])
  const [isButtonDisabled, setIsButtonDisable] = useState(true)
  const { counter } = useTimer({
    defaultCounter: 100,
    frequency: 100,
    loop: false,
    onElapsed: () => setIsButtonDisable(false),
  })

  const fee = useMemo(() => {
    if (!feeMin || !feeMax || !rates)
      return { averageInEth: 0, averageInUsd: 0 }

    const minFeeInEth = Number(parseInt(feeMin, 16)) / 10 ** 18
    const minFeeInUsd = (minFeeInEth * rates["ETH"]).toFixed(2)

    const maxFeeInEth = Number(parseInt(feeMax, 16)) / 10 ** 18
    const maxFeeInUsd = (maxFeeInEth * rates["ETH"]).toFixed(2)

    return {
      min: minFeeInUsd,
      max: maxFeeInUsd,
      averageInEth: (minFeeInEth + maxFeeInEth) / 2,
      averageInUsd: Number(((minFeeInEth + maxFeeInEth) / 2).toFixed(2)),
    }
  }, [feeMax, feeMin, rates])

  const collectibleCost = useMemo(() => {
    if (!price || !rates) return { eth: 0, usd: 0 }

    const costInEth = Number(parseInt(price, 16)) / 10 ** 18
    const costInUsd = Number((costInEth * rates["ETH"]).toFixed(2))

    return {
      eth: costInEth,
      usd: costInUsd,
    }
  }, [price, rates])

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
          description={`$${fee?.min}-$${fee.max}`}
          tooltip="Applies to all transactions. Not paid to NFID Wallet."
          icon={<IconCmpSettings className="ml-[6px] cursor-pointer" />}
        />
        <InfoListItem
          title="Collectible cost"
          description={`${collectibleCost.eth} ETH`}
        />
        <InfoListItem
          title="Total"
          description={`${collectibleCost.eth + fee?.averageInEth} ETH`}
          isBold
          subDescription={`~$${collectibleCost.usd + fee?.averageInUsd}`}
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
