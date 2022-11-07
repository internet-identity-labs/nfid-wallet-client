import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

import { icpToUSD } from "frontend/integration/rosetta/hooks/use-balance-icp-all"
import { useICPExchangeRate } from "frontend/integration/rosetta/hooks/use-icp-exchange-rate"
import { useAllWallets } from "frontend/integration/wallet/hooks/use-all-wallets"
import { IOption } from "frontend/ui/atoms/dropdown-select"
import { SDKRequestAccountsPage } from "frontend/ui/pages/request-accounts"
import { RequestTransferPage } from "frontend/ui/pages/request-transfer"
import { isHex } from "frontend/ui/utils"
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
      value: wallet.principal?.toText() ?? "",
      afterLabel: wallet.balance.value,
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
