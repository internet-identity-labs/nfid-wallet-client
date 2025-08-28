import { SignIdentity } from "@dfinity/agent"
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
import { useBtcAddress, useEthAddress } from "frontend/hooks"
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
    isFirstLoading: boolean
  }
  tokens: FT[]
  identity?: SignIdentity
}

export const Activity: FC<ActivityProps> = ({
  activityData,
  tokens,
  identity,
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
    isFirstLoading,
  } = activityData
  const { isBtcAddressLoading } = useBtcAddress()
  const { isEthAddressLoading } = useEthAddress()

  const showSkeleton =
    isFirstLoading ||
    (isValidating && !activities.length) ||
    isBtcAddressLoading ||
    isEthAddressLoading
  const showEmpty = !showSkeleton && activities.length === 0

  return (
    <>
      <div className={clsx("flex justify-end", showSkeleton && "hidden")}>
        <FilterPopover
          title="Assets"
          align="end"
          className="!min-w-[384px]"
          trigger={
            <div
              id={"filter-ft"}
              className="flex items-center justify-end p-[10px] rounded-md md:bg-white dark:md:bg-[#141518] px-5 sm:px-[30px]"
            >
              <div className="relative">
                <IconCmpFilters className="w-[21px] h-[21px] transition-opacity cursor-pointer hover:opacity-60 dark:text-white" />
                <div
                  className={clsx(
                    "absolute w-2.5 h-2.5 bg-teal-600 dark:bg-teal-500 right-0 bottom-0 rounded-full border-2 border-white dark:border-[#141518]",
                    filter.length > 0 ? "block" : "hidden",
                  )}
                ></div>
              </div>
            </div>
          }
          onReset={resetHandler}
        >
          <DropdownSelect
            id={"number_of_filters"}
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
      {showEmpty ? (
        <ActivityEmpty />
      ) : (
        <>
          <div
            className={clsx(
              "overflow-auto",
              showSkeleton && "pl-5 sm:pl-[30px]",
            )}
          >
            <Table className="!min-w-0 !sm:min-w-[720px] " id="activity-table">
              {showSkeleton ? (
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
                    identity={identity}
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
