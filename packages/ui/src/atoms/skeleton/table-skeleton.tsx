import clsx from "clsx"
import React from "react"

import { Skeleton } from "."

interface TableSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  tableCellAmount: number
  tableRowsAmount: number
}

export const TableSkeleton = ({
  tableCellAmount,
  tableRowsAmount,
}: TableSkeletonProps) => {
  return (
    <>
      {Array.from({ length: tableRowsAmount }).map((_, index) => (
        <tr key={index}>
          {Array.from({ length: tableCellAmount }).map((_, index) => (
            <td key={index} className="py-[5px]">
              <Skeleton
                className={clsx(
                  "max-w-full h-[24px] bg-gray-300",
                  index === 0 ? "w-[400px]" : "w-[84px]",
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
