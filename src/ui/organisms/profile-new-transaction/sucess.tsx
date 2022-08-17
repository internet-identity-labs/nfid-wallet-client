import React from "react"

import { Button } from "frontend/ui/atoms/button"

import success from "./assets/success.png"

interface ITransactionSuccess extends React.HTMLAttributes<HTMLDivElement> {
  sum: string | number
  onClose: () => void
}

const TransactionSuccess: React.FC<ITransactionSuccess> = ({
  sum,
  onClose,
}) => {
  return (
    <div className="text-black-base px-[10px] pb-[30px] text-center">
      <div className="ml-6">
        <img src={success} alt="success" />
      </div>
      <p className="text-xl font-bold">Transaction successful</p>
      <p className="font-bold mt-[10px] mb-3">{sum} ICP was sent</p>
      <p className="text-sm ">
        You can view transaction details on the Transaction history page.
      </p>
      <Button
        className="w-full bg-blue-600 text-white mt-[36px]"
        onClick={onClose}
      >
        Close
      </Button>
    </div>
  )
}

export default TransactionSuccess
