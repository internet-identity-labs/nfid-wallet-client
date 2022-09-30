import React from "react"
import { toast } from "react-toastify"

import { QRCode } from "frontend/ui/atoms/qrcode"

import copy from "./assets/copy.svg"

interface ITransactionReceive extends React.HTMLAttributes<HTMLDivElement> {
  account: string
  accountPrincipal: string
}

const TransactionReceive: React.FC<ITransactionReceive> = ({
  account,
  accountPrincipal,
}) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(account)
    toast.success("Copied to clipboard", {
      toastId: "copiedToClipboard",
    })
  }
  return (
    <div>
      <div className="w-[220px] my-8 mx-auto">
        <QRCode options={{ width: 220, margin: 0 }} content={account} />
      </div>
      <div className="px-5 pt-4 border border-gray-200 rounded-md">
        <div className="flex justify-between">
          <p className="text-sm">Your NFID account</p>
          <img
            src={copy}
            alt="copy"
            className="transition-all cursor-pointer hover:opacity-70"
            onClick={copyToClipboard}
          />
        </div>
        <div className="flex flex-wrap w-[300px] h-16 mt-4">
          <p className="text-sm break-all text-black-base">{account}</p>
          <p className="absolute w-0 h-0 overflow-hidden opacity-0 ">
            {accountPrincipal}
          </p>
        </div>
      </div>
    </div>
  )
}

export default TransactionReceive
