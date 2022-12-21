import { Principal } from "@dfinity/principal"
import React from "react"

import { getWalletName } from "@nfid/integration"
import { TokenBalance } from "@nfid/integration/token/fetch-balances"

import { useUserBalances } from "frontend/features/fungable-token/icp/hooks/use-user-balances"
import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { sortAlphabetic, keepStaticOrder } from "frontend/ui/utils/sorting"

type Wallet = {
  principal: Principal
  principalId: string
  balance: TokenBalance
  label: string
  accountId: string
  domain: string
}

export const useAllWallets = () => {
  const { balances, isLoading } = useUserBalances()

  const applications = useApplicationsMeta()

  const wallets = React.useMemo(() => {
    const wallets = balances
      ?.map(({ principal, account, ...rest }) => ({
        label: getWalletName(
          applications.applicationsMeta ?? [],
          account.domain,
          account.accountId,
        ),
        accountId: account.accountId,
        domain: account.domain,
        principal,
        ...rest,
      }))
      .sort(sortAlphabetic(({ label }) => label ?? ""))
    return keepStaticOrder<Wallet>(
      ({ label }) => label ?? "",
      ["NFID", "NNS"],
    )(wallets || [])
  }, [applications.applicationsMeta, balances])

  return { wallets, isLoading }
}
