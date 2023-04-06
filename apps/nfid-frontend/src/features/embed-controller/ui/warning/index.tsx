import clsx from "clsx"

import { IconCmpArrowRight, IconCmpWarning } from "@nfid-frontend/ui"

import { AccordionV2 } from "frontend/ui/atoms/accordion/index_v2"

export interface IWarningComponent {
  isNetworkBusy?: boolean
  isAuthorizeAll?: boolean
  isPreviewUnavailable?: boolean
}
export const WarningComponent = ({
  isNetworkBusy,
  isAuthorizeAll,
  isPreviewUnavailable,
}: IWarningComponent) => {
  return (
    <AccordionV2
      className="w-full p-4 rounded-md bg-orange-50"
      trigger={
        <div className={clsx("flex items-center justify-between")}>
          <div className="flex items-center text-sm font-bold">
            <IconCmpWarning className="text-orange w-[18px] mr-2.5" />
            <p>Attention required</p>
          </div>
          <div>
            <IconCmpArrowRight className="rotate-90" />
          </div>
        </div>
      }
    >
      <div className="pt-3 space-y-3 text-sm px-7">
        {isPreviewUnavailable && (
          <div>
            <p className="font-bold">Preview unavailable</p>
            <p>
              Unable to estimate asset changes. Please make sure you trust this
              dapp.
            </p>
          </div>
        )}
        {isNetworkBusy && (
          <div>
            <p className="font-bold">Network is busy</p>
            <p>
              Gas prices are high and estimates are less accurate.{" "}
              <span className="text-blue">Adjust the network fee.</span>
            </p>
          </div>
        )}
        {isAuthorizeAll && (
          <div>
            <p className="font-bold">Entire collection can be withdrawn</p>
            <p>
              This dapp can withdraw all your BitCoin Elep NFTs. Make sure you
              trust this site.
            </p>
          </div>
        )}
      </div>
    </AccordionV2>
  )
}
