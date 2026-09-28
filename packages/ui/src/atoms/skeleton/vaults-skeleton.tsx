import { Skeleton } from "./skeleton"

export const VaultsSkeleton = () => {
  return (
    <>
      <div className="h-[100px] sm:h-[126px] rounded-[24px] bg-portfolioColor dark:bg-zinc-800 px-5 sm:px-[30px] pt-[24px] sm:pt-[38px] pb-[30px]">
        <Skeleton className="h-[15px] w-[63%] !rounded-[4px]" />
        <Skeleton className="h-[10px] w-[23%] !rounded-[4px] mt-6" />
      </div>
      <div className="h-[100px] sm:h-[126px] rounded-[24px] bg-portfolioColor dark:bg-zinc-800 px-5 sm:px-[30px] pt-[24px] sm:pt-[38px] pb-[30px]">
        <Skeleton className="h-[15px] w-[63%] !rounded-[4px]" />
        <Skeleton className="h-[10px] w-[23%] !rounded-[4px] mt-6" />
      </div>
      <div className="h-[100px] sm:h-[126px] rounded-[24px] bg-portfolioColor dark:bg-zinc-800 px-5 sm:px-[30px] pt-[24px] sm:pt-[38px] pb-[30px]">
        <Skeleton className="h-[15px] w-[63%] !rounded-[4px]" />
        <Skeleton className="h-[10px] w-[23%] !rounded-[4px] mt-6" />
      </div>
      <div className="col-start-1 h-[100px] sm:h-[126px] rounded-[24px] border-1 border-gray-200 dark:border-zinc-800 px-5 sm:px-[30px] pt-[40px] sm:pt-[54px] pb-5 sm:pb-[30px]">
        <Skeleton className="h-[15px] w-[63%] !rounded-[4px]" />
      </div>
    </>
  )
}
