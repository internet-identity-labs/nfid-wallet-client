import { TooltipProvider } from "@radix-ui/react-tooltip"
import clsx from "clsx"
import { useMemo, useState } from "react"

import {
  SDKApplicationMeta,
  IconCmpInfo,
  IconCmpOut,
  IconCmpSettings,
  Button,
  Tooltip,
} from "@nfid-frontend/ui"
import { copyToClipboard } from "@nfid-frontend/utils"

import { CenterEllipsis } from "frontend/ui/atoms/center-ellipsis"
import { useTimer } from "frontend/ui/utils/use-timer"

import { CheckoutItem } from "./checkout-item"
import { InfoItem } from "./info-item"

interface ICheckoutPage {
  showTransactionDetails: () => void
  onApprove: () => void
  onCancel: () => void
  applicationURL?: string
  applicationLogo?: string
  fromAddress?: string
  toAddress?: string
  data?: any
  networkFee?: string
  price?: string
}

export const CheckoutPage = ({
  showTransactionDetails,
  onApprove,
  onCancel,
  applicationURL,
  applicationLogo,
  fromAddress,
  toAddress,
  networkFee,
  price,
  data,
}: ICheckoutPage) => {
  const [isButtonDisabled, setIsButtonDisable] = useState(true)
  const { counter } = useTimer({
    defaultCounter: 100,
    frequency: 100,
    loop: false,
    onElapsed: () => setIsButtonDisable(false),
  })

  const calculatedFee = useMemo(() => {
    if (!networkFee) return 0

    return Number((Number(parseInt(networkFee, 16)) / 10 ** 18).toFixed(4))
  }, [networkFee])

  const collectibleCost = useMemo(() => {
    if (!price) return 0

    return Number((Number(parseInt(price, 16)) / 10 ** 18).toFixed(4))
  }, [price])

  return (
    <TooltipProvider>
      <SDKApplicationMeta
        title="Buy collectible"
        applicationLogo={applicationLogo}
        subTitle={
          <div className="flex items-center space-x-1">
            <span>Request from</span>
            <a
              className="text-blue hover:opacity-70"
              href={`https://${applicationURL}`}
              target="_blank"
              rel="noreferrer"
            >
              {applicationURL}
            </a>
            <Tooltip tip="123">
              <IconCmpInfo className="w-4 text-gray-400" />
            </Tooltip>
          </div>
        }
      />
      <CheckoutItem
        icon={data?.meta?.content[0].url ?? ""}
        title={data?.meta?.name}
        subtitle={data?.collectionData?.name}
      />
      <div className={clsx("mt-6 space-y-2 text-sm")}>
        <InfoItem
          title="From"
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
        <InfoItem
          title="To"
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
        <InfoItem title="Network" description={data?.blockchain} />
        <InfoItem
          title="Network fee"
          description={`${calculatedFee} ETH`}
          tooltip="123"
          icon={<IconCmpSettings className="ml-[6px] cursor-pointer" />}
        />
        <InfoItem
          title="Collectible cost"
          description={`${collectibleCost} ETH`}
        />
        <InfoItem
          title="Total"
          description={`${collectibleCost + calculatedFee} ETH`}
          isBold
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
