import clsx from "clsx"
import React from "react"

import { QRCode } from "@internet-identity-labs/nfid-sdk-react"

import copy from "./assets/copy.svg"

interface ITransactionReceive extends React.HTMLAttributes<HTMLDivElement> {
  account: string
}

const TransactionReceive: React.FC<ITransactionReceive> = ({ account }) => {
  return (
    <div>
      <div className="w-[220px] my-8 mx-auto">
        <QRCode options={{ width: 220, margin: 0 }} content={`/${account}`} />
      </div>
      <div className="px-5 pt-4 border border-gray-200 rounded-md">
        <div className="flex justify-between">
          <p className="text-sm">Your NFID account</p>
          <img
            src={copy}
            alt="copy"
            className="transition-all cursor-pointer hover:opacity-70"
            onClick={() => navigator.clipboard.writeText(account)}
          />
        </div>
        <div className="flex flex-wrap w-[300px] h-16 mt-4">
          <p className="text-sm break-all text-black-base">{account}</p>
        </div>
      </div>
    </div>
  )
}

export default TransactionReceive
