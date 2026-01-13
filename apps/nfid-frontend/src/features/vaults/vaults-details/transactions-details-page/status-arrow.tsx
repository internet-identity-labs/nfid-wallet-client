import clsx from "clsx"

import { TransactionState } from "@nfid/integration"
import { IconCmpArrow } from "@nfid/ui"

interface ITransactionStatusArrow {
  state?: TransactionState
}
export const TransactionStatusArrow = ({ state }: ITransactionStatusArrow) => {
  return (
    <div
      className={clsx(
        "absolute -translate-x-1/2 left-1/2 top-1/2 -translate-y-1/2",
        "-rotate-90 md:rotate-180 rounded-full text-white",
        "flex items-center justify-center",
        "w-10 h-10 md:w-14 md:h-14",
        state === TransactionState.PENDING && "bg-amber-500",
        state === TransactionState.APPROVED && "bg-emerald-500",
        state === TransactionState.REJECTED && "bg-red-500",
        state === TransactionState.CANCELED && "bg-gray-500",
      )}
    >
      <IconCmpArrow />
    </div>
  )
}
