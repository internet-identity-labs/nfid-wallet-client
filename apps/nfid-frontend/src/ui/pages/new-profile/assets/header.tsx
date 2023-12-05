import { FilterPopover } from "@nfid-frontend/ui"
import { DropdownSelect, IconCmpFilters, IOption } from "@nfid-frontend/ui"

import { AssetFilter } from "frontend/ui/connnector/types"

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
    </div>
  )
}
