import clsx from "clsx"
import React, { useEffect } from "react"

import { Button, ImagePngSuccess } from "@nfid-frontend/ui"

interface ITransferModalSuccess {
  transactionMessage: string
  transactionRoute?: string
  onClose: () => void
}

export const TransferSuccess: React.FC<ITransferModalSuccess> = ({
  transactionMessage,
  transactionRoute,
  onClose,
}) => {
  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      e.preventDefault()
      e.stopPropagation()
      onClose()
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [onClose])

  return (
    <div
      className={clsx(
        "text-black text-center",
        "flex flex-grow flex-col justify-between",
      )}
    >
      <div className="flex-grow">
        <img
          className="w-[240px] mx-auto"
          src={ImagePngSuccess}
          alt="success"
        />
        <p className="text-xl font-bold">Transaction successful</p>
        <p className="font-bold mt-[10px] mb-3">{transactionMessage}</p>
        <p className={clsx("text-sm", !transactionRoute?.length && "hidden")}>
          You can view transaction details in the <br />
          <a
            target="_blank"
            rel="noreferrer"
            href={transactionRoute}
            onClick={onClose}
            className="transition-opacity cursor-pointer text-blue hover:opacity-75"
          >
            Transaction history
          </a>
          .
        </p>
      </div>
      <Button type="primary" block className="mt-[36px]" onClick={onClose}>
        Close
      </Button>
    </div>
  )
}
