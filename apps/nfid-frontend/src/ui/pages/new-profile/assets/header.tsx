import { useState } from "react"

import { Image } from "@nfid-frontend/ui"
import {
  DropdownSelect,
  IconCmpFilters,
  IOption,
  ModalAdvanced,
  Tooltip,
} from "@nfid-frontend/ui"

import ActionIcon from "./actions-icon.svg"

interface IProfileAssetsHeader {
  blockchainOptions: IOption[]
  blockchainFilter: string[]
  setBlockchainFilter: (value: string[]) => void
  resetFilters: () => void
}

export const ProfileAssetsHeader = ({
  blockchainFilter,
  blockchainOptions,
  setBlockchainFilter,
  resetFilters,
}: IProfileAssetsHeader) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  return (
    <div className="flex items-center justify-between w-full">
      <p>Your tokens</p>
      <div className="flex items-center">
        <div className="cursor-pointer" id="asset_filter">
          <ModalAdvanced
            isModalOpen={isFiltersOpen}
            isModalOpenChange={setIsFiltersOpen}
            secondaryButton={{
              type: "stroke",
              onClick: () => resetFilters(),
              text: "Reset filter",
              id: "reset-filters-button",
              block: true,
            }}
            primaryButton={{
              type: "primary",
              onClick: () => setIsFiltersOpen(false),
              text: "Apply",
              id: "apply-filters-button",
              block: true,
            }}
            trigger={<IconCmpFilters />}
            title="Filter"
          >
            <DropdownSelect
              label="Blockchain"
              options={blockchainOptions}
              selectedValues={blockchainFilter}
              setSelectedValues={setBlockchainFilter}
            />
          </ModalAdvanced>
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
            <Image src={ActionIcon} alt="ActionIcon" />
          </div>
        </Tooltip>
      </div>
    </div>
  )
}
