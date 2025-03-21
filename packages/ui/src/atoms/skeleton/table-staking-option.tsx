import clsx from "clsx"

import { Table } from "../../molecules/table"
import { getIsMobileDeviceMatch } from "../../utils/is-mobile"
import ProfileContainer from "../profile-container/Container"
import { Skeleton } from "./skeleton"

interface TableActivitySkeletonProps {
  tableCellAmount: number
  tableRowsAmount: number
  className?: string
}

export const TableStakingOptionSkeleton = ({
  tableCellAmount,
  tableRowsAmount,
  className,
}: TableActivitySkeletonProps) => {
  return (
    <ProfileContainer
      className="!py-[20px] md:!py-[30px] !mb-[20px] md:!mb-[30px]"
      titleClassName="!px-0 md:!px-[30px] mb-[10px] md:!mb-[30px]"
    >
      <Table className="!min-w-0 table-fixed w-full">
        {Array.from({ length: tableRowsAmount }).map((_, index) => (
          <tr key={index}>
            {Array.from({ length: tableCellAmount }).map((_, index) => (
              <td
                key={index}
                className={clsx(
                  "py-[5px] w-[25%]",
                  getIsMobileDeviceMatch() && index > 1 && "hidden",
                )}
              >
                {index === 0 ? (
                  <div className={clsx("flex gap-[15px] items-center h-16 ")}>
                    <Skeleton
                      className={clsx(
                        "rounded-full h-[40px] w-[40px] min-w-[40px]",
                        className,
                      )}
                    />
                    <div className="w-full">
                      <Skeleton
                        className={clsx(
                          "rounded-[12px] h-[14px] min-w-[100px] sm:min-w-[250px] w-[20%]",
                          className,
                        )}
                      />
                    </div>
                  </div>
                ) : (
                  <Skeleton
                    className={clsx(
                      "max-w-full h-[14px]",
                      "w-[50%]",
                      getIsMobileDeviceMatch() && "ml-auto",
                      className,
                    )}
                  />
                )}
              </td>
            ))}
          </tr>
        ))}
      </Table>
    </ProfileContainer>
  )
}
