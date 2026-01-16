import clsx from "clsx"

import {
  DropdownSelect,
  IOption,
  ApproveTemplate,
  SDKStatusbar,
} from "@nfid-frontend/ui"
import { WALLET_FEE } from "@nfid/integration/token/constants"

import { Copy } from "../../atoms/copy"

export interface IRequestTransferPage {
  applicationName: string
  applicationLogo: string
  amountICP: number
  amountUSD: string
  walletOptions: IOption[]
  selectedWallets: string[]
  setSelectedWallets: (value: string[]) => void
  onReject: () => void
  onApprove: () => void
  isLoading?: boolean
  destinationAddress: string
  successTimer: number
  isInsufficientFunds: boolean
}

export const RequestTransferPage: React.FC<IRequestTransferPage> = ({
  applicationName,
  applicationLogo,
  amountICP,
  amountUSD,
  walletOptions,
  selectedWallets,
  setSelectedWallets,
  onReject,
  onApprove,
  isLoading = false,
  destinationAddress,
  successTimer,
  isInsufficientFunds,
}) => {
  return (
    <ApproveTemplate
      applicationName={applicationName}
      applicationLogo={applicationLogo}
      onReject={onReject}
      onApprove={!isInsufficientFunds ? onApprove : () => {}}
      isLoading={isLoading}
      successTimer={successTimer}
    >
      <SDKStatusbar isLoading={isLoading} isSuccess={successTimer !== -1}>
        <div className="flex items-center justify-between w-full">
          <p className="text-sm font-semibold">Transfer</p>
          <p className="text-sm">
            {amountICP}
            {" ICP "}
            <span className="text-xs text-secondary">≈ {amountUSD} </span>
          </p>
        </div>
      </SDKStatusbar>
      <p className="mb-1 text-sm">From</p>
      <DropdownSelect
        disabled={isLoading || successTimer !== -1}
        isSearch
        isMultiselect={false}
        options={walletOptions}
        selectedValues={selectedWallets}
        setSelectedValues={setSelectedWallets}
        firstSelected
        errorText={isInsufficientFunds ? "Insufficient funds" : undefined}
      />
      <p className="mt-2 mb-1 text-sm">To</p>
      <div
        className={clsx(
          "h-10 text-secondary bg-gray-100 rounded-md",
          "flex items-center justify-between px-2.5 space-x-2",
        )}
        id="account-id"
      >
        <p className="overflow-hidden text-sm text-ellipsis whitespace-nowrap">
          {destinationAddress}
        </p>
        <Copy
          className="w-[18px] h-[18px] flex-shrink-0"
          value={destinationAddress}
        />
      </div>
      <div className="text-xs text-secondary mt-2.5">
        Transfer fee: {WALLET_FEE} ICP
      </div>
    </ApproveTemplate>
  )
}
