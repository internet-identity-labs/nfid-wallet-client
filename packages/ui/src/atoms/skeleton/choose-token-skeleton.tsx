import { Skeleton } from "./skeleton"

interface ChooseTokenSkeletonProps {
  rows: number
}

export const ChooseTokenSkeleton = ({ rows }: ChooseTokenSkeletonProps) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <div className="flex items-center mb-5" key={index}>
          <Skeleton className="mr-[18px] w-[28px] h-[28px] rounded-full" />
          <div>
            <Skeleton className="mr-[18px] mb-1.5 w-[60px] h-[16px] rounded-[6px]" />
            <Skeleton className="mr-[18px] w-[100px] h-[12px] rounded-[6px]" />
          </div>
          <div className="ml-auto">
            <Skeleton className="ml-auto mr-[18px] mb-1.5 w-[60px] h-[16px] rounded-[6px]" />
            <Skeleton className="mr-[18px] w-[100px] h-[12px] rounded-[6px]" />
          </div>
        </div>
      ))}
    </>
  )
}
