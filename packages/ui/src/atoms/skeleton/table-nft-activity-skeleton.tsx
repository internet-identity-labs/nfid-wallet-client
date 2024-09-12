import clsx from "clsx"

import { Skeleton } from "./skeleton"

interface TableSkeletonProps {
  tableCellAmount: number
  tableRowsAmount: number
  className?: string
}

export const TableNftActivitySkeleton = ({
  tableCellAmount,
  tableRowsAmount,
  className,
}: TableSkeletonProps) => {
  return (
    <>
      {Array.from({ length: tableRowsAmount }).map((_, index) => (
        <tr key={index}>
          {Array.from({ length: tableCellAmount }).map((_, index) => (
            <td key={index} className={clsx("py-[5px] pr-[30px]")}>
              <Skeleton
                className={clsx(
                  "max-w-full h-[10px]",
                  index === 0 ? "w-[400px]" : "w-[84px]",
                  className,
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
