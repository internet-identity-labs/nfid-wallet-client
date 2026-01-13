import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"

import React from "react"

import { getWalletName } from "@nfid/integration"
import { sortAlphabetic, keepStaticOrder } from "@nfid/ui/utils/sorting"

import { TokenBalance } from "frontend/features/fungible-token/fetch-balances"
import { useUserBalances } from "frontend/features/fungible-token/icp/hooks/use-user-balances"
import { useAllVaultsWallets } from "frontend/features/vaults/hooks/use-vaults-wallets-balances"
import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"

export type Wallet = {
  principal: Principal
  principalId: string
  balance: TokenBalance
  label: string
  accountId: string
  domain: string
  isVaultWallet?: boolean
  address?: string
  vaultId?: bigint
  vaultName?: string
}

export const useAllWallets = () => {
  const { balances, isLoading } = useUserBalances()
  const { balances: vaultsBalances, isLoading: isAllWalletsLoading } =
    useAllVaultsWallets()

  const applications = useApplicationsMeta()

  const wallets = React.useMemo(() => {
    if (!balances || !vaultsBalances) return []

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
      .concat(
        vaultsBalances?.map(({ principal, account, address, ...rest }) => ({
          label: account.label,
          accountId: account.accountId,
          domain: account.domain,
          principal,
          address: address ?? account.accountId,
          isVaultWallet: true,
          ...rest,
        })) ?? [],
      )
    return keepStaticOrder<Wallet>(
      ({ label }) => label ?? "",
      ["NFID", "NNS"],
    )(wallets || [])
  }, [applications.applicationsMeta, balances, vaultsBalances])

  return { wallets, isLoading: isLoading || isAllWalletsLoading }
}
