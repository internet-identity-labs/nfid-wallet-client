import { TooltipProvider } from "@radix-ui/react-tooltip"
import clsx from "clsx"

import { SDKApplicationMeta, IconCmpOut, Button } from "@nfid-frontend/ui"
import { copyToClipboard } from "@nfid-frontend/utils"

import { AuthorizingAppMeta } from "frontend/state/authorization"
import { CenterEllipsis } from "frontend/ui/atoms/center-ellipsis"

import { RPCApplicationMetaSubtitle } from "../ui/app-meta/subtitle"
import { AssetPreview } from "../ui/asset-item"
import { InfoListItem } from "../ui/info-list-item"

interface ISellComponent {
  showTransactionDetails: () => void
  onApprove: () => void
  onCancel: () => void
  applicationMeta?: AuthorizingAppMeta
  fromAddress?: string
  data?: any
}

export const SellComponent = ({
  showTransactionDetails,
  applicationMeta,
  onApprove,
  onCancel,
  fromAddress,
  data,
}: ISellComponent) => {
  return (
    <TooltipProvider>
      <SDKApplicationMeta
        title="Pre-authorize withdrawal"
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
          className={clsx(
            "w-full relative disabled:bg-gray-200 overflow-hidden",
          )}
          onClick={onApprove}
        >
          Confirm
        </Button>
      </div>
    </TooltipProvider>
  )
}
