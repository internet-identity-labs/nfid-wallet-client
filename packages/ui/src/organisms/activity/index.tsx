import { FC } from "react"

import {
  BlurredLoader,
  Button,
  DropdownSelect,
  FilterPopover,
  IconCmpFilters,
  Skeleton,
  Table,
} from "@nfid-frontend/ui"

import { IActivityRowGroup } from "frontend/features/activity/types"
import { FT } from "frontend/integration/ft/ft"

import { TableSkeleton } from "../../atoms/skeleton/table-skeleton"
import { ActivityEmpty } from "./components/activity-empty"
import { ActivityTableGroup } from "./components/activity-table-group"

export interface ActivityProps {
  activityData: {
    activities: IActivityRowGroup[]
    filter: string[]
    setFilter: React.Dispatch<React.SetStateAction<string[]>>
    isValidating: boolean
    hasMoreData: boolean
    loadMore: () => Promise<void>
    isButtonLoading: boolean
    resetHandler: () => void
  }
  tokens: FT[]
  isTokensLoading: boolean
}

export const Activity: FC<ActivityProps> = ({
  activityData,
  tokens,
  isTokensLoading,
}) => {
  const {
    activities,
    filter,
    setFilter,
    isValidating,
    hasMoreData,
    loadMore,
    isButtonLoading,
    resetHandler,
  } = activityData
  return (
    <>
      <div>
        {isTokensLoading ? (
          <div className="flex justify-end pr-[30px]">
            <Skeleton className="max-w-full h-[41px] bg-gray-300 w-[41px]" />
          </div>
        ) : (
          <div className="flex justify-end ">
            <FilterPopover
              title="Assets"
              align="end"
              className="!min-w-[384px]"
              trigger={
                <div
                  id={"filter-ft"}
                  className="flex items-center justify-end p-[10px] rounded-md md:bg-white px-5 sm:px-[30px]"
                >
                  <IconCmpFilters className="w-[21px] h-[21px] transition-opacity cursor-pointer hover:opacity-60" />
                </div>
              }
              onReset={resetHandler}
            >
              <DropdownSelect
                selectedValues={filter}
                setSelectedValues={setFilter}
                isMultiselect={true}
                options={tokens.map((token: FT) => ({
                  label: token.getTokenName(),
                  value: token.getTokenAddress(),
                  icon: token.getTokenLogo(),
                  symbol: token.getTokenSymbol(),
                }))}
              />
            </FilterPopover>
          </div>
        )}

        {!Boolean(activities.length) && !isValidating ? (
          <ActivityEmpty />
        ) : (
          <>
            <div className="overflow-auto">
              <Table className="!min-w-[720px] " id="activity-table">
                {isValidating ? (
                  <TableSkeleton
                    tableRowsAmount={5}
                    tableCellAmount={4}
                    hasPaddingLeft={true}
                  />
                ) : (
                  activities.map((group, index) => (
                    <ActivityTableGroup
                      groupIndex={index}
                      date={group.date}
                      rows={group.rows}
                      key={`group_${group.date}`}
                    />
                  ))
                )}
              </Table>
            </div>
          </>
        )}
        <div className="my-[20px]">
          {hasMoreData && (
            <Button
              disabled={isButtonLoading || isValidating}
              className="block mx-auto"
              onClick={loadMore}
              type="ghost"
            >
              Load more
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
