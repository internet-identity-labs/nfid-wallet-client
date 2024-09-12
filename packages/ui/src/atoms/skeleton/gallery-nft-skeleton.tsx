import clsx from "clsx"

import { Skeleton } from "./skeleton"

export const GalleryNftSkeleton = ({
  nftsAmount,
  className,
}: {
  nftsAmount: number
  className?: string
}) => {
  return (
    <>
      {Array.from({ length: nftsAmount }).map((_, index) => (
        <Skeleton
          key={`skeleton${index}`}
          className={clsx("w-full rounded-[12px] min-h-[400px] bg-gray-50")}
        >
          <div
            className={clsx("w-full aspect-square rounded-[12px]", className)}
          ></div>
          <div className="p-[10px]">
            <div
              className={clsx(
                "w-[80%] h-[24px] my-[10px] rounded-[12px]",
                className,
              )}
            ></div>
            <div
              className={clsx("w-[50%] h-[20px]  rounded-[12px]", className)}
            ></div>
          </div>
        </Skeleton>
      ))}
    </>
  )
}
