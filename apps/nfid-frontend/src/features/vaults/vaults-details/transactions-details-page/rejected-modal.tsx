import clsx from "clsx"

import { ModalAdvanced } from "@nfid/ui"

export interface IVaultTransactionRejectReason {
  error: string
}

export const VaultTransactionRejectReason = ({
  error,
}: IVaultTransactionRejectReason) => {
  return (
    <ModalAdvanced
      large
      title="Transaction status details"
      secondaryButton={{
        type: "primary",
        onClick: () => {},
        text: "Close",
        block: true,
      }}
      trigger={<div className="cursor-pointer text-blue">Details</div>}
    >
      <p className="text-sm">
        Text describing the reason for rejection. NFID is a privacy-preserving,
        one-touch multi-factor wallet protocol developed by Internet Identity
        Labs.
      </p>
      <p className="mt-6 mb-1 text-xs">Error details</p>
      <div
        className={clsx(
          "border rounded-md border-red ring-[3px] ring-red-100",
          "py-2 px-2.5 text-secondary text-sm min-h-[200px]",
        )}
      >
        {error}
      </div>
    </ModalAdvanced>
  )
}
