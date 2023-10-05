import { principalToAddress } from "ictool"
import { useCallback, useMemo, useState } from "react"

import { IOption } from "@nfid-frontend/ui"
import { toPresentation } from "@nfid/integration/token/icp"

import { useAllWallets } from "frontend/integration/wallet/hooks/use-all-wallets"
import { SDKRequestAccountsPage } from "frontend/ui/pages/request-accounts"
import { useTimer } from "frontend/ui/utils/use-timer"

interface IRequestAccounts {
  applicationName?: string
  applicationLogo?: string
  onSuccess: (accounts: string[]) => void
}

export const RequestAccounts = ({
  applicationLogo,
  applicationName,
  onSuccess,
}: IRequestAccounts) => {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const { wallets } = useAllWallets()
  const { counter, setCounter } = useTimer({ defaultCounter: -1 })

  const accountsOptions: IOption[] | undefined = useMemo(() => {
    return wallets?.map((wallet) => ({
      label: wallet.label ?? "",
      value: principalToAddress(wallet.principal) ?? "",
      afterLabel: `${toPresentation(wallet.balance["ICP"])} ICP`,
    }))
  }, [wallets])

  const onApprove = useCallback(() => {
    setCounter(5)
    setTimeout(() => {
      return onSuccess(selectedAccounts)
    }, 5000)
  }, [setCounter, onSuccess, selectedAccounts])

  return (
    <SDKRequestAccountsPage
      applicationName={applicationName}
      applicationLogo={applicationLogo}
      onReject={() => window.close()}
      onApprove={onApprove}
      accountsOptions={accountsOptions ?? []}
      selectedAccounts={selectedAccounts}
      setSelectedAccounts={setSelectedAccounts}
      timer={counter}
    />
  )
}
