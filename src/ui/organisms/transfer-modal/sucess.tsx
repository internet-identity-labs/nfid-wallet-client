import clsx from "clsx"
import React from "react"
import { Link } from "react-router-dom"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { Button } from "frontend/ui/atoms/button"

import success from "./assets/success.png"

interface ITransferModalSuccess {
  transactionMessage: string
  onClose: () => void
}

export const TransferModalSuccess: React.FC<ITransferModalSuccess> = ({
  transactionMessage,
  onClose,
}) => {
  return (
    <div
      className={clsx(
        "text-black-base text-center",
        "flex flex-grow flex-col justify-between",
      )}
    >
      <div className="flex-grow">
        <img className="w-[240px] mx-auto" src={success} alt="success" />
        <p className="text-xl font-bold">Transaction successful</p>
        <p className="font-bold mt-[10px] mb-3">{transactionMessage}</p>
        <p className="text-sm ">
          You can view transaction details in the <br />
          <a
            target="_blank"
            ref="noreferrer"
            href={`${ProfileConstants.base}/${ProfileConstants.transactions}`}
            onClick={onClose}
            className="text-blue-600 transition-opacity cursor-pointer hover:opacity-75"
          >
            Transaction history
          </a>
          .
        </p>
      </div>
      <Button
        className="w-full bg-blue-600 text-white mt-[36px]"
        onClick={onClose}
      >
        Close
      </Button>
    </div>
  )
}
