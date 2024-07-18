import clsx from "clsx"

import {
  Button,
  IconCmpWarning,
  IconSvgNFIDWalletLogo,
} from "@nfid-frontend/ui"

export interface RPCComponentErrorProps {
  onRetry: () => void
  onCancel: () => void
  error?: Error
}

export const RPCComponentError = ({
  onRetry,
  onCancel,
  error,
}: RPCComponentErrorProps) => {
  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex flex-col items-center mt-10 text-sm text-center">
        <img
          alt="NFID Wallet"
          className="w-[182px]"
          src={IconSvgNFIDWalletLogo}
        />
      </div>
      <div className="flex flex-1 bg-orange-50 p-[15px] text-orange-900 gap-2.5 mt-10 rounded-xl">
        <div className="w-[22px] shrink-0">
          <IconCmpWarning className="!text-orange-900" />
        </div>
        <div className="w-full text-sm">
          <p className="mb-1 font-bold">Request failed</p>
          <p>{error?.message ?? "Unknown error"}</p>
        </div>
      </div>
      <div className={clsx("grid grid-cols-2 gap-5 mt-5 lg:mt-32")}>
        <Button type="stroke" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="primary" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  )
}
