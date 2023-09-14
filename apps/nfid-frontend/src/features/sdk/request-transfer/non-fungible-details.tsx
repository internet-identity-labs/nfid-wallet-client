import { Loader, Skeleton } from "@nfid-frontend/ui"

import { UserNFTDetails } from "frontend/integration/entrepot/types"

export const RequestTransferNFTDetails = ({
  nft,
}: {
  nft?: UserNFTDetails
}) => {
  if (!nft) return <Loader isLoading={true} />

  return (
    <div className="flex items-center h-20 mt-10 border border-gray-200 rounded-md">
      {nft?.assetPreview ? (
        <img
          className="w-20 h-full rounded-[5px]"
          src={nft.assetPreview.url}
          alt=""
        />
      ) : (
        <Skeleton className="w-20 h-full rounded-[5px]" />
      )}
      <div className="ml-2.5 flex flex-col justify-center">
        <p className="font-bold">{nft?.name}</p>
        <p className="text-sm text-gray-400">{nft?.collection.name}</p>
      </div>
    </div>
  )
}
