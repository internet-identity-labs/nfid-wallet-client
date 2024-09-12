import clsx from "clsx"

import { Skeleton } from "./skeleton"

interface TableImageSkeletonProps {
  tableCellAmount: number
  tableRowsAmount: number
  className?: string
}

export const TableNftSkeleton = ({
  tableCellAmount,
  tableRowsAmount,
  className,
}: TableImageSkeletonProps) => {
  return (
    <>
      {Array.from({ length: tableRowsAmount }).map((_, index) => (
        <tr key={index}>
          {Array.from({ length: tableCellAmount }).map((_, index) => (
            <td key={index} className={clsx("py-[5px] pr-[30px]")}>
              {index === 0 ? (
                <Skeleton
                  className={clsx(
                    "rounded-[12px] h-[74px] w-[74px]",
                    className,
                  )}
                />
              ) : (
                <Skeleton
                  className={clsx(
                    "max-w-full h-[20px]",
                    index === 1 ? "w-[200px]" : "w-[100px]",
                    className,
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
