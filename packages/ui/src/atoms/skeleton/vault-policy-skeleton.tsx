import { VaultPolicyInfo } from "../../organisms/vaults/components/policy-info"
import { Skeleton } from "./skeleton"

export const VaultPolicySkeleton = () => {
  return (
    <>
      <div className="font-inter grid md:grid-cols-[73fr_35fr] gap-[30px]">
        <div>
          <div className="bg-portfolioColor dark:bg-zinc-800 p-5 sm:p-[30px] dark:text-white rounded-[24px]">
            <div className="flex items-center justify-between mb-5">
              <span className="font-semibold leading-5">
                Approval threshold
              </span>
            </div>
            <div className="h-[54px] mb-1 pt-4">
              <Skeleton className="h-[15px] w-[80%] max-w-[80%] !rounded-[4px]" />
            </div>
            <div className="h-[64px] pt-6">
              <Skeleton className="h-[15px] w-[100%] !rounded-[4px]" />
            </div>
          </div>
          <div className="mt-5 sm:mt-10 ml-auto flex flex-col gap-2.5 dark:text-white relative w-[87%] sm:w-[84%]">
            <div className="absolute w-[1px] bg-gray-200 left-[-20px] sm:left-[-55px] -top-5 sm:-top-10 bottom-[42px]"></div>
            <div className="relative flex items-center px-2.5 py-[11px] transition duration-200 h-[64px]">
              <div className="absolute right-[100%] top-0 h-1/2 w-[20px] sm:w-[55px] border-l border-b border-gray-200 rounded-bl-[8px]"></div>
              <Skeleton className="absolute top-0 left-0 w-full h-full rounded-[24px]" />
            </div>
            <div className="relative flex items-center px-2.5 py-[11px] transition duration-200 h-[64px]">
              <div className="absolute right-[100%] top-0 h-1/2 w-[20px] sm:w-[55px] border-l border-b border-gray-200 rounded-bl-[8px]"></div>
              <Skeleton className="absolute top-0 left-0 w-full h-full rounded-[24px]" />
            </div>
            <div className="relative flex items-center px-2.5 py-[11px] transition duration-200 h-[64px]">
              <div className="absolute right-[100%] top-0 h-1/2 w-[20px] sm:w-[55px] border-l border-b border-gray-200 rounded-bl-[8px]"></div>
              <Skeleton className="absolute top-0 left-0 w-full h-full rounded-[24px]" />
            </div>
          </div>
        </div>
        <VaultPolicyInfo />
      </div>
    </>
  )
}
