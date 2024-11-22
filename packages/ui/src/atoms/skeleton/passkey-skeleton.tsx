import { Skeleton } from "./skeleton"

interface PasskeySkeletonProps {
  rows: number
}

export const PasskeySkeleton = ({ rows }: PasskeySkeletonProps) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr
          className="items-center text-sm border-b border-gray-200"
          key={index}
        >
          <td className="flex h-[61px] items-center">
            <div className="flex items-center w-[24px] h-[24px] shrink-0 ml-2 mr-[26px]">
              <Skeleton className="w-full h-full rounded-[6px]" />
            </div>
            <div>
              <Skeleton className="mb-1.5 w-[60px] h-[16px] rounded-[6px]" />
              <Skeleton className="w-[100px] h-[12px] rounded-[6px]" />
            </div>
          </td>
          <td className="hidden sm:table-cell">
            <Skeleton className="w-[60px] h-[16px] rounded-[6px]" />
          </td>
          <td className="hidden sm:table-cell">
            <Skeleton className="w-[60px] h-[16px] rounded-[6px]" />
          </td>
          <td className="w-6">
            <Skeleton className="w-[30px] h-[16px] rounded-[6px]" />
          </td>
        </tr>
      ))}
    </>
  )
}
