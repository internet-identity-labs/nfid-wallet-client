import { Skeleton } from "@nfid/ui"

import { UserNFTDetails } from "frontend/integration/entrepot/types"

export const RequestTransferNFTDetails = ({
  nft,
}: {
  nft?: UserNFTDetails
}) => {
  if (!nft)
    return (
      <div className="flex items-center h-20 mt-5 border border-gray-200 rounded-md">
        <Skeleton className="w-20 h-full rounded-[5px]" />
        <div className="ml-2.5 flex flex-col justify-center space-y-2">
          <Skeleton className="w-[300px] h-5" />
          <Skeleton className="w-[200px] h-5" />
        </div>
      </div>
    )

  return (
    <div className="flex items-center h-20 mt-5 border border-gray-200 rounded-md">
      <img
        className="w-20 h-full rounded-[5px]"
        src={nft.assetPreview.url}
        alt=""
      />
      <div className="ml-2.5 flex flex-col justify-center">
        <p id="NFTName" className="font-bold">
          {nft?.name}
        </p>
        <p className="text-sm text-gray-400">{nft?.collection.name}</p>
      </div>
    </div>
  )
}
