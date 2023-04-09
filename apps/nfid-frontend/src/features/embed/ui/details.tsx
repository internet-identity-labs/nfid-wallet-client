import { IconCmpArrow, IconCmpWarning, InfoListItem } from "@nfid-frontend/ui"

interface ITransaction {
  onClose: () => void
}

export const Details = ({ onClose }: ITransaction) => {
  return (
    <div className="flex flex-col flex-1 h-full text-sm">
      <div className="flex items-center">
        <IconCmpArrow className="cursor-pointer" onClick={onClose} />
        <p className="text-xl font-bold ml-2.5">Transaction details</p>
      </div>
      <p className="my-6">
        To protect yourself against scammers, take a moment to verify
        transaction details.
      </p>

      <div className="flex flex-col flex-1 h-full">
        <div className="flex rounded-md bg-orange-50 p-[15px]">
          <IconCmpWarning className="mr-2.5 text-orange-500" />
          <p>Cannot read properties of undefined (reading ‘map’)</p>
        </div>
        <div className="mt-[14px] bg-gray-50 rounded-md flex-1 h-full p-[14px]">
          <InfoListItem
            className="text-gray-500"
            title="Function type"
            isVerticalCentered={false}
          >
            SetApprovalForAll (Address Uint256, Bytes4, Bytes, Uint256, Address,
            Uint256, Uint256, Bytes, Bytes, Uint256, Uint256, Bytes)
          </InfoListItem>
        </div>
      </div>
    </div>
  )
}
