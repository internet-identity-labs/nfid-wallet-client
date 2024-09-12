import clsx from "clsx"
import { HTMLAttributes } from "react"

import { Skeleton } from "."

interface TableSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  tableCellAmount: number
  tableRowsAmount: number
  hasPaddingLeft?: boolean
  isFirstImage?: boolean
}

export const TableSkeleton = ({
  tableCellAmount,
  tableRowsAmount,
  hasPaddingLeft = false,
  isFirstImage = false,
}: TableSkeletonProps) => {
  return (
    <>
      {Array.from({ length: tableRowsAmount }).map((_, index) => (
        <tr key={index}>
          {Array.from({ length: tableCellAmount }).map((_, index) => (
            <td
              key={index}
              className={clsx(
                "py-[5px] pr-[30px]",
                index === 0 && hasPaddingLeft && "pl-5 sm:pl-[30px]",
              )}
            >
              {isFirstImage && index === 0 ? (
                <Skeleton className="rounded-[12px] h-[74px] w-[74px]" />
              ) : (
                <Skeleton
                  className={clsx(
                    "max-w-full h-[24px] bg-gray-300",
                    index === 0 ? "w-[400px]" : "w-[84px]",
                  )}
                />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
