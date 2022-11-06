import clsx from "clsx"

import { Button } from "frontend/ui/atoms/button"
import { DropdownSelect } from "frontend/ui/atoms/dropdown-select"
import { ApplicationMeta } from "frontend/ui/molecules/application-meta"
import { IOption } from "frontend/ui/molecules/input-dropdown"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"

import LoaderIcon from "./loader.svg"
import NFIDLogo from "./nfid.svg"

export interface SDKRequestAccountsPageProps {
  applicationName?: string
  applicationLogo?: string
  onReject: () => void
  onApprove: () => void
  accountsOptions: IOption[]
  selectedAccounts: string[]
  setSelectedAccounts: (value: string[]) => void
  isLoading: boolean
}

export const SDKRequestAccountsPage: React.FC<SDKRequestAccountsPageProps> = ({
  applicationLogo,
  applicationName,
  onReject,
  onApprove,
  accountsOptions,
  selectedAccounts,
  setSelectedAccounts,
  isLoading = false,
}) => {
  return (
    <ScreenResponsive frameLabel="Approve with NFID">
      <div
        className={clsx(
          "flex flex-col flex-grow lg:justify-between",
          "h-full p-5",
        )}
      >
        <div>
          <ApplicationMeta
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
                <img
                  src={LoaderIcon}
                  alt="loading"
                  className={clsx(
                    "absolute -right-1 -bottom-1",
                    "animate-spin",
                    !isLoading && "hidden",
                  )}
                />
              </div>
              <div>
                <p className="text-sm font-semibold">View your Web3 balance</p>
                <p className="text-xs text-gray-400">
                  This site will see tokens and history from your selected
                  accounts
                </p>
              </div>
            </div>
            <DropdownSelect
              isSearch
              options={accountsOptions}
              selectedValues={selectedAccounts}
              setSelectedValues={setSelectedAccounts}
              placeholder="None selected - connect anonymously"
              disabled={isLoading}
            />
          </div>
        </div>
        <div
          className={clsx(
            "grid grid-cols-2 gap-5 mt-5 lg:mt-32",
            isLoading && "hidden",
          )}
        >
          <Button stroke onClick={onReject}>
            Reject
          </Button>
          <Button primary onClick={onApprove}>
            Approve
          </Button>
        </div>

        <Button
          className={clsx("mt-5 lg:mt-32", !isLoading && "hidden")}
          disabled
          block
          primary
        >
          In progress...
        </Button>
      </div>
    </ScreenResponsive>
  )
}
