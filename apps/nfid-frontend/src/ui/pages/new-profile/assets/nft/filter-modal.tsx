import { DropdownSelect } from "@nfid-frontend/ui"

interface IModalOption {
  label: string
  afterLabel?: string | number
  icon?: string
  value: string
  disabled?: boolean
}

interface IAssetsModal {
  blockchainOptions: IModalOption[]
  accountOptions: IModalOption[]
  blockchainFilter: string[]
  accountFilter: string[]
  setBlockchainFilter: (value: string[]) => void
  setAccountFilter: (value: string[]) => void
}

export const AssetsModal = ({
  blockchainOptions,
  accountOptions,
  blockchainFilter,
  accountFilter,
  setBlockchainFilter,
  setAccountFilter,
}: IAssetsModal) => {
  return (
    <div className="my-4 space-y-2">
      <DropdownSelect
        label="Blockchain"
        options={blockchainOptions}
        selectedValues={blockchainFilter}
        setSelectedValues={setBlockchainFilter}
      />
      <DropdownSelect
        label="Blockchain"
        options={accountOptions}
        selectedValues={accountFilter}
        setSelectedValues={setAccountFilter}
      />
    </div>
  )
}
