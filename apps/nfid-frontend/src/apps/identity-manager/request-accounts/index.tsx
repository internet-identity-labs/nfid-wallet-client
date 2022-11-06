import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"
import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

import { icpToUSD } from "frontend/integration/rosetta/hooks/use-balance-icp-all"
import { useICPExchangeRate } from "frontend/integration/rosetta/hooks/use-icp-exchange-rate"
import { useAllWallets } from "frontend/integration/wallet/hooks/use-all-wallets"
import { IOption } from "frontend/ui/atoms/dropdown-select"
import { SDKRequestAccountsPage } from "frontend/ui/pages/request-accounts"
import { RequestTransferPage } from "frontend/ui/pages/request-transfer"
import { isHex } from "frontend/ui/utils"

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
  const [isLoading, setIsLoading] = useState(false)
  const { wallets } = useAllWallets()

  const accountsOptions: IOption[] | undefined = useMemo(() => {
    return wallets?.map((wallet) => ({
      label: wallet.label ?? "",
      value: wallet.principal?.toText() ?? "",
      afterLabel: wallet.balance.value,
    }))
  }, [wallets])

  return (
    <SDKRequestAccountsPage
      applicationName={applicationName}
      applicationLogo={applicationLogo}
      onReject={() => window.close()}
      onApprove={function (): void {
        throw new Error("Function not implemented.")
      }}
      accountsOptions={accountsOptions ?? []}
      selectedAccounts={selectedAccounts}
      setSelectedAccounts={setSelectedAccounts}
      isLoading={isLoading}
    />
  )
}
