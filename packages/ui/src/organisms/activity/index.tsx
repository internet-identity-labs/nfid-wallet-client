import { SignIdentity } from "@dfinity/agent"
import clsx from "clsx"
import { FC, useMemo } from "react"

import {
  Button,
  DropdownSelect,
  FilterPopover,
  IconCmpFilters,
  Table,
} from "@nfid-frontend/ui"
import { CKBTC_CANISTER_ID } from "@nfid/integration/token/constants"

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
  const ckBTC = useMemo(
    () => tokens.find((token) => token.getTokenAddress() === CKBTC_CANISTER_ID),
    [tokens],
  )

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
              className="flex items-center justify-end p-[10px] rounded-md md:bg-white dark:md:bg-[#141518] px-5 sm:px-[30px]"
            >
              <IconCmpFilters className="w-[21px] h-[21px] transition-opacity cursor-pointer hover:opacity-60 dark:text-white" />
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
      {!isFirstLoading && activities.length === 0 && !isValidating ? (
        <ActivityEmpty />
      ) : (
        <>
          <div
            className={clsx(
              "overflow-auto",
              isValidating && !activities.length && "pl-5 sm:pl-[30px]",
            )}
          >
            <Table className="!min-w-0 !sm:min-w-[720px] " id="activity-table">
              {(isValidating && !activities.length) || isFirstLoading ? (
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
                    token={ckBTC}
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
