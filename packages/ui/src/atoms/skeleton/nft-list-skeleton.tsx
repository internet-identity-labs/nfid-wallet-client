import { HTMLAttributes } from "react"

import { Skeleton } from "."

interface NftSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  nftsAmount: number
}

export const NftSkeleton = ({ nftsAmount }: NftSkeletonProps) => {
  return (
    <>
      {Array.from({ length: nftsAmount }).map((_, index) => (
        <Skeleton
          key={`skeleton${index}`}
          className="w-full rounded-[12px] min-h-[400px]"
        >
          <div className="w-full aspect-square bg-[#D2D2D2] rounded-[12px]"></div>
          <div className="p-[10px]">
            <div className="h-[24px] my-[10px] bg-[#D2D2D2] rounded-[12px]"></div>
            <div className="h-[20px] bg-[#D2D2D2] rounded-[12px]"></div>
          </div>
        </Skeleton>
      ))}
    </>
  )
}
