import clsx from "clsx"

import { getIsMobileDeviceMatch } from "../../utils/is-mobile"
import { Skeleton } from "./skeleton"

interface TableTokenSkeletonProps {
  tableCellAmount: number
  tableRowsAmount: number
  className?: string
}

export const TableTokenSkeleton = ({
  tableCellAmount,
  tableRowsAmount,
  className,
}: TableTokenSkeletonProps) => {
  return (
    <tbody>
      {Array.from({ length: tableRowsAmount }).map((_, index) => (
        <tr key={index}>
          {Array.from({ length: tableCellAmount }).map((_, index) => (
            <td key={index} className={clsx("py-[5px]")}>
              {index === tableCellAmount - 1 ? (
                <div>
                  <Skeleton
                    className={clsx(
                      "rounded-[12px] h-[10px] w-[50px]",
                      className,
                    )}
                  />
                </div>
              ) : index === 0 ? (
                <div className={clsx("flex gap-[15px] items-center h-16")}>
                  <Skeleton
                    className={clsx(
                      "rounded-full h-[40px] w-[40px] min-w-[40px]",
                      className,
                    )}
                  />
                  <div className="w-full">
                    <Skeleton
                      className={clsx(
                        "rounded-[12px] h-[10px] min-w-[50px] w-[20%] mb-[10px]",
                        className,
                      )}
                    />
                    <Skeleton
                      className={clsx(
                        "rounded-[12px] h-[10px] min-w-[100px] w-[50%]",
                        className,
                      )}
                    />
                  </div>
                </div>
              ) : (
                <Skeleton
                  className={clsx(
                    "max-w-full h-[10px]",
                    index === 1 ? "w-[200px]" : "w-[100px]",
                    getIsMobileDeviceMatch() && "ml-auto",
                    className,
                  )}
                />
              )}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}
