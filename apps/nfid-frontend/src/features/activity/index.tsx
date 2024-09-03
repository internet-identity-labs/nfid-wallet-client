import { useLocation } from "react-router-dom"

import {
  Button,
  DropdownSelect,
  FilterPopover,
  IconCmpFilters,
  Loader,
  Table,
} from "@nfid-frontend/ui"

import ActivityEmpty from "./components/activity-empty"
import { ActivityTableGroup } from "./components/activity-table-group"
import { useActivityPagination } from "./hooks"

export interface IActivityPage {}

const ActivityPage = () => {
  const { state } = useLocation()
  const initialFilter = state && state.canisterId ? [state.canisterId] : []
  const tokens = [] as any
  const {
    activities,
    filter,
    setFilter,
    isValidating,
    hasMoreData,
    loadMore,
    isButtonLoading,
    resetHandler,
  } = useActivityPagination(initialFilter)
  return (
    <>
      <div>
        <Loader isLoading={isValidating && !activities.length} />
        <FilterPopover
          title="Assets"
          align="end"
          className="!min-w-[384px]"
          trigger={
            <div
              id={"filter-ft"}
              className="flex items-center justify-center p-[10px] rounded-md md:bg-white"
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
            options={tokens.map((token: any) => ({
              label: token.title,
              value: token.canisterId!,
            }))}
          />
        </FilterPopover>
        {!Boolean(activities?.length) && !isValidating ? (
          <ActivityEmpty />
        ) : (
          <>
            <div>
              <Table
                className="!min-w-0"
                theadClassName="!h-0 sm:!h-16"
                id="activity-table"
                tableHeader={
                  <tr className="hidden border-b border-black sm:table-row">
                    <th>Action</th>
                    <th>Asset</th>
                    <th>From</th>
                    <th>To</th>
                  </tr>
                }
              >
                {activities?.map((group, index) => (
                  <ActivityTableGroup
                    groupIndex={index}
                    date={group.date}
                    rows={group.rows}
                    key={`group_${group.date}`}
                  />
                ))}
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
              {isButtonLoading || isValidating ? "Loading..." : "Load more"}
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

export default ActivityPage
