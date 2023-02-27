import clsx from "clsx"
import { useEffect, useState } from "react"

import { IconCmpLoading, SDKFooter, Skeleton } from "@nfid-frontend/ui"

enum TransactionStatuses {
  "Verifying balance",
  "Securing connection",
  "Approving transaction",
  "Processing withdrawal",
  "Confirming transaction",
}

export const CheckoutPostloader = () => {
  const [currentStatus, setCurrentStatus] = useState(0)

  useEffect(() => {
    setInterval(() => {
      setCurrentStatus(currentStatus + 1)
    }, 1000)
  }, [currentStatus])

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center",
        "w-full h-full font-bold",
      )}
    >
      <IconCmpLoading />
      <p>{TransactionStatuses[currentStatus]}...</p>
    </div>
  )
}
