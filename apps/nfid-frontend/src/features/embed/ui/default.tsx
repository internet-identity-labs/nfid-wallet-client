import clsx from "clsx"

import {
  SDKApplicationMeta,
  IconCmpOut,
  IconCmpSettings,
  Button,
  SDKApplicationMetaProps,
  InfoListItem,
  WarningAccordion,
  IWarningAccordionOption,
} from "@nfid-frontend/ui"

import { RPCApplicationMetaSubtitle } from "frontend/features/embed-controller/ui/app-meta/subtitle"
import { CenterEllipsis } from "frontend/ui/atoms/center-ellipsis"

interface IDefaultComponent {
  applicationMeta?: SDKApplicationMetaProps & { applicationURL?: string }
  fromAddress: string
  toAddress: string
  network: string
  networkFee: string
  totalUSD: string
  totalToken: string
  currency: string
  warnings: IWarningAccordionOption[]

  onApprove: () => void
  onCancel: () => void
  onShowTransactionDetails?: () => void
  onAdjustNetworkFee?: () => void
}

export const DefaultComponent: React.FC<IDefaultComponent> = ({
  applicationMeta,
  fromAddress,
  toAddress,
  network,
  networkFee,
  totalUSD,
  totalToken,
  currency,
  warnings,

  onApprove,
  onCancel,
  onShowTransactionDetails,
  onAdjustNetworkFee,
}: IDefaultComponent) => {
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <SDKApplicationMeta
          {...applicationMeta}
          subTitle={
            <RPCApplicationMetaSubtitle
              applicationURL={applicationMeta?.applicationURL}
            />
          }
        />
        <div className="mt-5 space-y-3">
          <InfoListItem
            title="From"
            icon={
              <IconCmpOut
                className="w-[18px] cursor-pointer"
                onClick={(e) => {}}
              />
            }
          >
            <CenterEllipsis
              value={fromAddress}
              leadingChars={6}
              trailingChars={4}
            />
          </InfoListItem>
          <InfoListItem
            title="To"
            icon={
              <IconCmpOut
                className="w-[18px] cursor-pointer"
                onClick={(e) => {}}
              />
            }
          >
            <CenterEllipsis
              value={toAddress}
              leadingChars={6}
              trailingChars={4}
            />
          </InfoListItem>
          <InfoListItem title="Network">{network}</InfoListItem>
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
                ≈${totalUSD}
              </div>
            </div>
          </InfoListItem>
        </div>
        <p
          className="mt-10 text-sm text-blue-600 cursor-pointer"
          onClick={onShowTransactionDetails}
        >
          Transaction details
        </p>
      </div>
      <div>
        <WarningAccordion warnings={warnings} />
        <div className="flex items-center w-full space-x-2.5">
          <Button type="stroke" className="w-full" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" className="w-full" onClick={onApprove}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}
