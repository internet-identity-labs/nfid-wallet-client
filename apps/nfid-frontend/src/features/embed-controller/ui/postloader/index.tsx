import clsx from "clsx"
import { useEffect, useState } from "react"

import { IconCmpLoading } from "@nfid-frontend/ui"

const TransactionStatuses = [
  "Verifying balance",
  "Securing connection",
  "Approving transaction",
  "Processing withdrawal",
  "Confirming transaction",
]

export const PostloaderComponent = () => {
  const [currentStatus, setCurrentStatus] = useState(0)

  useEffect(() => {
    setInterval(() => {
      if (currentStatus === 4) return
      setCurrentStatus(currentStatus + 1)
    }, 1000)
  }, [currentStatus])

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center",
        "w-full h-full font-bold text-gray-400",
        "text-sm",
      )}
    >
      <IconCmpLoading />
      <p className="mt-4">{TransactionStatuses[currentStatus]}...</p>
    </div>
  )
}
