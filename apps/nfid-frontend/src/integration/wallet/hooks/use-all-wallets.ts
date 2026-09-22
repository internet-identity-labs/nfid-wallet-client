import { AccountIdentifier } from "@icp-sdk/canisters/ledger/icp"
import { Principal } from "@icp-sdk/core/principal"
import React from "react"

import { getWalletName } from "@nfid/integration"

import { TokenBalance } from "frontend/features/fungible-token/fetch-balances"
import { useUserBalances } from "frontend/features/fungible-token/icp/hooks/use-user-balances"
import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { sortAlphabetic, keepStaticOrder } from "@nfid-frontend/ui"

export type Wallet = {
  principal: Principal
  principalId: string
  balance: TokenBalance
  label: string
  accountId: string
  domain: string
  address?: string
}

export const useAllWallets = () => {
  const { balances, isLoading } = useUserBalances()

  const applications = useApplicationsMeta()

  const wallets = React.useMemo(() => {
    if (!balances) return []

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
        address: AccountIdentifier.fromPrincipal({ principal }).toHex(),

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
