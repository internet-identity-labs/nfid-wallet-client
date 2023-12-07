import clsx from "clsx"

import {
  Button,
  IWarningAccordionOption,
  IconCmpOut,
  IconCmpSettings,
  InfoListItem,
  SDKApplicationMeta,
  WarningAccordion,
} from "@nfid-frontend/ui"

import { RPCApplicationMetaSubtitle } from "frontend/features/embed-controller/ui/app-meta/subtitle"
import { AuthorizingAppMeta } from "frontend/state/authorization"
import { CenterEllipsis } from "frontend/ui/atoms/center-ellipsis"

import { AssetPreview, IAsset } from "./asset-preview"

interface ISendTransaction {
  title?: string
  applicationMeta: AuthorizingAppMeta
  fromAddress?: string
  toAddress?: string
  network: string
  networkFee?: string
  totalUSD: string
  totalToken: string
  price?: string
  currency: string
  warnings?: IWarningAccordionOption[]
  isInsufficientBalance?: boolean
  assets?: IAsset[]
  disableApproveButton?: boolean
  onAdjustNetworkFee?: () => void
  onShowTransactionDetails?: () => void
  onApprove: () => void
  onCancel: () => void
}

export const SendTransaction = ({
  title = "Review",
  applicationMeta,
  fromAddress,
  toAddress,
  network,
  networkFee,
  totalUSD,
  totalToken,
  price,
  currency,
  warnings,
  isInsufficientBalance,
  disableApproveButton,
  assets,
  onAdjustNetworkFee,
  onShowTransactionDetails,
  onApprove,
  onCancel,
}: ISendTransaction) => {
  return (
    <div className="flex flex-col justify-between flex-1">
      <div>
        <SDKApplicationMeta
          title={title}
          applicationLogo={applicationMeta?.logo}
          subTitle={
            <RPCApplicationMetaSubtitle applicationURL={applicationMeta?.url} />
          }
        />
        <AssetPreview assets={assets} />

        <div className="mt-5 space-y-3">
          {fromAddress && (
            <InfoListItem
              title="From"
              icon={
                <IconCmpOut
                  className="w-[18px] cursor-pointer"
                  onClick={(e) =>
                    window.open(
                      // PASHUNYA TODO: use network
                      `https://etherscan.io/address/${fromAddress}`,
                    )
                  }
                />
              }
            >
              <CenterEllipsis
                value={fromAddress}
                leadingChars={6}
                trailingChars={4}
              />
            </InfoListItem>
          )}
          {toAddress && (
            <InfoListItem
              title="To"
              icon={
                <IconCmpOut
                  className="w-[18px] cursor-pointer"
                  onClick={(e) =>
                    window.open(
                      // PASHUNYA TODO: use network
                      `https://etherscan.io/address/${toAddress}`,
                    )
                  }
                />
              }
            >
              <CenterEllipsis
                value={toAddress}
                leadingChars={6}
                trailingChars={4}
              />
            </InfoListItem>
          )}
          <InfoListItem title="Network">{network}</InfoListItem>
          {networkFee && (
            <InfoListItem
              title="Network fee"
              tooltip="Applies to all transactions. Not paid to NFID Wallet."
              icon={
                onAdjustNetworkFee && (
                  <IconCmpSettings
                    className="ml-1.5 cursor-pointer text-black"
                    onClick={onAdjustNetworkFee}
                  />
                )
              }
            >
              {`${networkFee} ${currency}`}
            </InfoListItem>
          )}
          {price && (
            <InfoListItem
              title={
                assets && assets?.length > 1
                  ? "Collectibles cost"
                  : "Collectible cost"
              }
            >
              {`${price} ${currency}`}
            </InfoListItem>
          )}
          {totalToken && (
            <InfoListItem title="Total" isBold>
              <div className="relative">
                <p>
                  {totalToken} {currency}
                </p>

                <div
                  className={clsx(
                    "text-xs leading-4 text-gray-400 font-normal",
                    "absolute right-0 top-full",
                  )}
                >
                  ~${totalUSD}
                </div>
              </div>
            </InfoListItem>
          )}
        </div>
        <p
          className="mt-10 text-sm cursor-pointer text-blue"
          onClick={onShowTransactionDetails}
        >
          Transaction details
        </p>
        {isInsufficientBalance && (
          <p className="my-3 text-xs text-red">
            Insufficient balance in you account to pay for this transaction.{" "}
            <span className="font-semibold text-blue">Buy ETH</span> or deposit
            from another account.
          </p>
        )}
      </div>
      <div>
        <WarningAccordion warnings={warnings} />
        <div className="flex items-center w-full space-x-2.5">
          <Button type="stroke" className="w-full" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="primary"
            className={clsx("w-full", isInsufficientBalance && "!bg-gray-300")}
            onClick={onApprove}
            disabled={isInsufficientBalance || disableApproveButton}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}
