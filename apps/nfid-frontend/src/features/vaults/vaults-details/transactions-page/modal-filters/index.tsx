import React, { Dispatch, SetStateAction } from "react"

import {
  FilterPopover,
  DropdownSelect,
  IconCmpFilters,
  Input,
  IOption,
} from "@nfid/ui"

export interface VaultFilterTransactionsProps {
  initiatorsOptions: IOption[]
  statusOptions: IOption[]
  initiatedFilter: string[]
  setInitiatedFilter: (value: string[]) => void
  statusFilter: string[]
  setStatusFilter: (value: string[]) => void
  timeFilter: { from: string; to: string }
  setTimeFilter: Dispatch<SetStateAction<{ from: string; to: string }>>
  onResetFilters: () => void
  onApplyFilters?: () => void
}

export const VaultFilterTransactions: React.FC<
  VaultFilterTransactionsProps
> = ({
  initiatorsOptions,
  statusOptions,
  initiatedFilter,
  setInitiatedFilter,
  statusFilter,
  setStatusFilter,
  timeFilter,
  setTimeFilter,
  onResetFilters,
  onApplyFilters,
}) => {
  return (
    <FilterPopover
      title="Filter"
      onReset={onResetFilters}
      onApply={onApplyFilters}
      trigger={
        <IconCmpFilters className="transition-opacity cursor-pointer hover:opacity-60" />
      }
      align="end"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Input
            type="date"
            labelText="From"
            onChange={(e) =>
              setTimeFilter({ ...timeFilter, from: e.target.value })
            }
            value={timeFilter.from}
          />
          <div className="w-1 h-[1px] block bg-black shrink-0 mt-6" />
          <Input
            type="date"
            labelText="To"
            onChange={(e) =>
              setTimeFilter({ ...timeFilter, to: e.target.value })
            }
            value={timeFilter.to}
          />
        </div>
        <DropdownSelect
          options={initiatorsOptions}
          selectedValues={initiatedFilter}
          setSelectedValues={setInitiatedFilter}
          label="Initiated"
        />
        <DropdownSelect
          options={statusOptions}
          selectedValues={statusFilter}
          setSelectedValues={setStatusFilter}
          label="Status"
        />
      </div>
    </FilterPopover>
  )
}
