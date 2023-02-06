import {
  IGroupedOptions,
  IGroupOption,
} from "packages/ui/src/molecules/choose-modal/types"
import { useMemo, useState } from "react"

import {
  BlurredLoader,
  Button,
  ChooseModal,
  IconCmpAlertCircle,
  IconCmpInfo,
  SDKApplicationMeta,
  Tooltip,
} from "@nfid-frontend/ui"
import { truncateString } from "@nfid-frontend/utils"
import { toPresentation } from "@nfid/integration/token/icp"

import { toUSD } from "frontend/features/fungable-token/accumulate-app-account-balances"
import { useICPExchangeRate } from "frontend/features/fungable-token/icp/hooks/use-icp-exchange-rate"
import { useAllWallets } from "frontend/integration/wallet/hooks/use-all-wallets"

interface IChooseAccount {
  applicationLogo?: string
  applicationName?: string
  applicationURL?: string
  onConnectionDetails: () => void
}

export const ChooseAccount = ({
  applicationLogo,
  applicationName,
  applicationURL,
  onConnectionDetails,
}: IChooseAccount) => {
  // I use hooks here, because it is the easiest way to achieve the goal
  // We don't have needed services for this
  const { wallets, isLoading } = useAllWallets()
  const { exchangeRate, isValidating: isExchangeRateLoading } =
    useICPExchangeRate()

  const [selectedAccount, setSelectedAccount] = useState("")

  const accountsOptions: IGroupedOptions[] = useMemo(() => {
    if (!exchangeRate || !wallets) return []

    return [
      {
        label: "Public",
        options: wallets.map(
          (account) =>
            ({
              title: account.label,
              value: account.principalId,
              subTitle: truncateString(account.principalId, 5),
              innerTitle: toPresentation(account.balance["ICP"]).toString(),
              innerSubtitle: toUSD(
                toPresentation(account.balance["ICP"]),
                exchangeRate,
              ),
            } as IGroupOption),
        ),
      },
    ]
  }, [exchangeRate, wallets])

  return (
    <BlurredLoader
      className="p-0"
      isLoading={isLoading || isExchangeRateLoading}
    >
      <div className="flex justify-between">
        <div>
          <SDKApplicationMeta
            applicationLogo={applicationLogo}
            applicationName={applicationName}
            title="Choose an account"
            subTitle={
              <>
                to connect to{" "}
                <a
                  className="text-blue hover:opacity-70"
                  href={`https://${applicationURL}`}
                >
                  {applicationURL}
                </a>
              </>
            }
          />
        </div>
        <Tooltip
          tip={
            <div>
              Connect anonymously — сreate an account <br /> for exclusive use
              with this application.
            </div>
          }
        >
          <IconCmpInfo className="cursor-pointer hover:opacity-70" />
        </Tooltip>
      </div>
      <ChooseModal
        title="Choose an account"
        label="Account"
        optionGroups={accountsOptions}
        onSelect={(value) => setSelectedAccount(value)}
      />
      <div className="rounded-md bg-gray-50 p-5 text-gray-500 text-sm mt-3.5 space-y-3">
        <p>
          Only connect to sites that you trust. By connecting, you allow
          {applicationURL} to:
        </p>
        <div className="flex items-center space-x-1">
          <IconCmpAlertCircle className="text-checkMarkColor" />
          <p>See your balance and activity</p>
        </div>
        <div className="flex items-center space-x-1">
          <IconCmpAlertCircle className="text-checkMarkColor" />
          <p>Request approval for transactions</p>
        </div>
        <p
          className="cursor-pointer text-blue hover:opacity-70"
          onClick={onConnectionDetails}
        >
          Connection details
        </p>
      </div>
      <Button className="w-full mt-3">Connect</Button>
      <Button type="ghost" block className="mt-3">
        Connect anonymously
      </Button>
    </BlurredLoader>
  )
}
