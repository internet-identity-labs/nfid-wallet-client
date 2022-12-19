import React from "react"

import { Button } from "@nfid-frontend/ui"

import { DropdownSelect } from "../../molecules/dropdown-select"
import { Input } from "../../molecules/input"

export interface VaultFilterTransactionsProps {
  onApply: () => void
  onReset: () => void
}

export const VaultFilterTransactions: React.FC<
  VaultFilterTransactionsProps
> = ({ onReset, onApply }) => {
  return (
    <div className="max-w-[384px] rounded-md bg-white p-2.5 shadow-sm">
      <p className="mb-2 text-sm font-bold">Filter</p>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Input type="date" labelText="From" />
          <div className="w-2.5 h-[1px] block bg-black shrink-0 mt-6" />
          <Input type="date" labelText="To" />
        </div>
        <DropdownSelect
          options={[]}
          selectedValues={[]}
          setSelectedValues={function (value: string[]): void {
            throw new Error("Function not implemented.")
          }}
          label="Initiated"
        />
        <DropdownSelect
          options={[]}
          selectedValues={[]}
          setSelectedValues={function (value: string[]): void {
            throw new Error("Function not implemented.")
          }}
          label="Status"
        />
      </div>
      <div className="grid grid-cols-2 gap-5 mt-5">
        <Button type="stroke" onClick={onReset}>
          Reset filters
        </Button>
        <Button type="primary" onClick={onApply}>
          Apply
        </Button>
      </div>
    </div>
  )
}
