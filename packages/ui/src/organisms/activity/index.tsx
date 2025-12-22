import { SignIdentity } from "@dfinity/agent"
import clsx from "clsx"
import { FC, useState } from "react"

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
import { EVM_NATIVE, ETH_NATIVE_ID } from "@nfid/integration/token/constants"

import { TableActivitySkeleton } from "../../atoms/skeleton"
import { ActivityEmpty } from "./components/activity-empty"
import { ActivityTableGroup } from "./components/activity-table-group"
import { chainOptions } from "../tokens/components/chain-filter"
import { AllNetworksIcon } from "packages/ui/src/atoms/icons/AllNetworksIcon"
import { IActivityAction } from "@nfid/integration/token/icrc1/types"

type IFilter = {
  tx: string[]
  chain: string[]
  token: string[]
}

export const txOptions = [
  { label: "Receive", value: `${IActivityAction.RECEIVED}` },
  { label: "Send", value: `${IActivityAction.SENT}` },
  { label: "Swap", value: `${IActivityAction.SWAP}` },
  { label: "Approve", value: `${IActivityAction.APPROVE}` },
  { label: "Mint", value: `${IActivityAction.MINT}` },
  { label: "Burn", value: `${IActivityAction.BURN}` },
]

export interface ActivityProps {
  activityData: {
    activities: IActivityRowGroup[]
    isValidating: boolean
    hasMoreData: boolean
    loadMore: () => Promise<void>
    isButtonLoading: boolean
    isFirstLoading: boolean
  }
  tokens: FT[]
  identity?: SignIdentity
  tokenFilter: string[]
  setTokenFilter: React.Dispatch<React.SetStateAction<string[]>>
  chainFilter: string[]
  setChainFilter: React.Dispatch<React.SetStateAction<string[]>>
  txFilter: string[]
  setTxFilter: React.Dispatch<React.SetStateAction<string[]>>
}

export const Activity: FC<ActivityProps> = ({
  activityData,
  tokens,
  tokenFilter,
  setTokenFilter,
  chainFilter,
  setChainFilter,
  txFilter,
  setTxFilter,
}) => {
  const {
    activities,
    isValidating,
    hasMoreData,
    loadMore,
    isButtonLoading,
    isFirstLoading,
  } = activityData
  const { isBtcAddressLoading } = useBtcAddress()
  const { isEthAddressLoading } = useEthAddress()
  const [filter, setFilter] = useState<IFilter>({
    tx: [],
    chain: [],
    token: [],
  })

  console.log("ffill", isFirstLoading, isValidating)

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
                    tokenFilter.length > 0 ||
                      chainFilter.length > 0 ||
                      txFilter.length > 0
                      ? "block"
                      : "hidden",
                  )}
                ></div>
              </div>
            </div>
          }
          onReset={() => {
            setTokenFilter([])
            setChainFilter([])
            setTxFilter([])
            setFilter({ tx: [], chain: [], token: [] })
          }}
          onApply={() => {
            setTokenFilter(filter.token)
            setChainFilter(filter.chain)
            setTxFilter(filter.tx)
          }}
        >
          <div className="mb-2.5">
            <p className="mb-1 text-xs">Network</p>
            <DropdownSelect
              options={chainOptions}
              selectedValues={filter.chain}
              setSelectedValues={(chain) =>
                setFilter((prev) => ({ ...prev, chain }))
              }
              placeholder="All networks"
              placeholderIcon={AllNetworksIcon}
            />
          </div>
          <div className="mb-2.5">
            <p className="mb-1 text-xs">Assets</p>
            <DropdownSelect
              id={"number_of_filters"}
              selectedValues={filter.token}
              setSelectedValues={(token) =>
                setFilter((prev) => ({ ...prev, token }))
              }
              isMultiselect={true}
              options={tokens.map((token: FT) => {
                const address = token.getTokenAddress()
                const chainId = token.getChainId()
                const value =
                  address === EVM_NATIVE || address === ETH_NATIVE_ID
                    ? `${address}_${chainId}`
                    : address.toLowerCase()

                return {
                  label: token.getTokenName(),
                  value,
                  icon: token.getTokenLogo(),
                  symbol: token.getTokenSymbol(),
                  chainId,
                }
              })}
            />
          </div>
          <div className="mb-2.5">
            <p className="mb-1 text-xs">Transaction type</p>
            <DropdownSelect
              options={txOptions}
              selectedValues={filter.tx}
              setSelectedValues={(tx) => setFilter((prev) => ({ ...prev, tx }))}
              placeholder="All"
            />
          </div>
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
