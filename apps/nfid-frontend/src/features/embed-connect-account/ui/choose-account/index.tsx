import { useCallback, useEffect, useMemo, useState } from "react"

import { IGroupedOptions, IGroupOption } from "@nfid-frontend/ui"
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
import { Account, getScope, getWalletName } from "@nfid/integration"
import { toPresentation } from "@nfid/integration/token/icp"

import { toUSD } from "frontend/features/fungable-token/accumulate-app-account-balances"
import { useICPExchangeRate } from "frontend/features/fungable-token/icp/hooks/use-icp-exchange-rate"
import { useUserBalances } from "frontend/features/fungable-token/icp/hooks/use-user-balances"
import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { sortAlphabetic } from "frontend/ui/utils/sorting"

interface IChooseAccount {
  applicationLogo?: string
  applicationName?: string
  applicationURL?: string
  onConnectionDetails: () => void
  onConnectAnonymously: () => void
  onConnect: (hostname: string, accountId: string) => void
  accounts?: Account[]
}

export const ChooseAccount = ({
  applicationLogo,
  applicationName,
  applicationURL,
  onConnectAnonymously,
  onConnectionDetails,
  onConnect,
  accounts,
}: IChooseAccount) => {
  const { balances: wallets } = useUserBalances()
  const { exchangeRate } = useICPExchangeRate()

  const applications = useApplicationsMeta()
  const [selectedAccount, setSelectedAccount] = useState("")

  const accountsOptions: IGroupedOptions[] = useMemo(() => {
    if (!exchangeRate || !wallets) return []

    return [
      {
        label: "Public",
        options:
          wallets
            .filter((wallet) => wallet.account.domain === "nfid.one")
            .map(
              (account) =>
                ({
                  title: getWalletName(
                    applications.applicationsMeta ?? [],
                    account.account.domain,
                    account.account.accountId,
                  ),
                  value: account.principalId,
                  subTitle: truncateString(account.principalId, 5),
                  innerTitle: toPresentation(account.balance["ICP"]).toString(),
                  innerSubtitle: toUSD(
                    toPresentation(account.balance["ICP"]),
                    exchangeRate,
                  ),
                } as IGroupOption),
            )
            .sort(sortAlphabetic(({ title }) => title ?? "")) || [],
      },
      {
        label: "Anonymous",
        options:
          accounts?.map((acc) => ({
            title: `${applicationName} ${acc.label}`,
            value: getScope(acc.domain, acc.accountId),
          })) ?? [],
      },
    ]
  }, [
    accounts,
    applicationName,
    applications.applicationsMeta,
    exchangeRate,
    wallets,
  ])

  const handleConnect = useCallback(() => {
    const account = wallets?.find((acc) => acc.principalId === selectedAccount)
    if (account)
      return onConnect(account?.account.domain, account?.account.accountId)

    const acc = accounts?.find(
      (acc) => getScope(acc.domain, acc.accountId) === selectedAccount,
    )
    return onConnect(acc?.domain ?? "", acc?.accountId ?? "")
  }, [accounts, onConnect, selectedAccount, wallets])

  useEffect(() => {
    accountsOptions.length &&
      setSelectedAccount(accountsOptions[0].options[0]?.value)
  }, [accountsOptions])

  return (
    <BlurredLoader
      className="p-0"
      isLoading={!wallets?.length || !exchangeRate}
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
                  target="_blank"
                  rel="noreferrer"
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
      <Button className="w-full mt-3" onClick={handleConnect}>
        Connect
      </Button>
      <Button
        type="ghost"
        block
        className="mt-3"
        onClick={onConnectAnonymously}
      >
        Connect anonymously
      </Button>
    </BlurredLoader>
  )
}
