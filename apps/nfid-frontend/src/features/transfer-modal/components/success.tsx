import clsx from "clsx"
import React from "react"

import { Button, Image, ImagePngSuccess } from "@nfid-frontend/ui"

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
  return (
    <div
      id={"success_window"}
      className={clsx(
        "text-black text-center",
        "flex flex-grow flex-col justify-between",
      )}
    >
      <div className="flex-grow">
        <Image
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
