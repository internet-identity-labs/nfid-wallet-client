import clsx from "clsx"
import { TransactionRow } from "packages/integration/src/lib/asset/types"
import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import React, { useState } from "react"

import {
  FilterPopover,
  DropdownSelect,
  IconCmpFilters,
  IOption,
  TabsSwitcher,
} from "@nfid-frontend/ui"

import { Chip } from "frontend/ui/atoms/chip"
import Pagination from "frontend/ui/molecules/pagination"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

interface IProfileTransactionsPage
  extends React.HTMLAttributes<HTMLDivElement> {
  sentData: TransactionRow[]
  receivedData: TransactionRow[]
  transactionsFilterOptions: IOption[]
  onChipRemove: (value: string) => void
  setTransactionFilter: (value: string[]) => void
  selectedTransactionFilter: IOption[]
  blockchainOptions: string[]
  resetBlockchainFilter: () => void
  blockchainFilter: string[]
  setBlockchainFilter: (value: string[]) => void
}

const tabs = [
  {
    name: "Sent",
    title: <>Sent</>,
  },
  {
    name: "Received",
    title: <>Received</>,
  },
]

const ProfileTransactionsPage: React.FC<IProfileTransactionsPage> = ({
  sentData,
  receivedData,
  transactionsFilterOptions,
  setTransactionFilter,
  selectedTransactionFilter,
  onChipRemove,
  resetBlockchainFilter,
  blockchainFilter,
  blockchainOptions,
  setBlockchainFilter,
}) => {
  const [activeTab, setActiveTab] = useState("Sent")
  const [filteredData, setFilteredData] = useState<TransactionRow[]>([])

  return (
    <ProfileTemplate
      pageTitle="Transactions history"
      className="w-full z-[1]"
      showBackButton
    >
      <ProfileContainer className={clsx(`bg-gray-200`)}>
        <div className="flex items-center justify-between w-full space-x-10 ">
          <DropdownSelect
            bordered={false}
            options={transactionsFilterOptions}
            placeholder="All wallets"
            setSelectedValues={setTransactionFilter}
            selectedValues={selectedTransactionFilter.map((f) => f.value)}
            isSearch
          />
          <FilterPopover
            title="Filter"
            onReset={() => resetBlockchainFilter()}
            trigger={<IconCmpFilters className="cursor-pointer" />}
            align="end"
          >
            <DropdownSelect
              label="Blockchain"
              options={blockchainOptions.map((f) => ({
                label: f,
                value: f,
              }))}
              selectedValues={blockchainFilter}
              setSelectedValues={setBlockchainFilter}
            />
          </FilterPopover>
        </div>
      </ProfileContainer>
      {/* TODO: create Chiplist component */}
      <div className="mt-6 flex w-full flex-wrap gap-2.5">
        {selectedTransactionFilter.map((chip) => (
          <Chip key={chip.label} title={chip.label} onRemove={onChipRemove} />
        ))}
      </div>
      <TabsSwitcher
        className="mt-6"
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="w-full overflow-y-scroll">
        {filteredData.length ? (
          <>
            <table className={clsx("text-left w-full mb-16 sm:mb-0")}>
              <thead className={clsx("border-b border-black h-16")}>
                <tr className={clsx("font-bold text-sm leading-5")}>
                  <th className="pl-4 w-[285px]">Date</th>
                  <th className="w-[95px]">Asset</th>
                  <th className="w-[160px]">Quantity</th>
                  <th className="min-w-[235px] pr-5">From</th>
                  <th className="min-w-[235px]">To</th>
                </tr>
              </thead>
              <tbody className={clsx("text-sm text-[#0B0E13] border-b")}>
                {filteredData.map((transaction, index) => (
                  <tr
                    className={clsx(
                      "hover:bg-[#F3F4F6] hover:cursor-pointer h-16",
                    )}
                    key={`transaction_${index}_${transaction.date}}`}
                    id={`transaction_${index}`}
                  >
                    <td
                      className="pl-4 whitespace-nowrap"
                      id={`transaction_date_${index}`}
                    >
                      {transaction.date}
                    </td>
                    <td id={`transaction_asset_${index}`}>
                      {transaction.asset}
                    </td>
                    <td id={`transaction_quantity_${index}`}>
                      {transaction.quantity}
                    </td>
                    <td>
                      <span
                        className={clsx(
                          "inline-block max-w-[400px] break-words pr-5",
                        )}
                        id={`transaction_from_${index}`}
                      >
                        {transaction.from}
                      </span>
                    </td>
                    <td>
                      <span
                        className={clsx(
                          "inline-block max-w-[400px] break-words",
                        )}
                        id={`transaction_to_${index}`}
                      >
                        {transaction.to}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div
            className={clsx(
              "w-full h-[50vh]",
              "flex justify-center items-center flex-col",
            )}
          >
            <p className="mb-4 text-sm text-center">
              No recent transactions to display.
            </p>
          </div>
        )}
      </div>
      <div className={clsx("my-2")}>
        <Pagination
          data={activeTab === "Sent" ? sentData : receivedData}
          id={`active_tab_` + activeTab}
          sliceData={setFilteredData}
        />
      </div>
    </ProfileTemplate>
  )
}

export default ProfileTransactionsPage
