import { useState } from "react"

import { IconCmpArrow, IconCmpWarning } from "@nfid-frontend/ui"

import { InfoItem } from "../checkout/info-item"

interface ITransaction {
  onClose: () => void
}

export const TransactionDetails = ({ onClose }: ITransaction) => {
  const [isParsable] = useState(false)

  return (
    <div className="flex flex-col flex-1 h-full text-sm">
      <div className="flex items-center">
        <IconCmpArrow onClick={onClose} />
        <p className="text-xl font-bold ml-2.5">Transaction details</p>
      </div>
      <p className="my-6">
        To protect yourself against scammers, take a moment to verify
        transaction details.
      </p>
      {isParsable ? (
        <div className="bg-gray-50 rounded-md p-[14px] space-y-[14px] flex-1 h-full">
          <InfoItem
            title={"Function type"}
            description={
              "Swap Exact ETH For Tokens (Uint256, Address[], Address, Uint256)"
            }
          />
          <InfoItem
            title={"Function type"}
            description={
              "Swap Exact ETH For Tokens (Uint256, Address[], Address, Uint256)"
            }
          />
          <InfoItem
            title={"Function type"}
            description={
              "Swap Exact ETH For Tokens (Uint256, Address[], Address, Uint256)"
            }
          />
        </div>
      ) : (
        <div className="flex flex-col flex-1 h-full">
          <div className="flex rounded-md bg-orange-50 p-[15px]">
            <IconCmpWarning className="mr-2.5 text-orange-500" />
            <p>Cannot read properties of undefined (reading ‘map’)</p>
          </div>
          <div className="mt-[14px] bg-gray-50 rounded-md flex-1 h-full p-[14px]">
            <InfoItem
              title={"Function type"}
              description={
                "SetApprovalForAll (Address Uint256, Bytes4, Bytes, Uint256, Address, Uint256, Uint256, Bytes, Bytes, Uint256, Uint256, Bytes)"
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}
