import { useState } from "react"

import { IconCmpFilters, ModalAdvanced, Tooltip } from "@nfid-frontend/ui"

import ActionIcon from "../actions-icon.svg"
import { AssetsModal } from "./filter-modal"

export const NftsTitle = () => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  return (
    <div className="flex items-center justify-between w-full">
      <p>Your tokens</p>
      <div className="flex items-center">
        <div className="cursor-pointer">
          <ModalAdvanced
            isModalOpen={isFiltersOpen}
            isModalOpenChange={setIsFiltersOpen}
            secondaryButton={{
              type: "stroke",
              // кнопка скинути
              onClick: () => setIsFiltersOpen(false),
              text: "Reset filter",
              id: "reset-filters-button",
              block: true,
            }}
            primaryButton={{
              type: "primary",
              // кнопка застосувати
              onClick: () => setIsFiltersOpen(false),
              text: "Apply",
              id: "apply-filters-button",
              block: true,
            }}
            trigger={<IconCmpFilters />}
            title="Filter"
          >
            <AssetsModal
              // фільтри
              blockchainOptions={[]}
              accountOptions={[]}
              blockchainFilter={[]}
              accountFilter={[]}
              setBlockchainFilter={function (value: string[]): void {
                throw new Error("Function not implemented.")
              }}
              setAccountFilter={function (value: string[]): void {
                throw new Error("Function not implemented.")
              }}
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
            <img src={ActionIcon} alt="ActionIcon" />
          </div>
        </Tooltip>
      </div>
    </div>
  )
}
