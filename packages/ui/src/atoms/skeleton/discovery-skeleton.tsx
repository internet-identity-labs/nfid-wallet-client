import { Skeleton } from "./skeleton"

export const DiscoverySkeleton = ({ amount }: { amount: number }) => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: amount }).map((_, index) => (
        <div
          key={`skeleton${index}`}
          className="rounded-[12px] overflow-hidden bg-gray-50 dark:bg-zinc-800"
        >
          <Skeleton className="w-full h-[175px] rounded-none" />
          <div className="px-2.5 pt-3 pb-[15px]">
            <div className="flex justify-between items-center mb-1 gap-2.5">
              <Skeleton className="w-[40%] h-[24px] rounded-[6px] mb-0.5" />
              <Skeleton className="w-[60px] h-[20px] rounded-[6px]" />
            </div>
            <Skeleton className="w-[70%] h-[20px] rounded-[6px] mb-0.5" />
          </div>
        </div>
      ))}
    </div>
  )
}
