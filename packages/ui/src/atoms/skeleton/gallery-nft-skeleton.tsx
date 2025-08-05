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
        <div
          key={`skeleton${index}`}
          className={clsx(
            "w-full rounded-[12px] min-h-[400px] bg-gray-50 dark:bg-zinc-800",
          )}
        >
          <Skeleton
            className={clsx("w-full aspect-square rounded-[12px]", className)}
          />
          <div className="p-[10px] dark:bg-zinc-800">
            <Skeleton
              className={clsx(
                "w-[80%] h-[24px] my-[10px] rounded-[12px]",
                className,
              )}
            />
            <Skeleton
              className={clsx("w-[50%] h-[20px] rounded-[12px]", className)}
            />
          </div>
        </div>
      ))}
    </>
  )
}
