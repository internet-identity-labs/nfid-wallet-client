import clsx from "clsx"

import { Skeleton } from "./skeleton"

export const UserListingsSkeleton = ({
  listingsAmount,
  className,
}: {
  listingsAmount: number
  className?: string
}) => {
  return (
    <>
      {Array.from({ length: listingsAmount }).map((_, index) => (
        <div
          key={`skeleton${index}`}
          className={clsx(
            "flex items-center justify-between gap-3 w-full rounded-[12px] h-[94px] bg-gray-50 dark:bg-zinc-800 overflow-hidden",
          )}
        >
          <div className="flex items-center gap-3 ml-5">
            <Skeleton className="w-[74px] aspect-square rounded-[12px]" />
            <Skeleton className="w-[100px] h-4 rounded-[6px]" />
          </div>
          <Skeleton className="ml-5 w-[150px] h-4 rounded-[6px]" />
          <div>
            <Skeleton className="ml-5 w-[50px] h-4 rounded-[6px]" />
            <Skeleton className="ml-5 w-[60px] h-3 rounded-[6px] mt-2" />
          </div>
          <div>
            <Skeleton className="ml-5 w-[50px] h-4 rounded-[6px]" />
            <Skeleton className="ml-5 w-[60px] h-3 rounded-[6px] mt-2" />
          </div>
          <Skeleton className="ml-5 w-[50px] h-4 rounded-[6px] mr-5" />
        </div>
      ))}
    </>
  )
}
