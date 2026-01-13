import { IconCmpNFTPreview, Skeleton } from "@nfid/ui"

export const Loader = () => {
  return (
    <div>
      <div className="flex items-center">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="h-5 ml-2 w-28" />
      </div>
      <div className="flex items-center mt-7">
        <Skeleton className="w-32 h-3 mr-1 " />
        <Skeleton className="w-5 h-3 " />
      </div>
      <div className="border border-gray-100 -md mt-1.5 flex items-center rounded-md">
        <IconCmpNFTPreview className="w-[102px] h-[102px] text-gray-100" />

        <div className="ml-2.5">
          <div className="flex items-center">
            <Skeleton className="w-20 h-3 mr-1.5 " />
            <Skeleton className="w-[120px] h-3 mr-1.5 " />
          </div>
          <div className="flex items-center mt-2">
            <Skeleton className="w-7 h-3 mr-1.5 " />
            <Skeleton className="w-20 h-3 mr-1.5 " />
          </div>
        </div>
      </div>
      <div className="space-y-4 mt-7">
        <div className="flex items-center justify-between">
          <Skeleton className="w-32 h-3" />
          <div className="flex">
            <Skeleton className="w-14 h-3 mr-[5px]"></Skeleton>
            <Skeleton className="w-5 h-3 "></Skeleton>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-28" />
          <div className="flex">
            <Skeleton className="w-12 h-3 mr-[5px]"></Skeleton>
            <Skeleton className="w-5 h-3 "></Skeleton>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-36" />
          <div className="flex">
            <Skeleton className="w-16 h-3 mr-[5px]"></Skeleton>
            <Skeleton className="w-5 h-3 "></Skeleton>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="w-24 h-3 " />
          <div className="flex">
            <Skeleton className="w-11 h-3 mr-[5px]"></Skeleton>
            <Skeleton className="w-5 h-3 "></Skeleton>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-[120px]" />
          <div className="flex">
            <Skeleton className="w-[60px] h-3 mr-[5px]"></Skeleton>
            <Skeleton className="w-5 h-3"></Skeleton>
          </div>
        </div>
      </div>
      <Skeleton className="h-3 mt-6 w-44" />
      <Skeleton className="flex items-center justify-center w-full h-12 rounded-md mt-14">
        <Skeleton className="h-3 w-[120px] !bg-white" />
      </Skeleton>
    </div>
  )
}
