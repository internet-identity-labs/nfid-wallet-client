import { Skeleton } from "@nfid-frontend/ui"

import SkeletonNft from "./skeleton-img.svg"

export const RPCPreloader = () => {
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
      <div className="border border-gray-100 -md mt-1.5 flex items-center">
        <img src={SkeletonNft} alt="" />
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
      <Skeleton className="h-3 w-[140px]  mt-[18px]" />
      <div className="flex justify-between items-center border border-gray-100 rounded-md mt-[5px] px-2.5 py-2">
        <div className="flex items-center">
          <Skeleton className="w-10 h-10 -full" />
          <div className="ml-2.5">
            <div className="flex ">
              <Skeleton className="w-24 h-3 mr-[5px] " />
              <Skeleton className="h-3 w-11" />
            </div>
            <Skeleton className="h-3 mt-2 w-11" />
          </div>
        </div>
        <div className="flex">
          <Skeleton className="h-3 w-11 mr-[5px]" />
          <Skeleton className="w-5 h-3" />
        </div>
      </div>
      <div className="mt-7">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-36" />
          <div className="flex">
            <Skeleton className="w-16 h-3 mr-[5px]"></Skeleton>
            <Skeleton className="w-5 h-3 "></Skeleton>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <Skeleton className="w-24 h-3 " />
          <div className="flex">
            <Skeleton className="w-11 h-3 mr-[5px]"></Skeleton>
            <Skeleton className="w-5 h-3 "></Skeleton>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <Skeleton className="h-3  w-[120px]" />
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
