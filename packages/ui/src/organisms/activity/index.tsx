import clsx from "clsx"
import { FC } from "react"

import {
  Button,
  DropdownSelect,
  FilterPopover,
  IconCmpFilters,
  Table,
} from "@nfid-frontend/ui"

import { IActivityRowGroup } from "frontend/features/activity/types"
import { FT } from "frontend/integration/ft/ft"

import { TableActivitySkeleton } from "../../atoms/skeleton"
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
}

export const Activity: FC<ActivityProps> = ({ activityData, tokens }) => {
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
      <div className={clsx("flex justify-end", isValidating && "hidden")}>
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
      {!Boolean(activities.length) && !isValidating ? (
        <ActivityEmpty />
      ) : (
        <>
          <div
            className={clsx(
              "overflow-auto",
              isValidating && !activities.length && "pl-5 sm:pl-[30px]",
            )}
          >
            <Table className="!min-w-[720px] " id="activity-table">
              {isValidating && !activities.length ? (
                <>
                  <TableActivitySkeleton
                    tableRowsAmount={10}
                    tableCellAmount={3}
                  />
                </>
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
            className={clsx(
              "block mx-auto",
              isValidating && !activities.length && "hidden",
            )}
            onClick={loadMore}
            type="ghost"
          >
            {isValidating ? "Loading..." : "Load more"}
          </Button>
        )}
      </div>
    </>
  )
}
