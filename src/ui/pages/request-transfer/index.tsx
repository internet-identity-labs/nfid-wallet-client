import clsx from "clsx"

import ICPIcon from "frontend/assets/dfinity.svg"
import { walletFee } from "frontend/constants/wallet"
import { Button } from "frontend/ui/atoms/button"
import { DropdownSelect, IOption } from "frontend/ui/atoms/dropdown-select"
import { ApplicationMeta } from "frontend/ui/molecules/application-meta"
import { TransferModalSuccess } from "frontend/ui/organisms/transfer-modal/sucess"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"

export interface IRequestTransferPage {
  applicationName: string
  applicationLogo: string
  amountICP: string
  amountUSD: string
  walletOptions: IOption[]
  selectedWallets: string[]
  setSelectedWallets: (value: string[]) => void
  onReject: () => void
  onApprove: () => void
  isSuccess: boolean
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
  isSuccess,
}) => {
  return (
    <ScreenResponsive
      frameLabel="Approve with NFID"
      className="flex flex-col flex-grow p-5"
    >
      {isSuccess ? (
        <TransferModalSuccess
          transactionMessage={`${amountICP} ICP was sent`}
          onClose={onReject}
        />
      ) : (
        <div
          className={clsx(
            "flex flex-col flex-grow lg:justify-between",
            "h-full",
          )}
        >
          <div>
            <ApplicationMeta
              applicationLogo={applicationLogo}
              title={applicationName}
              subTitle="want to perform the following actions:"
            />
            <div
              className={clsx(
                "border border-gray-300 rounded-md p-3",
                "flex flex-col space-y-2.5 mt-2",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={clsx(
                      "h-10 w-10 bg-gray-100 rounded-full",
                      "flex items-center justify-center",
                    )}
                  >
                    <img className="w-6" src={ICPIcon} alt="icp" />
                  </div>
                  <p className="text-sm font-semibold">Transfer</p>
                </div>
                <p className="text-sm">
                  {amountICP}
                  {" ICP "}
                  <span className="text-xs text-gray-400">≈ ${amountUSD} </span>
                </p>
              </div>
              <DropdownSelect
                isMultiselect={false}
                options={walletOptions}
                selectedValues={selectedWallets}
                setSelectedValues={setSelectedWallets}
                firstSelected
              />
              <div className="text-xs text-gray-400">
                Transfer fee: {walletFee} ICP
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5 mt-5 lg:mt-32">
            <Button stroke onClick={onReject}>
              Reject
            </Button>
            <Button primary onClick={onApprove}>
              Approve
            </Button>
          </div>
        </div>
      )}
    </ScreenResponsive>
  )
}
