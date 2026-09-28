import { Skeleton } from "./skeleton"

export const VaultSkeleton = () => {
  return (
    <>
      <div className="h-[184px] rounded-[24px] bg-portfolioColor dark:bg-zinc-800 p-5 sm:p-[30px]">
        <Skeleton className="h-[15px] w-[180px] max-w-[80%] !rounded-[4px] mt-1 mb-[50px]" />
        <Skeleton className="h-[10px] w-[80px] max-w-[50%] !rounded-[4px] mb-[27px]" />
        <Skeleton className="h-[15px] w-[180px] max-w-[80%] !rounded-[4px]" />
      </div>
      <div className="h-[184px] rounded-[24px] border-1 border-gray-200 dark:border-zinc-700 p-5 sm:p-[30px] my-5 sm:my-[30px] flex items-end gap-[30px] sm:gap-[120px]">
        <div className="w-[180px] max-w-[80%]">
          <Skeleton className="h-[15px] w-full !rounded-[4px] mt-1 mb-[50px]" />
          <Skeleton className="h-[10px] w-[80px] !rounded-[4px] mb-[27px]" />
          <Skeleton className="h-[15px] w-full !rounded-[4px]" />
        </div>
        <div className="w-[180px] max-w-[80%]">
          <Skeleton className="h-[10px] w-[80px] !rounded-[4px] mb-[27px]" />
          <Skeleton className="h-[15px] w-full !rounded-[4px]" />
        </div>
      </div>
      <div className="h-[141px] rounded-[24px] border-1 border-gray-200 dark:border-zinc-700 p-5 sm:p-[30px]">
        <Skeleton className="h-[15px] w-[180px] max-w-[80%] !rounded-[4px] mt-1 mb-[40px]" />
        <Skeleton className="h-[10px] w-[80px] max-w-[50%] !rounded-[4px]" />
      </div>
      <div className="h-[208px] rounded-[24px] border-1 border-gray-200 dark:border-zinc-700 my-5 sm:my-[30px] p-5 sm:p-[30px]">
        <Skeleton className="h-[15px] w-[180px] max-w-[80%] !rounded-[4px] mt-1 mb-[40px]" />
        <Skeleton className="h-[10px] w-[80px] max-w-[50%] !rounded-[4px] mb-[35px]" />

        <Skeleton className="h-[10px] w-[180px] max-w-[80%] !rounded-[4px] mb-[11px]" />
        <Skeleton className="h-[10px] w-[80px] max-w-[50%] !rounded-[4px]" />
      </div>
    </>
  )
}
