import { DropdownSelect } from "@nfid-frontend/ui"

interface IModalOption {
  label: string
  afterLabel?: string | number
  icon?: string
  value: string
  disabled?: boolean
}

interface ICollectiblesModal {
  setBlockchainFilter: (value: string[]) => void
  setCollectionsFilter: (value: string[]) => void
  setWalletsFilter: (value: string[]) => void
  blockchainOptions: IModalOption[]
  collectionsOptions: IModalOption[]
  walletOptions: IModalOption[]
  blockchainFilter: string[]
  collectionsFilter: string[]
  walletsFilter: string[]
}

export const CollectiblesModal = ({
  setBlockchainFilter,
  setCollectionsFilter,
  setWalletsFilter,
  blockchainOptions,
  collectionsOptions,
  walletOptions,
  blockchainFilter,
  collectionsFilter,
  walletsFilter,
}: ICollectiblesModal) => {
  return (
    <div className="space-y-2">
      <DropdownSelect
        label="Blockchain"
        options={blockchainOptions}
        selectedValues={blockchainFilter}
        setSelectedValues={setBlockchainFilter}
        id={"blockchain-filter"}
      />
      <DropdownSelect
        options={collectionsOptions}
        label="Collections"
        setSelectedValues={setCollectionsFilter}
        selectedValues={collectionsFilter}
        isSearch
        bordered
      />
    </div>
  )
}
