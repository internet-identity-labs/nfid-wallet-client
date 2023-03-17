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
import { BatchAssetPreview } from "../ui/asset-item/batch"
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

export const BatchBuyComponent = ({
  showTransactionDetails,
  applicationMeta,
  isButtonDisabled: isButtonDisabledProp,
  onApprove,
  onCancel,
  fromAddress,
  toAddress,
  data,
}: IBuyComponent) => {
  const { rates } = useExchangeRates(["ETH"])
  const { counter } = useTimer({
    defaultCounter: 100,
    frequency: 100,
    loop: false,
  })

  const isButtonDisabled = useMemo(
    () => (!isButtonDisabledProp ? isButtonDisabledProp : counter > 0),
    [counter, isButtonDisabledProp],
  )

  //   const collectiblesTotal = useMemo(() => {
  //     return data?.items.map((item) => console.log({ item }))
  //   }, [])

  return (
    <div className="relative">
      <TooltipProvider>
        <SDKApplicationMeta
          title="Buy multiple collectibles"
          applicationLogo={applicationMeta?.logo}
          subTitle={
            <RPCApplicationMetaSubtitle applicationURL={applicationMeta?.url} />
          }
        />
        <BatchAssetPreview items={data?.items} />
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
          <InfoListItem title="Network" description="ETHEREUM" />
          <InfoListItem
            title="Network fee"
            description={`$0-$0`}
            tooltip="Applies to all transactions. Not paid to NFID Wallet."
            icon={<IconCmpSettings className="ml-[6px] cursor-pointer" />}
          />
          <InfoListItem title="Collectibles cost" description={`0 ETH`} />
          <InfoListItem
            title="Total"
            description={`0 ETH`}
            isBold
            subDescription={`~$0`}
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
    </div>
  )
}
