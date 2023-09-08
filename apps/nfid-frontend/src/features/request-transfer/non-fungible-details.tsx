import useSWR from "swr"

import { Skeleton } from "@nfid-frontend/ui"

import { getNFTByTokenId } from "frontend/integration/entrepot"

export const RequestTransferNFTDetails = ({
  tokenId,
  principalId,
}: {
  tokenId: string
  principalId: string
}) => {
  const { data } = useSWR(tokenId ? ["nftDetails", tokenId] : null, () =>
    getNFTByTokenId(tokenId, principalId),
  )

  console.log({ data })
  return (
    <div className="flex items-center h-20 mt-10 border border-gray-200 rounded-md">
      {data?.assetPreview ? (
        <img
          className="w-20 h-full rounded-[5px]"
          src={data.assetPreview.url}
          alt=""
        />
      ) : (
        <Skeleton className="w-20 h-full rounded-[5px]" />
      )}
      <div className="ml-2.5 flex flex-col justify-center">
        <p className="font-bold">{data?.name}</p>
        <p className="text-sm text-gray-400">{data?.collection.name}</p>
      </div>
    </div>
  )
}
