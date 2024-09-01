import clsx from "clsx"
import { ButtonAlt } from "packages/ui/src/atoms/button"

import { IOption, DropdownSelect, SDKApplicationMeta } from "@nfid-frontend/ui"
import { ScreenResponsive } from "@nfid-frontend/ui"

import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import NFIDLogo from "./nfid.svg"

export interface SDKRequestAccountsPageProps {
  applicationName?: string
  applicationLogo?: string
  onReject: () => void
  onApprove: () => void
  accountsOptions: IOption[]
  selectedAccounts: string[]
  setSelectedAccounts: (value: string[]) => void
  timer: number | boolean
}

export const SDKRequestAccountsPage: React.FC<SDKRequestAccountsPageProps> = ({
  applicationLogo,
  applicationName,
  onReject,
  onApprove,
  accountsOptions,
  selectedAccounts,
  setSelectedAccounts,
  timer = false,
}) => {
  return (
    <ScreenResponsive frameLabel="Approve with NFID">
      <BlurredLoader isLoading={!accountsOptions.length}>
        <div
          className={clsx(
            "flex flex-col flex-grow lg:justify-between",
            "h-full",
          )}
        >
          <div>
            <SDKApplicationMeta
              applicationLogo={applicationLogo}
              title={applicationName}
              subTitle="wants to perform the following actions:"
            />
            <div
              className={clsx("border border-gray-300 rounded-md", "p-3 mt-4")}
            >
              <div className="flex space-x-2.5 mb-2.5">
                <div
                  className={clsx(
                    "w-10 h-10 bg-gray-50 rounded-full",
                    "flex items-center justify-center",
                    "relative",
                  )}
                >
                  <img className="w-6" src={NFIDLogo} alt="nfid" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    View your Web3 balance
                  </p>
                  <p className="text-xs text-secondary">
                    This site will see tokens and history from your selected
                    accounts
                  </p>
                </div>
              </div>
              <DropdownSelect
                disabled={timer !== -1}
                isSearch
                options={accountsOptions}
                selectedValues={selectedAccounts}
                setSelectedValues={setSelectedAccounts}
                placeholder="None selected - connect anonymously"
                showSelectAllOption
              />
            </div>
          </div>
          <div
            className={clsx(
              "grid grid-cols-2 gap-5 mt-5 lg:mt-32",
              timer !== -1 && "hidden",
            )}
          >
            <ButtonAlt stroke onClick={onReject}>
              Reject
            </ButtonAlt>
            <ButtonAlt primary onClick={onApprove}>
              Approve
            </ButtonAlt>
          </div>

          <ButtonAlt
            className={clsx("mt-5 lg:mt-32", timer === -1 && "hidden")}
            block
            primary
          >
            Success! Closing in {timer}
          </ButtonAlt>
        </div>
      </BlurredLoader>
    </ScreenResponsive>
  )
}
