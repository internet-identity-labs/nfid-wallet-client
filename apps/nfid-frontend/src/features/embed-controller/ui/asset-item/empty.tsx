import clsx from "clsx"

import { IconCmpWarning } from "@nfid-frontend/ui"

export const EmptyAssetPreview = () => {
  return (
    <div className={clsx("flex rounded-md", "bg-orange-50 p-3")}>
      <IconCmpWarning className="w-[18px] mr-3 text-orange-500" />
      <div className="text-sm">
        <p className="font-bold">Transaction preview unavailable</p>
        <p className="mt-2.5">
          Unable to estimate asset changes. Please make sure you trust this
          dapp.
        </p>
      </div>
    </div>
  )
}
