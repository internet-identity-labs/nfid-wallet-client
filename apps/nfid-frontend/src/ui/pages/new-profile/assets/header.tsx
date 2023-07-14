import { FilterPopover } from "@nfid-frontend/ui"
import {
  DropdownSelect,
  IconCmpFilters,
  IOption,
  Tooltip,
} from "@nfid-frontend/ui"

import { AssetFilter } from "frontend/ui/connnector/types"

import ActionIcon from "./actions-icon.svg"

interface IProfileAssetsHeader {
  blockchainOptions: IOption[]
  blockchainFilter: string[]
  setBlockchainFilter: (value: string[]) => void
  accountsOptions: IOption[]
  assetFilter: AssetFilter[]
  setAssetFilter: (value: AssetFilter[]) => void
  resetFilters: () => void
}

export const ProfileAssetsHeader = ({
  accountsOptions,
  assetFilter,
  setAssetFilter,
  blockchainFilter,
  blockchainOptions,
  setBlockchainFilter,
  resetFilters,
}: IProfileAssetsHeader) => {
  return (
    <div className="flex items-center justify-between w-full">
      <p>Your tokens</p>
      <div className="flex items-center">
        <div className="flex justify-center cursor-pointer" id="asset_filter">
          <FilterPopover
            onReset={() => resetFilters()}
            trigger={<IconCmpFilters />}
            align="end"
          >
            <DropdownSelect
              label="Blockchain"
              options={blockchainOptions}
              selectedValues={blockchainFilter}
              setSelectedValues={setBlockchainFilter}
              id="blockchain_filter"
            />
            <DropdownSelect
              label="Account"
              options={accountsOptions}
              selectedValues={assetFilter.map((item) => item?.principal ?? "")}
              setSelectedValues={(values) =>
                setAssetFilter(values.map((item) => ({ principal: item })))
              }
              id="account_filter"
            />
          </FilterPopover>
        </div>
        <Tooltip
          tip={
            <div>
              Transaction history for the DIP-20
              <br /> token standard is not supported.
            </div>
          }
        >
          <div className="ml-2 cursor-pointer">
            <img src={ActionIcon} alt="ActionIcon" />
          </div>
        </Tooltip>
      </div>
    </div>
  )
}
